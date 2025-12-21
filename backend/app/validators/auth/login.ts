import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const schema = vine.object({
   email: vine.string().email().normalizeEmail(),
   password: vine.string(),
})

const messagesProvider = new SimpleMessagesProvider({
   // Email field
   'email.required': 'Email is required to sign in.',
   'email.email': 'Please enter a valid email address.',

   // Password field
   'password.required': 'Password is required.',
   'password.minLength': 'Password must be at least 4 characters long.',
   'password.maxLength': 'Password cannot be longer than 50 characters.',
})

export const loginValidator = vine.compile(schema)
loginValidator.messagesProvider = messagesProvider
