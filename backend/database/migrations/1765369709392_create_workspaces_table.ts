import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
   protected tableName = 'workspaces'

   async up() {
      this.schema.createTable(this.tableName, (table) => {
         table.bigIncrements('id').primary()
         table.bigInteger('tenant_id').unsigned().notNullable()
         table.string('name', 255).notNullable()

         table.timestamp('deleted_at', { useTz: true }).nullable()
         table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
         table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())

         // Foreign Keys
         table
            .foreign('tenant_id', 'fk_workspaces_tenant_id')
            .references('id')
            .inTable('companies')
            .onDelete('CASCADE')
            .onUpdate('CASCADE')

         // Indexes
         table.index('tenant_id', 'idx_workspaces_tenant_id')
      })
   }

   async down() {
      this.schema.dropTable(this.tableName)
   }
}
