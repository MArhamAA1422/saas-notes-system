import vine from '@vinejs/vine'

export const createNoteValidator = vine.compile(
   vine.object({
      title: vine.string().minLength(1).maxLength(100),
      content: vine.string().minLength(1).maxLength(500),
      status: vine.enum(['draft', 'published']).optional(),
      visibility: vine.enum(['private', 'public']).optional(),
      tags: vine.array(vine.string().minLength(1).maxLength(100)).optional(),
   })
)
