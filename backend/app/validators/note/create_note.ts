import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const schema = vine.object({
   title: vine.string().minLength(1).maxLength(100),
   content: vine.string().minLength(1).maxLength(500),
   status: vine.enum(['draft', 'published']).optional(),
   visibility: vine.enum(['private', 'public']).optional(),
   tags: vine.array(vine.string().minLength(1).maxLength(100)).optional(),
})

const validator = vine.compile(schema)
validator.messagesProvider = new SimpleMessagesProvider({
   'title.required': 'Please provide a title for your note.',
   'title.minLength': 'The title must be at least 1 character long.',
   'title.maxLength': 'The title cannot exceed 100 characters.',

   'content.required': 'Note content is required.',
   'content.minLength': 'The content must be at least 1 character long.',
   'content.maxLength': 'The content cannot exceed 500 characters.',

   'status.enum': 'Status must be either "draft" or "published".',
   'visibility.enum': 'Visibility must be either "private" or "public".',

   // For array items (tags.* refers to each tag string)
   'tags.*.minLength': 'Each tag must be at least 1 character long.',
   'tags.*.maxLength': 'Each tag cannot exceed 100 characters.',
})

export const createNoteValidator = validator
