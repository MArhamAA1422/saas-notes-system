import type { HttpContext } from '@adonisjs/core/http'
import Note from '#models/note'
import db from '@adonisjs/lucid/services/db'

export default class PublicNotesController {
   /**
    * Get public notes directory (company-scoped)
    * GET /api/public/notes
    */
   async index({ request, response, currentUser }: HttpContext) {
      const qs = request.qs()

      const page = qs.page ? Number(qs.page) : 1
      const limit = qs.limit ? Number(qs.limit) : 10
      const sort = qs.sort ?? '' // new, old, upvotes, downvotes
      const search = qs.search ?? ''

      // const page = request.input('page', 1)
      // const limit = request.input('limit', 10)
      // const sort = request.input('sort', '') // default(new), old, upvotes, downvotes
      // const search = request.input('search', '')

      // Build query
      const query = Note.query()
         .where('status', 'published')
         .where('visibility', 'public')
         .whereNull('deleted_at')
         .whereHas('workspace', (workspaceQuery) => {
            // Only notes from same company
            workspaceQuery.where('tenant_id', currentUser!.tenantId)
            workspaceQuery.whereNull('deleted_at')
         })

      // Search by title
      if (search) {
         query.where('title', 'like', `%${search}%`)
      }

      // Sorting
      switch (sort) {
         case 'old':
            query.orderBy('created_at', 'asc')
            break
         case 'upvotes':
            query.orderBy('vote_count', 'desc')
            break
         case 'downvotes':
            query.orderBy('vote_count', 'asc')
            break
         default:
            query.orderBy('created_at', 'desc')
            break
      }

      // Eager load relationships
      query.preload('workspace', (workspaceQuery) => {
         workspaceQuery.select('id', 'name', 'tenant_id')
      })
      query.preload('tags')
      query.preload('user', (userQuery) => {
         userQuery.select('id', 'full_name')
      })

      // Get user's votes for these notes
      const notes = await query.paginate(page, limit)

      // Fetch current user's votes for all notes in this page
      const noteIds = notes.map((note) => note.id)

      const userVotes = await db
         .from('votes')
         .select('note_id', 'vote_type')
         .whereIn('note_id', noteIds)
         .where('user_id', currentUser!.id)

      // Create a map of user votes
      const userVotesMap = new Map(userVotes.map((vote) => [vote.note_id, vote.vote_type]))

      // serialize paginator (keeps meta + data)
      const serialized = notes.serialize()

      // Serialize notes with user vote info
      serialized.data = notes.map((note) => {
         return {
            id: note.id,
            title: note.title,
            content: note.content,
            voteCount: note.voteCount,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
            workspace: {
               id: note.workspace.id,
               name: note.workspace.name,
            },
            tags: note.tags.map((tag) => ({
               id: tag.id,
               name: tag.name,
            })),
            author: {
               id: note.user.id,
               name: note.user.fullName,
            },
            userVote: userVotesMap.get(note.id) || null, // 'up', 'down', or null
         }
      })

      return response.ok({
         serialized,
      })
   }

   /**
    * Get single public note detail
    * GET /api/public/notes/:id
    */
   async show({ params, response, currentUser }: HttpContext) {
      const note = await Note.query()
         .where('id', params.id)
         .where('status', 'published')
         .where('visibility', 'public')
         .whereNull('deleted_at')
         .whereHas('workspace', (workspaceQuery) => {
            // Only notes from same company
            workspaceQuery.where('tenant_id', currentUser!.tenantId)
            workspaceQuery.whereNull('deleted_at')
         })
         .preload('workspace', (workspaceQuery) => {
            workspaceQuery.select('id', 'name')
         })
         .preload('tags')
         .preload('user', (userQuery) => {
            userQuery.select('id', 'full_name')
         })
         .firstOrFail()

      // Get user's vote for this note
      const userVote = await db
         .from('votes')
         .select('vote_type')
         .where('note_id', note.id)
         .where('user_id', currentUser!.id)
         .first()

      return response.ok({
         note: {
            id: note.id,
            title: note.title,
            content: note.content,
            voteCount: note.voteCount,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
            workspace: {
               id: note.workspace.id,
               name: note.workspace.name,
            },
            tags: note.tags.map((tag) => ({
               id: tag.id,
               name: tag.name,
            })),
            author: {
               id: note.user.id,
               name: note.user.fullName,
            },
            userVote: userVote?.vote_type || null,
         },
      })
   }
}
