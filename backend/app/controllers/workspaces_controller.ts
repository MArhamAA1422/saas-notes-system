import type { HttpContext } from '@adonisjs/core/http'
import Workspace from '#models/workspace'
import { workspacesListValidator } from '#validators/workspace'

export default class WorkspacesController {
   /**
    * Get all workspaces for user's company (paginated)
    * GET /api/workspaces
    */
   async index({ request, response, currentUser }: HttpContext) {
      try {
         const {
            page = 1,
            perPage = 10,
            search,
         } = await request.validateUsing(workspacesListValidator)

         // Query workspaces for user's company
         const query = Workspace.query()
            .where('tenant_id', currentUser!.tenantId)
            .whereNull('deleted_at')
            .select('id', 'name', 'created_at', 'updated_at')
            .orderBy('name', 'asc')

         // Search by name
         if (search) {
            query.whereILike('name', `%${search}%`)
         }

         // Count notes per workspace
         query.withCount('notes', (notesQuery) => {
            notesQuery.whereNull('deleted_at')
         })

         // Paginate
         const workspaces = await query.paginate(page, perPage)

         return response.ok(workspaces.toJSON())
      } catch (error) {
         console.error(error)

         // Validation errors
         if (error.messages) {
            return response.badRequest({
               error: 'Validation Failed',
               messages: error.messages,
            })
         }

         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong while fetching workspaces',
         })
      }
   }

   /**
    * Get single workspace details
    * GET /api/workspaces/:id
    */
   async show({ params, response, currentUser }: HttpContext) {
      try {
         const workspace = await Workspace.query()
            .where('id', params.id)
            .where('tenant_id', currentUser!.tenantId)
            .whereNull('deleted_at')
            .withCount('notes', (notesQuery) => {
               notesQuery.whereNull('deleted_at')
            })
            .firstOrFail()

         return response.ok({ workspace })
      } catch (error) {
         console.error(error)

         // Not found (workspace not in user's company or deleted)
         if (error.name === 'ModelNotFoundException') {
            return response.notFound({
               error: 'Not Found',
               message: 'Workspace not found',
            })
         }

         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong while fetching the workspace',
         })
      }
   }
}
