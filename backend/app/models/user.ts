import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, beforeSave } from '@adonisjs/lucid/orm'

import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import Company from './company.js'
import Note from './note.js'

import hash from '@adonisjs/core/services/hash'

export default class User extends BaseModel {
   @column({ isPrimary: true })
   declare id: number

   @column({ columnName: 'tenant_id' })
   declare tenantId: number

   @column()
   declare fullName: string

   @column()
   declare email: string

   @column({ serializeAs: null })
   declare password: string

   @column.dateTime({ autoCreate: true })
   declare createdAt: DateTime

   @column.dateTime({ autoCreate: true, autoUpdate: true })
   declare updatedAt: DateTime

   // User belongs to a tenant/company
   @belongsTo(() => Company, {
      foreignKey: 'tenantId',
   })
   declare company: BelongsTo<typeof Company>

   // A user creates many notes
   @hasMany(() => Note)
   declare notes: HasMany<typeof Note>

   // Hooks
   @beforeSave()
   static async hashPassword(user: User) {
      if (user.$dirty.password) {
         user.password = await hash.make(user.password)
      }
   }
}
