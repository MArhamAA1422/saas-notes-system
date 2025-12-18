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
         .firstOrFail()

      if (note.workspace.tenantId !== currentUser!.tenantId) {
         return response.forbidden({
            error: 'Forbidden',
            message: 'Access denied',
         })
      }

      if (note.userId !== currentUser!.id) {
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

      if (note.userId !== currentUser!.id) {
         return response.forbidden({
            error: 'Forbidden',
            message: 'Only the note owner can restore history',
         })
      }

      const history = await NoteHistory.query()
         .where('id', historyId)
         .where('note_id', noteId)
         .firstOrFail()

      // Restore note content from history
      // Note: This will trigger beforeUpdate hook and create NEW history of CURRENT state
      note.title = history.title
      note.content = history.content
      note.status = history.status
      note.visibility = history.visibility

      await note.save()

      return response.ok({
         message: 'Note restored from history successfully',
         note: {
            id: note.id,
            title: note.title,
            content: note.content,
            status: note.status,
            visibility: note.visibility,
         },
      })
   }
}
