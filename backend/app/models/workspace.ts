import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'

import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import Company from './company.js'
import Note from './note.js'

export default class Workspace extends BaseModel {
   @column({ isPrimary: true })
   declare id: number

   @column({ columnName: 'tenant_id' })
   declare tenantId: number

   @column()
   declare name: string

   @column.dateTime()
   declare deletedAt: DateTime | null

   @column.dateTime({ autoCreate: true })
   declare createdAt: DateTime

   @column.dateTime({ autoCreate: true, autoUpdate: true })
   declare updatedAt: DateTime

   @column()
   declare notesCount?: number

   // Workspace belongs to a company (tenant)
   @belongsTo(() => Company, {
      foreignKey: 'tenantId',
   })
   declare company: BelongsTo<typeof Company>

   // Workspace has many notes
   @hasMany(() => Note)
   declare notes: HasMany<typeof Note>
}
