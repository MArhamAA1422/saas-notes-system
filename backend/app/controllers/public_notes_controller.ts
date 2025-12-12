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
      // Get company from hostname
      const hostname = request.hostname() || 'localhost'
      const company = await Company.findByOrFail('hostname', hostname)

      // Validate query parameters
      const {
         page = 1,
         perPage = 20,
         sort = 'newest',
         search,
         tags,
      } = await request.validateUsing(publicNotesValidator)

      // Base query for public notes (SCOPED TO COMPANY)
      const query = Note.query()
         .where('status', 'published')
         .where('visibility', 'public')
         .whereNull('deleted_at')
         .whereHas('workspace', (workspaceQuery) => {
            workspaceQuery.where('tenant_id', company.id) // TENANT ISOLATION
         })
         .preload('workspace', (workspaceQuery) => {
            workspaceQuery.select('id', 'name', 'tenant_id').preload('company', (companyQuery) => {
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

      // Filter by tags
      if (tags && tags.length > 0) {
         query.whereHas('tags', (tagsQuery) => {
            tagsQuery.whereIn('name', tags)
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
   }

   /**
    * Get single public note (scoped to company)
    * GET /api/public/notes/:id
    */
   async show({ params, request, response }: HttpContext) {
      // Get company from hostname
      const hostname = request.hostname() || 'localhost'
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
            workspaceQuery.select('id', 'name', 'tenant_id').preload('company', (companyQuery) => {
               companyQuery.select('id', 'name', 'hostname')
            })
         })
         .preload('user', (userQuery) => {
            userQuery.select('id', 'full_name')
         })
         .preload('tags')
         .firstOrFail()

      return response.ok({ note })
   }
}
