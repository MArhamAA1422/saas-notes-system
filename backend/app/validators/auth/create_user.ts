import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
   vine.object({
      email: vine.string().email().normalizeEmail(),
      password: vine.string().minLength(4).maxLength(50),
      fullName: vine.string().minLength(2).maxLength(50),
   })
)
