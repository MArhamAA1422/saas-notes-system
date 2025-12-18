import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
   protected tableName = 'note_histories'

   async up() {
      this.schema.alterTable(this.tableName, (table) => {
         table.json('tags').nullable().after('visibility')
      })
   }

   async down() {
      this.schema.alterTable(this.tableName, (table) => {
         table.dropColumn('tags')
      })
   }
}
