import type { HttpContext } from '@adonisjs/core/http'
import Note from '#models/note'
import Company from '#models/company'
import { publicNotesValidator } from '#validators/note/public_note'

export default class PublicNotesController {
   /**
    * Get all public notes (scoped to user's company)
    * GET /api/public/notes
    */
   async index({ request, response }: HttpContext) {
      try {
         const hostname = request.hostname() || 'localhost'
         const company = await Company.findByOrFail('hostname', hostname)

         const {
            page = 1,
            perPage = 20,
            sort = 'newest',
            search,
         } = await request.validateUsing(publicNotesValidator)

         const query = Note.query()
            .where('status', 'published')
            .where('visibility', 'public')
            .whereNull('deleted_at')
            .whereHas('workspace', (workspaceQuery) => {
               workspaceQuery.where('tenant_id', company.id) // TENANT ISOLATION
            })
            .preload('workspace', (workspaceQuery) => {
               workspaceQuery
                  .select('id', 'name', 'tenant_id')
                  .preload('company', (companyQuery) => {
                     companyQuery.select('id', 'name', 'hostname')
                  })
            })
            .preload('user', (userQuery) => {
               userQuery.select('id', 'full_name')
            })
            .preload('tags')

         // Search by title
         if (search) {
            query.where((builder) => {
               builder.whereILike('title', `%${search}%`)
            })
         }

         // Sorting
         switch (sort) {
            case 'newest':
               query.orderBy('created_at', 'desc')
               break
            case 'oldest':
               query.orderBy('created_at', 'asc')
               break
            case 'most_upvoted':
               query.orderBy('vote_count', 'desc').orderBy('created_at', 'desc')
               break
            case 'most_downvoted':
               query.orderBy('vote_count', 'asc').orderBy('created_at', 'desc')
               break
            default:
               query.orderBy('created_at', 'desc')
         }

         // Paginate
         const notes = await query.paginate(page, perPage)
         const transformedNotes = notes.toJSON()

         return response.ok({
            notes: transformedNotes.data,
            meta: transformedNotes.meta,
         })
      } catch (error) {
         if (error.name === 'ModelNotFoundException') {
            return response.notFound({
               error: 'Not Found',
               message: 'Company not found',
            })
         }

         if (error.name === 'ValidationException') {
            return response.badRequest({
               error: 'Validation Error',
               message: error.messages,
            })
         }

         console.error(error)
         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong while fetching notes',
         })
      }
   }

   /**
    * Get single public note (scoped to company)
    * GET /api/public/notes/:id
    */
   async show({ params, request, response }: HttpContext) {
      try {
         const hostname = request.hostname() || 'localhost'
         // const hostname = 'ezycomp'
         const company = await Company.findByOrFail('hostname', hostname)

         const note = await Note.query()
            .where('id', params.id)
            .where('status', 'published')
            .where('visibility', 'public')
            .whereNull('deleted_at')
            .whereHas('workspace', (workspaceQuery) => {
               workspaceQuery.where('tenant_id', company.id) // TENANT ISOLATION
            })
            .preload('workspace', (workspaceQuery) => {
               workspaceQuery
                  .select('id', 'name', 'tenant_id')
                  .preload('company', (companyQuery) => {
                     companyQuery.select('id', 'name', 'hostname')
                  })
            })
            .preload('user', (userQuery) => {
               userQuery.select('id', 'full_name')
            })
            .preload('tags')
            .firstOrFail()

         return response.ok({ note })
      } catch (error) {
         if (error.name === 'ModelNotFoundException') {
            return response.notFound({
               error: 'Not Found',
               message: 'Note or company not found',
            })
         }

         console.error(error)
         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong while fetching the note',
         })
      }
   }
}
