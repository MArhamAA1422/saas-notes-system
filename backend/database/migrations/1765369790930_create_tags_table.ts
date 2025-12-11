import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
   protected tableName = 'tags'

   async up() {
      this.schema.createTable(this.tableName, (table) => {
         table.bigIncrements('id').primary()
         table.string('name', 100).notNullable().unique()

         table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
         table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

         // Indexes
         table.index('name', 'idx_tags_name')
      })
   }

   async down() {
      this.schema.dropTable(this.tableName)
   }
}
