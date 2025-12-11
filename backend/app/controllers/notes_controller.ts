import type { HttpContext } from '@adonisjs/core/http'
import Note from '#models/note'
import Workspace from '#models/workspace'
import Tag from '#models/tag'
import { createNoteValidator } from '#validators/note/create_note'
import { updateNoteValidator } from '#validators/note/update_note'
import { DateTime } from 'luxon'

export default class NotesController {
   /**
    * Get all notes in a workspace
    * GET /api/workspaces/:workspaceId/notes
    */
   async index({ params, response, currentUser }: HttpContext) {
      const workspaceId = params.workspaceId

      // Verify workspace belongs to user's company
      const workspace = await Workspace.query()
         .where('id', workspaceId)
         .where('tenant_id', currentUser!.tenantId)
         .whereNull('deleted_at')
         .firstOrFail()

      // Get notes with tags
      const notes = await Note.query()
         .where('workspace_id', workspace.id)
         .whereNull('deleted_at')
         .preload('tags')
         .preload('user', (query) => {
            query.select('id', 'full_name', 'email')
         })
         .orderBy('updated_at', 'desc')

      return response.ok({ notes })
   }

   /**
    * Get single note
    * GET /api/notes/:id
    */
   async show({ params, response, currentUser }: HttpContext) {
      const note = await Note.query()
         .where('id', params.id)
         .whereNull('deleted_at')
         .preload('workspace')
         .preload('tags')
         .preload('user', (query) => {
            query.select('id', 'full_name', 'email')
         })
         .firstOrFail()

      // Authorization check
      await note.load('workspace')

      // Check if user's company owns the workspace
      if (note.workspace.tenantId !== currentUser!.tenantId) {
         return response.forbidden({
            error: 'Forbidden',
            message: 'Access denied',
         })
      }

      // If note is private, only owner can see it
      if (note.visibility === 'private' && note.userId !== currentUser!.id) {
         return response.forbidden({
            error: 'Forbidden',
            message: 'This note is private',
         })
      }

      return response.ok({ note })
   }

   /**
    * Create new note
    * POST /api/workspaces/:workspaceId/notes
    */
   async store({ params, request, response, currentUser }: HttpContext) {
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
         note,
      })
   }

   /**
    * Update note
    * PUT /api/notes/:id
    */
   async update({ params, request, response, currentUser }: HttpContext) {
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

      // Only owner can edit
      if (note.userId !== currentUser!.id) {
         return response.forbidden({
            error: 'Forbidden',
            message: 'Only the note owner can edit',
         })
      }

      const payload = await request.validateUsing(updateNoteValidator)

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
         note,
      })
   }

   /**
    * Auto-save note (for drafts)
    * PATCH /api/notes/:id/autosave
    */
   async autosave({ params, request, response, currentUser }: HttpContext) {
      const note = await Note.query()
         .where('id', params.id)
         .where('user_id', currentUser!.id) // Only owner can autosave
         .whereNull('deleted_at')
         .firstOrFail()

      const { title, content } = request.only(['title', 'content'])

      note.merge({
         title: title || note.title,
         content: content || note.content,
         lastAutosaveAt: DateTime.now(),
      })

      await note.save()

      return response.ok({
         message: 'Auto-saved',
         lastAutosaveAt: note.lastAutosaveAt,
      })
   }

   /**
    * Publish a draft note
    * POST /api/notes/:id/publish
    */
   async publish({ params, response, currentUser }: HttpContext) {
      const note = await Note.query()
         .where('id', params.id)
         .where('user_id', currentUser!.id) // Only owner can publish
         .whereNull('deleted_at')
         .firstOrFail()

      if (note.status === 'published') {
         return response.badRequest({
            error: 'Bad Request',
            message: 'Note is already published',
         })
      }

      note.status = 'published'
      await note.save()

      return response.ok({
         message: 'Note published successfully',
         note,
      })
   }

   /**
    * Unpublish a note (convert to draft)
    * POST /api/notes/:id/unpublish
    */
   async unpublish({ params, response, currentUser }: HttpContext) {
      const note = await Note.query()
         .where('id', params.id)
         .where('user_id', currentUser!.id) // Only owner can unpublish
         .whereNull('deleted_at')
         .firstOrFail()

      if (note.status === 'draft') {
         return response.badRequest({
            error: 'Bad Request',
            message: 'Note is already a draft',
         })
      }

      note.status = 'draft'
      await note.save()

      return response.ok({
         message: 'Note unpublished successfully',
         note,
      })
   }

   /**
    * Delete note (soft delete)
    * DELETE /api/notes/:id
    */
   async destroy({ params, response, currentUser }: HttpContext) {
      const note = await Note.query()
         .where('id', params.id)
         .where('user_id', currentUser!.id) // Only owner can delete
         .whereNull('deleted_at')
         .firstOrFail()

      note.deletedAt = DateTime.now()
      await note.save()

      return response.ok({
         message: 'Note deleted successfully',
      })
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
