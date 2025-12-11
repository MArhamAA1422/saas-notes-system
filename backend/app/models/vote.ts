import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Note from './note.js'
import User from './user.js'

export default class Vote extends BaseModel {
   @column({ isPrimary: true })
   declare id: number

   @column()
   declare noteId: number

   @column()
   declare userId: number

   @column()
   declare voteType: 'up' | 'down'

   @column.dateTime({ autoCreate: true })
   declare createdAt: DateTime

   @column.dateTime({ autoCreate: true, autoUpdate: true })
   declare updatedAt: DateTime

   @belongsTo(() => Note, {
      foreignKey: 'noteId',
   })
   declare note: BelongsTo<typeof Note>

   @belongsTo(() => User, {
      foreignKey: 'userId',
   })
   declare user: BelongsTo<typeof User>
}
