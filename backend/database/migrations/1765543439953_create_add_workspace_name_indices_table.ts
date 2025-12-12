import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
   protected tableName = 'workspaces'

   async up() {
      this.schema.raw(`
      ALTER TABLE ${this.tableName} 
      ADD INDEX idx_workspaces_name (name)
    `)
   }

   async down() {
      this.schema.raw(`
      ALTER TABLE ${this.tableName} 
      DROP INDEX idx_workspaces_name
    `)
   }
}
