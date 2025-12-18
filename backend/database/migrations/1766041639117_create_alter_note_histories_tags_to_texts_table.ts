import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AlterNoteHistoriesTagsToText extends BaseSchema {
   protected tableName = 'note_histories'

   async up() {
      this.schema.alterTable(this.tableName, (table) => {
         table.text('tags').alter()
      })
   }

   async down() {
      this.schema.alterTable(this.tableName, (table) => {
         table.json('tags').alter()
      })
   }
}
