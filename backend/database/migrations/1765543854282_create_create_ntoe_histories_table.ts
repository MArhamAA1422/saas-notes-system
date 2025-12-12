import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
   protected tableName = 'note_histories'

   async up() {
      this.schema.createTable(this.tableName, (table) => {
         table.bigIncrements('id').primary()
         table.bigInteger('note_id').unsigned().notNullable()
         table.bigInteger('user_id').unsigned().notNullable() // Who made the change
         table.string('title', 500).notNullable() // Previous title
         table.text('content').nullable() // Previous content
         table.enum('status', ['draft', 'published']).notNullable() // Previous status
         table.enum('visibility', ['private', 'public']).notNullable() // Previous visibility

         table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())

         // Foreign Keys
         table
            .foreign('note_id', 'fk_note_histories_note_id')
            .references('id')
            .inTable('notes')
            .onDelete('CASCADE')
            .onUpdate('CASCADE')

         table
            .foreign('user_id', 'fk_note_histories_user_id')
            .references('id')
            .inTable('users')
            .onDelete('CASCADE')
            .onUpdate('CASCADE')

         // Indexes
         table.index('note_id', 'idx_note_histories_note_id')
         table.index('created_at', 'idx_note_histories_created_at') // For 7-day cleanup
         table.index(['note_id', 'created_at'], 'idx_note_histories_note_created') // For listing
      })
   }

   async down() {
      this.schema.dropTable(this.tableName)
   }
}
