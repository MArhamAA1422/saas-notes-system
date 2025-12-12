import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Company from '#models/company'
import Workspace from '#models/workspace'
import Note from '#models/note'
import { DateTime } from 'luxon'

export default class NotesSeeder extends BaseSeeder {
   public static environment = ['development', 'testing']

   public async run() {
      const notesPerCompany = 250_000
      const batchSize = 5_000 // Insert in batches of 5k for performance

      const companies = await Company.query()
      console.log(`Found ${companies.length} companies.`)

      for (const company of companies) {
         console.log(`Processing company: ${company.hostname}`)

         const workspaces = await Workspace.query().where('tenant_id', company.id).orderBy('id')

         if (workspaces.length === 0) {
            console.log(`❌ No workspaces for company ${company.hostname}`)
            continue
         }

         console.log(`→ Workspaces for ${company.hostname}: ${workspaces.length}`)

         // Distribute evenly across workspaces
         let workspaceIndex = 0

         for (let i = 0; i < notesPerCompany; i += batchSize) {
            const batch: any[] = []
            const remaining = notesPerCompany - i
            const count = Math.min(batchSize, remaining)

            for (let j = 0; j < count; j++) {
               const workspace = workspaces[workspaceIndex]
               workspaceIndex = (workspaceIndex + 1) % workspaces.length

               batch.push({
                  workspaceId: workspace.id,
                  userId: Math.floor(Math.random() * 10) + 2, // simplify: assign user_id = 1 (or random later)
                  title: `Sample Note ${i + j + 1} - ${company.hostname}`,
                  content: 'This is a generated test note used for performance and scaling tests.',
                  status: Math.random() > 0.5 ? 'draft' : 'published',
                  visibility: Math.random() > 0.5 ? 'private' : 'public',
                  voteCount: Math.floor(Math.random() * 100),
                  createdAt: DateTime.now(),
                  updatedAt: DateTime.now(),
               })
            }

            await Note.createMany(batch)

            console.log(`Inserted ${i + count}/${notesPerCompany} notes for ${company.hostname}`)
         }

         console.log(`✅ Completed: ${notesPerCompany} notes for company ${company.hostname}`)
      }
   }
}
