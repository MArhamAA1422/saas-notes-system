import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const schema = vine.object({
   fullName: vine.string().minLength(2).maxLength(50),
   email: vine.string().email().normalizeEmail(),
   password: vine.string().minLength(4).maxLength(50),
})

const messagesProvider = new SimpleMessagesProvider({
   // Email field
   'email.required': 'Email is required to create an account.',
   'email.email': 'Please enter a valid email address.',

   // Password field
   'password.required': 'You must choose a password.',
   'password.minLength': 'Password must be at least 4 characters long.',
   'password.maxLength': 'Password cannot be longer than 50 characters.',

   // Full Name field
   'fullName.required': 'Please provide your full name.',
   'fullName.minLength': 'Full name must be at least 2 characters long.',
   'fullName.maxLength': 'Full name cannot exceed 50 characters.',
})

export const createUserValidator = vine.compile(schema)
createUserValidator.messagesProvider = messagesProvider
