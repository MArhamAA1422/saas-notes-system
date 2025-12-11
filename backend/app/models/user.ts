import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'

import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import Company from './company.js'
import Note from './note.js'

export default class User extends BaseModel {
   @column({ isPrimary: true })
   declare id: bigint

   @column({ columnName: 'tenant_id' })
   declare tenantId: bigint

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
}
