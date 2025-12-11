import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Note from './note.js'

export default class Tag extends BaseModel {
   @column({ isPrimary: true })
   declare id: number

   @column()
   declare name: string

   @column.dateTime({ autoCreate: true })
   declare createdAt: DateTime

   @column.dateTime({ autoCreate: true, autoUpdate: true })
   declare updatedAt: DateTime

   // Tag belongs to many Notes
   @manyToMany(() => Note, {
      pivotTable: 'note_tags',
      pivotForeignKey: 'tag_id',
      pivotRelatedForeignKey: 'note_id',
      pivotTimestamps: {
         createdAt: 'created_at',
         updatedAt: false,
      },
   })
   declare notes: ManyToMany<typeof Note>
}
