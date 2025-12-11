import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
   protected tableName = 'votes'

   async up() {
      this.schema.createTable(this.tableName, (table) => {
         table.bigIncrements('id').primary()
         table.bigInteger('note_id').unsigned().notNullable()
         table.bigInteger('user_id').unsigned().notNullable()
         table.enum('vote_type', ['up', 'down']).notNullable()

         table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
         table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

         // Foreign Keys
         table
            .foreign('note_id', 'fk_votes_note_id')
            .references('id')
            .inTable('notes')
            .onDelete('CASCADE')
            .onUpdate('CASCADE')

         table
            .foreign('user_id', 'fk_votes_user_id')
            .references('id')
            .inTable('users')
            .onDelete('CASCADE')
            .onUpdate('CASCADE')

         // Unique Constraint (one vote per user per note)
         table.unique(['user_id', 'note_id'], 'unique_user_note_vote')

         // Indexes
         table.index('note_id', 'idx_votes_note_id')
         table.index('user_id', 'idx_votes_user_id')
      })
   }

   async down() {
      this.schema.dropTable(this.tableName)
   }
}
