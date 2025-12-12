import vine from '@vinejs/vine'

export const workspacesListValidator = vine.compile(
   vine.object({
      page: vine.number().min(1).optional(),
      perPage: vine.number().min(1).max(10).optional(),
      search: vine.string().minLength(1).maxLength(255).optional(),
   })
)
