import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
   protected tableName = 'companies'

   async up() {
      this.schema.createTable(this.tableName, (table) => {
         table.bigIncrements('id').primary()
         table.string('name', 255).notNullable()
         table.string('hostname', 255).notNullable().unique()

         table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
         table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

         // Indexes
         table.index('hostname', 'idx_companies_hostname')
      })
   }

   async down() {
      this.schema.dropTable(this.tableName)
   }
}
