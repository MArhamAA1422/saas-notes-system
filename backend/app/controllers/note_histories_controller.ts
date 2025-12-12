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

      // Verify note exists and user has access
      const note = await Note.query()
         .where('id', noteId)
         .whereNull('deleted_at')
         .preload('workspace')
         .firstOrFail()

      // Check if user's company owns the workspace
      if (note.workspace.tenantId !== currentUser!.tenantId) {
         return response.forbidden({
            error: 'Forbidden',
            message: 'Access denied',
         })
      }

      // Only owner can see history
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

      // Get note
      const note = await Note.query()
         .where('id', noteId)
         .whereNull('deleted_at')
         .preload('workspace')
         .firstOrFail()

      // Check access
      if (note.workspace.tenantId !== currentUser!.tenantId) {
         return response.forbidden({
            error: 'Forbidden',
            message: 'Access denied',
         })
      }

      // Only owner can restore
      if (note.userId !== currentUser!.id) {
         return response.forbidden({
            error: 'Forbidden',
            message: 'Only the note owner can restore history',
         })
      }

      // Get history entry
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

   /**
    * Get history stats
    * GET /api/notes/:id/history/stats
    */
   async stats({ params, response, currentUser }: HttpContext) {
      const noteId = params.id

      // Verify note and access
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
            message: 'Access denied',
         })
      }

      // Count history entries
      const sevenDaysAgo = DateTime.now().minus({ days: 7 })

      const count = await NoteHistory.query()
         .where('note_id', noteId)
         .where('created_at', '>=', sevenDaysAgo.toSQL())
         .count('* as total')

      const oldestHistory = await NoteHistory.query()
         .where('note_id', noteId)
         .where('created_at', '>=', sevenDaysAgo.toSQL())
         .orderBy('created_at', 'asc')
         .first()

      const newestHistory = await NoteHistory.query()
         .where('note_id', noteId)
         .where('created_at', '>=', sevenDaysAgo.toSQL())
         .orderBy('created_at', 'desc')
         .first()

      return response.ok({
         totalHistoryEntries: count[0].$extras.total,
         oldestEntry: oldestHistory?.createdAt || null,
         newestEntry: newestHistory?.createdAt || null,
      })
   }
}
