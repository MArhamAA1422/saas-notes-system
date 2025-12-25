import type { HttpContext } from '@adonisjs/core/http'
import Note from '#models/note'
import Workspace from '#models/workspace'
import Tag from '#models/tag'
import { createNoteValidator } from '#validators/note/create_note'
import { updateNoteValidator } from '#validators/note/update_note'
import { DateTime } from 'luxon'
import { noteContentValidator } from '#validators/note/note_content'

export default class NotesController {
   /**
    * Get all notes in a workspace
    * GET /api/workspaces/:workspaceId/notes
    */
   async index({ params, request, response, currentUser }: HttpContext) {
      try {
         const workspaceId = params.workspaceId

         const {
            page = 1,
            perPage = 10,
            search,
         } = await request.validateUsing(noteContentValidator)

         const workspace = await Workspace.query()
            .where('id', workspaceId)
            .where('tenant_id', currentUser!.tenantId)
            .whereNull('deleted_at')
            .firstOrFail()

         const query = Note.query()
            .where('workspace_id', workspace.id)
            .where('status', 'published')
            .whereNull('deleted_at')
            .preload('tags', (tagsQuery) => {
               tagsQuery.select('id', 'name')
            })
            .preload('user', (userQuery) => {
               userQuery.select('id', 'full_name')
            })

         // Search by title
         if (search) {
            query.whereILike('title', `%${search}%`)
         }

         // Paginate
         const notes = await query.paginate(page, perPage)

         return response.ok({
            workspace: {
               id: workspace.id,
               name: workspace.name,
            },
            pagination: {
               total: notes.total,
               perPage: notes.perPage,
               currentPage: notes.currentPage,
               lastPage: notes.lastPage,
            },
            notes: notes.all(),
         })
      } catch (error) {
         if (error.name === 'ModelNotFoundException') {
            return response.notFound({
               error: 'Not Found',
               message: 'Workspace not found or access denied',
            })
         }

         // console.error(error)
         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong while fetching notes',
         })
      }
   }

   /**
    * Get single note
    * GET /api/notes/:id
    */
   async show({ params, response, currentUser }: HttpContext) {
      // console.log('here')
      try {
         const note = await Note.query()
            .where('id', params.id)
            .whereNull('deleted_at')
            .preload('workspace')
            .preload('votes')
            .preload('tags', (query) => {
               query.select('name')
            })
            .firstOrFail()

         // await note.load('workspace')

         // console.log(note)

         if (note.workspace.tenantId !== currentUser!.tenantId) {
            return response.forbidden({
               error: 'Forbidden',
               message: 'Access denied',
            })
         }

         if (
            (note.visibility === 'private' || note.status === 'draft') &&
            note.userId !== currentUser!.id
         ) {
            return response.forbidden({
               error: 'Forbidden',
               message: 'This note is private',
            })
         }

         return response.ok({
            note: {
               workspaceId: note.workspaceId,
               userId: note.userId,
               title: note.title,
               content: note.content,
               status: note.status,
               voteCount: note.voteCount,
               tags: note.tags,
            },
         })
      } catch (error) {
         if (error.name === 'ModelNotFoundException') {
            return response.notFound({
               error: 'Not Found',
               message: 'Note not found',
            })
         }

         // console.error(error)
         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong while fetching the note',
         })
      }
   }

   /**
    * Get user's own notes by type (draft or published)
    * GET /api/notes/:type
    */
   async getUserNotes({ params, response, currentUser, request }: HttpContext) {
      const { type } = params

      const { page, perPage, search } = await request.validateUsing(noteContentValidator)

      if (!['draft', 'published'].includes(type)) {
         return response.badRequest({
            error: 'Bad Request',
            message: 'Type must be either "draft" or "published"',
         })
      }

      const status = type === 'draft' ? 'draft' : 'published'

      const query = Note.query()
         .where('user_id', currentUser!.id)
         .where('status', status)
         .whereNull('deleted_at')
         .preload('workspace', (workspaceQuery) => {
            workspaceQuery.select('id', 'name')
         })
         .preload('tags')
         .select(
            'id',
            'workspace_id',
            'title',
            'content',
            'status',
            'visibility',
            'vote_count',
            'created_at',
            'updated_at'
         )
         .orderBy('updated_at', 'desc')

      if (search) {
         query.whereILike('title', `%${search}%`)
      }

      const notes = await query.paginate(page!, perPage)

      return response.ok({
         notes: notes.all(),
         pagination: {
            total: notes.total,
            perPage: notes.perPage,
            currentPage: notes.currentPage,
            lastPage: notes.lastPage,
            firstPage: 1,
         },
      })
   }

   /**
    * Create new note
    * POST /api/workspaces/:workspaceId/notes
    */
   async store({ params, request, response, currentUser }: HttpContext) {
      try {
         const workspaceId = params.workspaceId
         const payload = await request.validateUsing(createNoteValidator)

         // Verify workspace belongs to user's company
         const workspace = await Workspace.query()
            .where('id', workspaceId)
            .where('tenant_id', currentUser!.tenantId)
            .whereNull('deleted_at')
            .firstOrFail()

         // Create note
         const note = await Note.create({
            workspaceId: workspace.id,
            userId: currentUser!.id,
            title: payload.title,
            content: payload.content,
            status: payload.status || 'draft',
            visibility: payload.visibility || 'private',
         })

         // Handle tags
         if (payload.tags && payload.tags.length > 0) {
            await this.syncTags(note, payload.tags)
         }

         await note.load('tags')
         await note.load('user')

         return response.created({
            message: 'Note created successfully',
            note: {
               id: note.id,
               userId: note.userId,
            },
         })
      } catch (error) {
         if (error.name === 'ModelNotFoundException') {
            return response.notFound({
               error: 'Not Found',
               message: 'Workspace not found or not accessible',
            })
         } else if (error.messages) {
            // Validation errors from request.validateUsing()
            return response.badRequest({
               error: 'Validation Error',
               messages: error.messages,
            })
         }

         // console.error(error)
         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong while creating the note',
         })
      }
   }

   /**
    * Update note
    * PUT /api/notes/:id
    */
   async update({ params, request, response, currentUser }: HttpContext) {
      try {
         const note = await Note.query()
            .where('id', params.id)
            .whereNull('deleted_at')
            .preload('workspace')
            .firstOrFail()

         // Check workspace belongs to user's company
         if (note.workspace.tenantId !== currentUser!.tenantId) {
            return response.forbidden({
               error: 'Forbidden',
               message: 'Access denied',
            })
         }

         // Only owner can edit if private note
         if (note.visibility === 'private' && note.userId !== currentUser!.id) {
            return response.forbidden({
               error: 'Forbidden',
               message: 'Only the note owner can edit',
            })
         }

         const payload = await request.validateUsing(updateNoteValidator)

         // Set current user before updating (for history tracking)
         note.currentUserId = currentUser!.id

         // Update note
         note.merge({
            title: payload.title,
            content: payload.content,
            status: payload.status,
            visibility: payload.visibility,
         })
         await note.save()

         // Handle tags
         if (payload.tags !== undefined) {
            await this.syncTags(note, payload.tags)
         }

         await note.load('tags')
         await note.load('user')

         return response.ok({
            message: 'Note updated successfully',
         })
      } catch (error) {
         if (error.name === 'ModelNotFoundException') {
            return response.notFound({
               error: 'Not Found',
               message: 'Note not found',
            })
         } else if (error.messages) {
            // Validation errors
            return response.badRequest({
               error: 'Validation Error',
               messages: error.messages,
            })
         }

         // console.error(error)
         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong while updating the note',
         })
      }
   }

   /**
    * Auto-save note (for drafts)
    * PATCH /api/notes/:id/autosave
    */
   async autosave({ params, request, response, currentUser }: HttpContext) {
      try {
         const note = await Note.query()
            .where('id', params.id)
            .whereNull('deleted_at')
            .firstOrFail()

         // Check workspace belongs to user's company
         if (note.workspace.tenantId !== currentUser!.tenantId) {
            return response.forbidden({
               error: 'Forbidden',
               message: 'Access denied',
            })
         }

         // Check if user can edit this note
         if (note.visibility === 'private' && note.userId !== currentUser!.id) {
            return response.forbidden({
               error: 'Forbidden',
               message: 'You cannot edit this note',
            })
         }

         const { title, content, status, visibility } = request.body()

         // Set current user before updating
         note.currentUserId = currentUser!.id

         note.merge({
            title: title || note.title,
            content: content || note.content,
            status: status || note.status,
            visibility: visibility || note.visibility,
            lastAutosaveAt: DateTime.now(),
         })

         await note.save()

         return response.ok({
            message: 'Auto-saved',
            lastAutosaveAt: note.lastAutosaveAt,
         })
      } catch (error) {
         if (error.name === 'ModelNotFoundException') {
            return response.notFound({
               error: 'Not Found',
               message: 'Note not found or access denied',
            })
         }

         // console.error(error)
         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong while auto-saving the note',
         })
      }
   }

   /**
    * Publish a draft note
    * POST /api/notes/:id/publish
    */
   async publish({ params, response, currentUser }: HttpContext) {
      try {
         const note = await Note.query()
            .where('id', params.id)
            .where('user_id', currentUser!.id) // Only owner can publish
            .whereNull('deleted_at')
            .firstOrFail()

         // Check if user can edit this note
         if (note.visibility === 'private' && note.userId !== currentUser!.id) {
            return response.forbidden({
               error: 'Forbidden',
               message: 'You cannot edit this note',
            })
         }

         if (note.status === 'published') {
            return response.badRequest({
               error: 'Bad Request',
               message: 'Note is already published',
            })
         }

         // Set current user before updating
         note.currentUserId = currentUser!.id

         note.status = 'published'
         await note.save()

         return response.ok({
            message: 'Note published successfully',
         })
      } catch (error) {
         if (error.name === 'ModelNotFoundException') {
            return response.notFound({
               error: 'Not Found',
               message: 'Note not found or access denied',
            })
         }

         // console.error(error)
         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong while publishing the note',
         })
      }
   }

   /**
    * Unpublish a note (convert to draft)
    * POST /api/notes/:id/unpublish
    */
   async unpublish({ params, response, currentUser }: HttpContext) {
      try {
         const note = await Note.query()
            .where('id', params.id)
            .where('user_id', currentUser!.id) // Only owner can unpublish
            .whereNull('deleted_at')
            .firstOrFail()

         // Check if user can edit this note
         if (note.visibility === 'private' && note.userId !== currentUser!.id) {
            return response.forbidden({
               error: 'Forbidden',
               message: 'You cannot edit this note',
            })
         }

         if (note.status === 'draft') {
            return response.badRequest({
               error: 'Bad Request',
               message: 'Note is already a draft',
            })
         }

         // Set current user before updating
         note.currentUserId = currentUser!.id

         note.status = 'draft'
         await note.save()

         return response.ok({
            message: 'Note unpublished successfully',
         })
      } catch (error) {
         if (error.name === 'ModelNotFoundException') {
            return response.notFound({
               error: 'Not Found',
               message: 'Note not found or access denied',
            })
         }

         // console.error(error)
         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong while unpublishing the note',
         })
      }
   }

   /**
    * Delete note (soft delete)
    * DELETE /api/notes/:id
    */
   async destroy({ params, response, currentUser }: HttpContext) {
      try {
         const note = await Note.query()
            .where('id', params.id)
            .where('user_id', currentUser!.id) // Only owner can delete
            .whereNull('deleted_at')
            .firstOrFail()

         // Check if user can edit this note
         if (note.visibility === 'private' && note.userId !== currentUser!.id) {
            return response.forbidden({
               error: 'Forbidden',
               message: 'You cannot delete this note',
            })
         }

         note.deletedAt = DateTime.now()
         await note.save()

         return response.ok({
            message: 'Note deleted successfully',
         })
      } catch (error) {
         if (error.name === 'ModelNotFoundException') {
            return response.notFound({
               error: 'Not Found',
               message: 'Note not found or access denied',
            })
         }

         // console.error(error)
         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong while deleting the note',
         })
      }
   }

   /**
    * Helper: Sync tags for a note
    */
   private async syncTags(note: Note, tagNames: string[]) {
      // Get or create tags
      const tags = await Promise.all(
         tagNames.map(async (name) => {
            const trimmedName = name.trim().toLowerCase()

            // Find or create tag
            let tag = await Tag.findBy('name', trimmedName)

            if (!tag) {
               tag = await Tag.create({ name: trimmedName })
            }

            return tag.id
         })
      )

      // Sync tags (detach old, attach new)
      await note.related('tags').sync(tags)
   }
}
