import type { HttpContext } from '@adonisjs/core/http'
import Note from '#models/note'
import NoteHistory from '#models/note_history'
import { DateTime } from 'luxon'

export default class NoteHistoriesController {
   /**
    * Get history for a note
    * GET /api/notes/:id/history
    */
   async index({ params, response, currentUser }: HttpContext) {
      const noteId = params.id

      const note = await Note.query()
         .where('id', noteId)
         .whereNull('deleted_at')
         .preload('workspace')
         .preload('tags')
         .firstOrFail()

      if (note.workspace.tenantId !== currentUser!.tenantId) {
         return response.forbidden({
            error: 'Forbidden',
            message: 'Access denied',
         })
      }

      if (note.visibility === 'private' && note.userId !== currentUser!.id) {
         return response.forbidden({
            error: 'Forbidden',
            message: 'Only the note owner can view history',
         })
      }

      // Get history entries (last 7 days)
      const sevenDaysAgo = DateTime.now().minus({ days: 7 })

      const histories = await NoteHistory.query()
         .where('note_id', noteId)
         .where('created_at', '>=', sevenDaysAgo.toSQL())
         .preload('user', (query) => {
            query.select('id', 'full_name')
         })
         .orderBy('created_at', 'desc')

      return response.ok({
         histories,
         current: {
            title: note.title,
            content: note.content,
            status: note.status,
            visibility: note.visibility,
            tags: note.tags.map((tag) => ({
               id: tag.id,
               name: tag.name,
            })),
         },
      })
   }

   /**
    * Restore note from history
    * POST /api/notes/:id/history/:historyId/restore
    */
   async restore({ params, response, currentUser }: HttpContext) {
      const { id: noteId, historyId } = params

      const note = await Note.query()
         .where('id', noteId)
         .whereNull('deleted_at')
         .preload('workspace')
         .firstOrFail()

      if (note.workspace.tenantId !== currentUser!.tenantId) {
         return response.forbidden({
            error: 'Forbidden',
            message: 'Access denied',
         })
      }

      // Only owner can restore private notes, anyone can restore public notes
      if (note.visibility === 'private' && note.userId !== currentUser!.id) {
         return response.forbidden({
            error: 'Forbidden',
            message: 'Only the note owner can restore private notes',
         })
      }

      const history = await NoteHistory.query()
         .where('id', historyId)
         .where('note_id', noteId)
         .firstOrFail()

      // Set current user before restoring (this will create history of current state)
      note.currentUserId = currentUser!.id

      /* Restore note content from history
         This will trigger "beforeUpdate" hook and create NEW history of CURRENT state */
      note.title = history.title
      note.content = history.content
      note.status = history.status
      note.visibility = history.visibility

      await note.save()

      // Restore tags from history
      if (history.tags && Array.isArray(history.tags)) {
         const { default: Tag } = await import('#models/tag')

         // Get or create tags from history
         const tagIds = await Promise.all(
            history.tags.map(async (historyTag: { id: number; name: string }) => {
               // Try to find existing tag by name
               let tag = await Tag.findBy('name', historyTag.name)

               // If tag doesn't exist, create it
               if (!tag) {
                  tag = await Tag.create({ name: historyTag.name })
               }

               return tag.id
            })
         )

         // Sync tags
         await note.related('tags').sync(tagIds)
      }

      // Reload note with tags
      await note.load('tags')

      return response.ok({
         message: 'Note restored from history successfully',
         note: {
            id: note.id,
            title: note.title,
            content: note.content,
            status: note.status,
            visibility: note.visibility,
            tags: note.tags.map((tag) => ({
               id: tag.id,
               name: tag.name,
            })),
         },
      })
   }
}
