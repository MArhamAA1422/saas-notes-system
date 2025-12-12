import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
   protected tableName = 'notes'

   async up() {
      this.schema.raw(`
      ALTER TABLE ${this.tableName} 
      ADD FULLTEXT INDEX idx_notes_title_fulltext (title)
    `)
   }

   async down() {
      this.schema.raw(`
      ALTER TABLE ${this.tableName} 
      DROP INDEX idx_notes_title_fulltext
    `)
   }
}
