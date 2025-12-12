import vine from '@vinejs/vine'

export const voteValidator = vine.compile(
   vine.object({
      voteType: vine.enum(['up', 'down']),
   })
)
