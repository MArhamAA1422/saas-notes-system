import { DateTime } from 'luxon'
import {
   BaseModel,
   column,
   belongsTo,
   hasMany,
   manyToMany,
   beforeUpdate,
} from '@adonisjs/lucid/orm'

import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'

import Workspace from './workspace.js'
import User from './user.js'
import Tag from './tag.js'
import Vote from './vote.js'

import NoteHistory from '#models/note_history'

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

   @hasMany(() => NoteHistory)
   declare histories: HasMany<typeof NoteHistory>

   // Hook: Create history before updating
   @beforeUpdate()
   static async createHistoryEntry(note: Note) {
      // Only create history if content/title/status/visibility changed
      const dirtyFields = note.$dirty

      const trackableFields = ['title', 'content', 'status', 'visibility']
      const hasTrackableChanges = trackableFields.some((field) => field in dirtyFields)

      if (!hasTrackableChanges) {
         return // Skip history if only autosave timestamp or vote_count changed
      }

      // Get original values from database
      const original = note.$original

      // Create history entry with PREVIOUS values
      await NoteHistory.create({
         noteId: note.id,
         userId: note.userId, // User who owns the note
         title: original.title,
         content: original.content,
         status: original.status,
         visibility: original.visibility,
      })
   }
}
