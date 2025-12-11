import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Workspace from './workspace.js'
import User from './user.js'

export default class Company extends BaseModel {
   @column({ isPrimary: true })
   declare id: bigint

   @column()
   declare name: string

   @column()
   declare hostname: string

   @column.dateTime({ autoCreate: true })
   declare createdAt: DateTime

   @column.dateTime({ autoCreate: true, autoUpdate: true })
   declare updatedAt: DateTime

   // A company has many users
   @hasMany(() => User)
   declare users: HasMany<typeof User>

   // A company has many workspaces
   @hasMany(() => Workspace)
   declare workspaces: HasMany<typeof Workspace>
}
