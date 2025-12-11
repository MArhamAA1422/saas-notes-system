import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Note from './note.js'
import Tag from './tag.js'

export default class NoteTag extends BaseModel {
   @column({ isPrimary: true })
   declare id: bigint

   @column()
   declare noteId: bigint

   @column()
   declare tagId: bigint

   @column.dateTime({ autoCreate: true })
   declare createdAt: DateTime

   @belongsTo(() => Note, {
      foreignKey: 'noteId',
   })
   declare note: BelongsTo<typeof Note>

   @belongsTo(() => Tag, {
      foreignKey: 'tagId',
   })
   declare tag: BelongsTo<typeof Tag>
}
