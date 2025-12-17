import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Company from '#models/company'
import Workspace from '#models/workspace'
import Note from '#models/note'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class NotesSeeder extends BaseSeeder {
   public static environment = ['development', 'testing']

   public async run() {
      const notesPerCompany = 250_000
      const batchSize = 5_000

      const companies = await Company.query()
      console.log(`Found ${companies.length} companies.`)

      for (const company of companies) {
         console.log(`\nProcessing company: ${company.hostname}`)

         const workspaces = await Workspace.query().where('tenant_id', company.id).orderBy('id')

         if (workspaces.length === 0) {
            console.log(`No workspaces for ${company.hostname}`)
            continue
         }

         const users = await User.query().where('tenant_id', company.id).select('id')

         if (users.length === 0) {
            console.log(`No users for ${company.hostname}`)
            continue
         }

         console.log(`→ ${workspaces.length} workspaces, ${users.length} users`)

         let workspaceIndex = 0
         let userIndex = 0

         for (let i = 0; i < notesPerCompany; i += batchSize) {
            const batch: any[] = []
            const remaining = notesPerCompany - i
            const count = Math.min(batchSize, remaining)

            for (let j = 0; j < count; j++) {
               const workspace = workspaces[workspaceIndex]
               const user = users[userIndex]

               workspaceIndex = (workspaceIndex + 1) % workspaces.length
               userIndex = (userIndex + 1) % users.length

               const status = Math.random() > 0.5 ? 'draft' : 'published'

               const visibility =
                  status === 'draft' ? 'private' : Math.random() > 0.5 ? 'public' : 'private'

               batch.push({
                  workspaceId: workspace.id,
                  userId: user.id,
                  title: `Sample ${company.hostname} Note #${i + j + 1}`,
                  content: `This is a ${company.hostname} note generated for performance testing.`,
                  status,
                  visibility,
                  voteCount: Math.floor(Math.random() * 100),
                  createdAt: DateTime.now(),
                  updatedAt: DateTime.now(),
               })
            }

            await Note.createMany(batch)

            console.log(`Inserted ${i + count}/${notesPerCompany} notes for ${company.hostname}`)
         }

         console.log(`Completed seeding for ${company.hostname}`)
      }

      console.log('\nNotes seeding finished successfully')
   }
}
