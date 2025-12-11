import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Session extends BaseModel {
   @column({ isPrimary: true })
   declare id: string

   @column()
   declare userId: number | null

   @column()
   declare ipAddress: string | null

   @column()
   declare userAgent: string | null

   @column()
   declare payload: string

   @column()
   declare lastActivity: number

   @belongsTo(() => User, {
      foreignKey: 'userId',
   })
   declare user: BelongsTo<typeof User>
}
