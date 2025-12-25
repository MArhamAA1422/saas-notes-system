import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const schema = vine.object({
   page: vine.number().min(1).optional(),
   perPage: vine.number().min(1).max(20).optional(),
   sort: vine.enum(['newest', 'oldest', 'most_upvoted', 'most_downvoted']).optional(),
   search: vine.string().minLength(1).maxLength(255).optional(),
   tags: vine.array(vine.string().minLength(1).maxLength(100)).optional(),
})

const validator = vine.compile(schema)

validator.messagesProvider = new SimpleMessagesProvider({
   'page.min': 'Page number must be at least 1.',
   'perPage.min': 'Items per page must be at least 1.',
   'perPage.max': 'Items per page cannot exceed 20.',

   'sort.enum': 'Sort must be one of: newest, oldest, most_upvoted, or most_downvoted.',

   'search.minLength': 'Search query must be at least 1 character long.',
   'search.maxLength': 'Search query cannot exceed 255 characters.',

   // For tags array items
   'tags.*.minLength': 'Each tag must be at least 1 character long.',
   'tags.*.maxLength': 'Each tag cannot exceed 100 characters.',
})

export const noteContentValidator = validator
