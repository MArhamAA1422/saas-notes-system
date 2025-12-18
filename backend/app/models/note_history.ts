import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Note from '#models/note'
import User from '#models/user'

interface HistoryTag {
   id: number
   name: string
}

export default class NoteHistory extends BaseModel {
   @column({ isPrimary: true })
   declare id: number

   @column()
   declare noteId: number

   @column()
   declare userId: number

   @column()
   declare title: string

   @column()
   declare content: string | null

   @column()
   declare status: 'draft' | 'published'

   @column()
   declare visibility: 'private' | 'public'

   @column({
      serialize: (value: HistoryTag[] | null) => {
         return value ?? []
      },
      prepare: (value: HistoryTag[] | null) => {
         return JSON.stringify(value ?? [])
      },
      consume: (value: string | null) => {
         if (!value) return []
         try {
            return JSON.parse(value)
         } catch {
            return []
         }
      },
   })
   declare tags: HistoryTag[]

   @column.dateTime({ autoCreate: true })
   declare createdAt: DateTime

   // Relationships
   @belongsTo(() => Note)
   declare note: BelongsTo<typeof Note>

   @belongsTo(() => User)
   declare user: BelongsTo<typeof User>
}
