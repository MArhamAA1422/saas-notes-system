import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
   protected tableName = 'notes'

   async up() {
      this.schema.createTable(this.tableName, (table) => {
         table.bigIncrements('id').primary()
         table.bigInteger('workspace_id').unsigned().notNullable()
         table.bigInteger('user_id').unsigned().notNullable()
         table.string('title', 500).notNullable()
         table.text('content').nullable()
         table.enum('status', ['draft', 'published']).defaultTo('draft')
         table.enum('visibility', ['private', 'public']).defaultTo('private')
         table.integer('vote_count').defaultTo(0)

         table.timestamp('last_autosave_at', { useTz: true }).nullable()
         table.timestamp('deleted_at', { useTz: true }).nullable()
         table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
         table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

         // Foreign Keys
         table
            .foreign('workspace_id', 'fk_notes_workspace_id')
            .references('id')
            .inTable('workspaces')
            .onDelete('CASCADE')
            .onUpdate('CASCADE')

         table
            .foreign('user_id', 'fk_notes_user_id')
            .references('id')
            .inTable('users')
            .onDelete('CASCADE')
            .onUpdate('CASCADE')

         // Indexes
         table.index('workspace_id', 'idx_notes_workspace_id')
         table.index('user_id', 'idx_notes_user_id')
         table.index('status', 'idx_notes_status')
         table.index('visibility', 'idx_notes_visibility')
         table.index('vote_count', 'idx_notes_vote_count')
      })
   }

   async down() {
      this.schema.dropTable(this.tableName)
   }
}
