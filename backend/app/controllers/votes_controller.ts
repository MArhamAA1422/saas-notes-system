import type { HttpContext } from '@adonisjs/core/http'
import Vote from '#models/vote'
import Note from '#models/note'
import { voteValidator } from '#validators/vote'
import db from '@adonisjs/lucid/services/db'

export default class VotesController {
   /**
    * Vote on a note (upvote or downvote)
    * POST /api/notes/:id/vote
    * Body: { voteType: 'up' | 'down' }
    */
   async store({ params, request, response, currentUser }: HttpContext) {
      try {
         const noteId = params.id
         const userId = currentUser!.id
         // console.log(request)
         const { voteType } = await request.validateUsing(voteValidator)

         const note = await Note.query()
            .where('id', noteId)
            .where('status', 'published')
            .where('visibility', 'public')
            .whereNull('deleted_at')
            .firstOrFail()

         const existingVote = await Vote.query()
            .where('note_id', noteId)
            .where('user_id', userId)
            .first()

         if (existingVote) {
            if (existingVote.voteType === voteType) {
               return response.badRequest({
                  error: 'Bad Request',
                  message: `You have already ${voteType}voted this note`,
               })
            }

            const oldVoteType = existingVote.voteType
            existingVote.voteType = voteType
            await existingVote.save()
            await this.updateVoteCount(note, oldVoteType, voteType)

            return response.ok({
               message: `Vote changed to ${voteType}vote`,
               vote: { voteType: existingVote.voteType, voteCount: note.voteCount },
            })
         }

         const vote = await Vote.create({
            noteId: noteId,
            userId: userId,
            voteType: voteType,
         })

         try {
            await this.updateVoteCount(note, null, voteType)
         } catch (error) {
            console.error(error)
            return response.internalServerError({
               error: 'Server Error',
               message: 'Failed to update vote count',
            })
         }

         return response.created({
            message: `Note ${voteType}voted successfully`,
            vote: { voteType: vote.voteType, voteCount: note.voteCount },
         })
      } catch (error) {
         console.error(error)
         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong while processing your vote',
         })
      }
   }

   /**
    * Remove vote from a note
    * DELETE /api/notes/:id/vote
    */
   async destroy({ params, response, currentUser }: HttpContext) {
      try {
         const noteId = params.id
         const userId = currentUser!.id

         // Find the vote
         const vote = await Vote.query().where('note_id', noteId).where('user_id', userId).first()

         if (!vote) {
            return response.notFound({
               error: 'Not Found',
               message: 'You have not voted on this note',
            })
         }

         // Get the note
         const note = await Note.findOrFail(noteId)

         // Remove vote
         const voteType = vote.voteType
         await vote.delete()

         // Update vote count
         try {
            await this.updateVoteCount(note, voteType, null)
         } catch (error) {
            console.error(error)
            return response.internalServerError({
               error: 'Server Error',
               message: 'Failed to update vote count',
            })
         }

         return response.ok({
            message: 'Vote removed successfully',
            voteCount: note.voteCount,
         })
      } catch (error) {
         if (error.name === 'ModelNotFoundException') {
            return response.notFound({
               error: 'Not Found',
               message: 'Note not found',
            })
         }

         console.error(error)
         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong while removing the vote',
         })
      }
   }

   /**
    * Get user's vote status for a note
    * GET /api/notes/:id/vote
    */
   async show({ params, response, currentUser }: HttpContext) {
      try {
         const noteId = params.id
         const userId = currentUser!.id

         // Check if note exists and is public
         const note = await Note.query()
            .where('id', noteId)
            .where('status', 'published')
            .where('visibility', 'public')
            .whereNull('deleted_at')
            .select('id', 'vote_count')
            .firstOrFail()

         // Get user's vote
         const vote = await Vote.query().where('note_id', noteId).where('user_id', userId).first()

         return response.ok({
            hasVoted: !!vote,
            voteType: vote?.voteType || null,
            voteCount: note.voteCount,
         })
      } catch (error) {
         if (error.name === 'ModelNotFoundException') {
            return response.notFound({
               error: 'Not Found',
               message: 'Note not found or not accessible',
            })
         }

         console.error(error)
         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong while fetching vote info',
         })
      }
   }

   /**
    * Get vote breakdown for a note
    * GET /api/notes/:id/votes/stats
    */
   async stats({ params, response }: HttpContext) {
      try {
         const noteId = params.id

         // Verify note exists and is public
         await Note.query()
            .where('id', noteId)
            .where('status', 'published')
            .where('visibility', 'public')
            .whereNull('deleted_at')
            .firstOrFail()

         // Get vote statistics
         const stats = await db
            .from('votes')
            .where('note_id', noteId)
            .select('vote_type')
            .count('* as count')
            .groupBy('vote_type')

         const upvotes = stats.find((s: any) => s.vote_type === 'up')?.count || 0
         const downvotes = stats.find((s: any) => s.vote_type === 'down')?.count || 0
         const total = Number(upvotes) + Number(downvotes)

         return response.ok({
            upvotes: Number(upvotes),
            downvotes: Number(downvotes),
            total: total,
            score: Number(upvotes) - Number(downvotes), // Net score
         })
      } catch (error) {
         if (error.name === 'ModelNotFoundException') {
            return response.notFound({
               error: 'Not Found',
               message: 'Note not found or not accessible',
            })
         }

         console.error(error)
         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong while fetching vote statistics',
         })
      }
   }

   /**
    * Helper: Update note vote count
    */
   private async updateVoteCount(
      note: Note,
      oldVoteType: 'up' | 'down' | null,
      newVoteType: 'up' | 'down' | null
   ) {
      let change = 0

      if (oldVoteType === null && newVoteType === 'up') {
         change = 1 // New upvote
      } else if (oldVoteType === null && newVoteType === 'down') {
         change = -1 // New downvote
      } else if (oldVoteType === 'up' && newVoteType === null) {
         change = -1 // Remove upvote
      } else if (oldVoteType === 'down' && newVoteType === null) {
         change = 1 // Remove downvote
      } else if (oldVoteType === 'up' && newVoteType === 'down') {
         change = -2 // Change from up to down
      } else if (oldVoteType === 'down' && newVoteType === 'up') {
         change = 2 // Change from down to up
      }

      note.voteCount += change
      await note.save()
   }
   /**
    * Get bulk vote status for multiple notes
    * POST /api/notes/votes/bulk
    * Body: { noteIds: [1, 2, 3, ...] }
    */
   async bulk({ request, response, currentUser }: HttpContext) {
      const { noteIds } = request.only(['noteIds'])

      // Validate input
      if (!Array.isArray(noteIds) || noteIds.length === 0) {
         return response.badRequest({
            error: 'Bad Request',
            message: 'noteIds must be a non-empty array',
         })
      }

      // Limit to prevent abuse (max 30 notes at once)
      if (noteIds.length > 30) {
         return response.badRequest({
            error: 'Bad Request',
            message: 'Cannot fetch votes for more than 30 notes at once',
         })
      }

      const userId = currentUser!.id

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

         return response.ok({
            votes: voteMap,
         })
      } catch (error) {
         console.error('Bulk vote fetch error:', error)
         return response.internalServerError({
            error: 'Server Error',
            message: 'Failed to fetch vote statuses',
         })
      }
   }
}
