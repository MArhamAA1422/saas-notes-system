import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'

import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'

import Workspace from './workspace.js'
import User from './user.js'
import Tag from './tag.js'
import Vote from './vote.js'

export default class Note extends BaseModel {
   @column({ isPrimary: true })
   declare id: number

   @column()
   declare workspaceId: number

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

   @column()
   declare voteCount: number

   @column.dateTime()
   declare lastAutosaveAt: DateTime | null

   @column.dateTime()
   declare deletedAt: DateTime | null

   @column.dateTime({ autoCreate: true })
   declare createdAt: DateTime

   @column.dateTime({ autoCreate: true, autoUpdate: true })
   declare updatedAt: DateTime

   // Note belongs to Workspace
   @belongsTo(() => Workspace)
   declare workspace: BelongsTo<typeof Workspace>

   // Note belongs to User (author)
   @belongsTo(() => User)
   declare user: BelongsTo<typeof User>

   // Note has many Votes
   @hasMany(() => Vote)
   declare votes: HasMany<typeof Vote>

   // Note has many Tags (many-to-many)
   @manyToMany(() => Tag, {
      pivotTable: 'note_tags',
      pivotForeignKey: 'note_id',
      pivotRelatedForeignKey: 'tag_id',
      pivotTimestamps: {
         createdAt: 'created_at',
         updatedAt: false,
      },
   })
   declare tags: ManyToMany<typeof Tag>
}
