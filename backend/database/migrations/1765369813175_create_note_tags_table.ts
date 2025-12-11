import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
   protected tableName = 'note_tags'

   async up() {
      this.schema.createTable(this.tableName, (table) => {
         table.bigIncrements('id').primary()
         table.bigInteger('note_id').unsigned().notNullable()
         table.bigInteger('tag_id').unsigned().notNullable()

         table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())

         // Foreign Keys
         table
            .foreign('note_id', 'fk_note_tags_note_id')
            .references('id')
            .inTable('notes')
            .onDelete('CASCADE')
            .onUpdate('CASCADE')

         table
            .foreign('tag_id', 'fk_note_tags_tag_id')
            .references('id')
            .inTable('tags')
            .onDelete('CASCADE')
            .onUpdate('CASCADE')

         // Unique Constraint
         table.unique(['note_id', 'tag_id'], 'unique_note_tag')

         // Indexes
         table.index('note_id', 'idx_note_tags_note_id')
         table.index('tag_id', 'idx_note_tags_tag_id')
      })
   }

   async down() {
      this.schema.dropTable(this.tableName)
   }
}
