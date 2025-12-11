import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Company from '#models/company'
import User from '#models/user'
import Workspace from '#models/workspace'

export default class InitialSeeder extends BaseSeeder {
   public async run() {
      const company = await Company.create({
         name: 'Localhost',
         hostname: 'localhost',
      })

      console.log(`Created company: ${company.name}`)

      const user = await User.create({
         fullName: 'Admin User',
         email: 'admin@localhost.com',
         password: '1234',
         tenantId: company.id,
      })

      console.log(`Created admin user: ${user.email}`)

      const workspaceNames = [
         'Workspace A',
         'Workspace B',
         'Workspace C',
         'Workspace D',
         'Workspace E',
      ]

      for (const name of workspaceNames) {
         await Workspace.create({
            name,
            tenantId: company.id,
         })
         console.log(`Created workspace: ${name}`)
      }

      console.log('Initial seeding completed.')
   }
}
