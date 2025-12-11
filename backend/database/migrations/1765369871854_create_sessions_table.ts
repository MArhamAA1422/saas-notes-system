import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
   protected tableName = 'sessions'

   async up() {
      this.schema.createTable(this.tableName, (table) => {
         table.string('id', 255).primary()
         table.bigInteger('user_id').unsigned().nullable()
         table.string('ip_address', 45).nullable()
         table.text('user_agent').nullable()
         table.text('payload').notNullable()
         table.integer('last_activity').notNullable()

         // Indexes
         table.index('user_id', 'idx_sessions_user_id')
         table.index('last_activity', 'idx_sessions_last_activity')
      })
   }

   async down() {
      this.schema.dropTable(this.tableName)
   }
}
