import vine from '@vinejs/vine'

export const noteContentValidator = vine.compile(
   vine.object({
      page: vine.number().min(1).optional(),
      perPage: vine.number().min(1).max(20).optional(),
      sort: vine.enum(['newest', 'oldest', 'most_upvoted', 'most_downvoted']).optional(),
      search: vine.string().minLength(1).maxLength(255).optional(),
      tags: vine.array(vine.string().minLength(1).maxLength(100)).optional(),
   })
)
