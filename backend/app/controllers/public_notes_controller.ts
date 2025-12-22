import type { HttpContext } from '@adonisjs/core/http'
import Note from '#models/note'
import Company from '#models/company'
import { noteContentValidator } from '#validators/note/note_content'
import Vote from '#models/vote'

export default class PublicNotesController {
   /**
    * Get all public notes (scoped to user's company)
    * GET /api/public/notes
    */
   async index({ request, response, currentUser }: HttpContext) {
      try {
         // const hostname =
         //    (request.hostname()?.includes('ezycomp') ? 'ezycomp' : request.hostname()) ||
         //    'localhost'
         const hostname =
            (currentUser?.email?.includes('ezycomp') ? 'ezycomp' : request.hostname()) ||
            'localhost'
         const company = await Company.findByOrFail('hostname', hostname)

         const {
            page = 1,
            perPage = 10,
            sort = 'newest',
            search,
         } = await request.validateUsing(noteContentValidator)

         const query = Note.query()
            .where('status', 'published')
            .where('visibility', 'public')
            .whereNull('deleted_at')

            // tenant isolation here
            .whereHas('workspace', (workspaceQuery) => {
               workspaceQuery.where('tenant_id', company.id).whereNull('deleted_at')
            })

            .preload('workspace', (workspaceQuery) => {
               workspaceQuery
                  .select('id', 'name', 'tenant_id')
                  .whereNull('deleted_at')
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

         // load vote status
         const noteIds = notes.all().map((note) => note.id) || []
         const voteMap = await this.bulk(noteIds, currentUser!.id)

         const transformedNotes = notes.toJSON()

         return response.ok({
            notes: transformedNotes.data,
            meta: transformedNotes.meta,
            votes: voteMap,
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

         // console.error(error)
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
         const hostname =
            (request.hostname()?.includes('ezycomp') ? 'ezycomp' : request.hostname()) ||
            'localhost'
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

         // console.error(error)
         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong while fetching the note',
         })
      }
   }

   // Helper function
   async bulk(noteIds: number[], userId: number) {
      try {
         // Fetch all votes for the user and these notes in a single query
         const userVotes = await Vote.query()
            .whereIn('note_id', noteIds)
            .where('user_id', userId)
            .select('note_id', 'vote_type')

         // Fetch vote counts for all notes in a single query
         const notes = await Note.query().whereIn('id', noteIds).select('id', 'vote_count')

         // Transform to a map for easy lookup
         const voteMap: Record<
            number,
            { hasVoted: boolean; voteType: 'up' | 'down' | null; voteCount: number }
         > = {}

         // Initialize all notes with vote counts from database
         notes.forEach((note) => {
            voteMap[note.id] = {
               hasVoted: false,
               voteType: null,
               voteCount: note.voteCount,
            }
         })

         // Update with actual user votes
         userVotes.forEach((vote) => {
            if (voteMap[vote.noteId]) {
               voteMap[vote.noteId].hasVoted = true
               voteMap[vote.noteId].voteType = vote.voteType
            }
         })

         // For noteIds that don't exist in database, set default values
         noteIds.forEach((noteId) => {
            if (!voteMap[noteId]) {
               voteMap[noteId] = {
                  hasVoted: false,
                  voteType: null,
                  voteCount: 0,
               }
            }
         })

         return voteMap
      } catch (error) {
         throw new Error(error)
      }
   }
}
