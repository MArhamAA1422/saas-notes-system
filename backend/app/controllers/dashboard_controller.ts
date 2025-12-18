import type { HttpContext } from '@adonisjs/core/http'
import Note from '#models/note'
import Workspace from '#models/workspace'

export default class DashboardController {
   /**
    * Get dashboard data for authenticated user
    * GET /api/dashboard
    */
   async index({ response, currentUser }: HttpContext) {
      try {
         const user = currentUser!
         await user.load('company')

         // user stats
         const myNotesCount = await Note.query()
            .where('user_id', user.id)
            .whereNull('deleted_at')
            .count('* as total')

         const myDraftsCount = await Note.query()
            .where('user_id', user.id)
            .where('status', 'draft')
            .whereNull('deleted_at')
            .count('* as total')

         const myPublicNotesCount = await Note.query()
            .where('user_id', user.id)
            .where('status', 'published')
            .where('visibility', 'public')
            .whereNull('deleted_at')
            .count('* as total')

         const companyWorkspacesCount = await Workspace.query()
            .where('tenant_id', user.tenantId)
            .whereNull('deleted_at')
            .count('* as total')

         // recent notes (last 5)
         const recentNotes = await Note.query()
            .where('user_id', user.id)
            .whereNull('deleted_at')
            .preload('workspace', (query) => {
               query.select('id', 'name')
            })
            .select('id', 'title', 'status', 'visibility', 'updated_at', 'workspace_id')
            .orderBy('updated_at', 'desc')
            .limit(5)

         return response.ok({
            user: {
               id: user.id,
               fullName: user.fullName,
               company: {
                  id: user.company.id,
                  name: user.company.name,
               },
            },
            stats: {
               totalNotes: Number(myNotesCount[0].$extras.total),
               draftNotes: Number(myDraftsCount[0].$extras.total),
               publicNotes: Number(myPublicNotesCount[0].$extras.total),
               totalWorkspaces: Number(companyWorkspacesCount[0].$extras.total),
            },
            recentNotes: recentNotes.map((note) => ({
               id: note.id,
               title: note.title,
               status: note.status,
               visibility: note.visibility,
               updatedAt: note.updatedAt,
               workspace: {
                  id: note.workspace.id,
                  name: note.workspace.name,
               },
            })),
         })
      } catch (error) {
         // console.error(error)

         return response.internalServerError({
            error: 'Server Error',
            message: 'Failed to load dashboard data',
         })
      }
   }
}
