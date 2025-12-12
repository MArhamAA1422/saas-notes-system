import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import NoteHistory from '#models/note_history'
import { DateTime } from 'luxon'

export default class CleanupOldHistories extends BaseCommand {
   static commandName = 'cleanup:old_histories'
   static description = 'Delete note history entries older than 7 days'

   static options: CommandOptions = {
      startApp: true,
      allowUnknownFlags: false,
      staysAlive: false,
   }

   async run() {
      this.logger.info('Starting cleanup of old history entries...')

      const sevenDaysAgo = DateTime.now().minus({ days: 7 })

      try {
         // Delete in batches to avoid locking the table for too long
         const batchSize = 1000
         let totalDeleted = 0
         let hasMore = true

         while (hasMore) {
            const deleted = await NoteHistory.query()
               .where('created_at', '<', sevenDaysAgo.toSQL())
               .limit(batchSize)
               .delete()

            totalDeleted += Number(deleted)

            // If deleted less than batch size, we're done
            if (Number(deleted) < batchSize) {
               hasMore = false
            }

            // Small delay between batches to prevent overwhelming the database
            if (hasMore) {
               await new Promise((resolve) => setTimeout(resolve, 100))
            }
         }

         this.logger.success(`Deleted ${totalDeleted} old history entries`)
      } catch (error) {
         this.logger.error('Failed to cleanup old histories')
         this.logger.error(error.message)
         this.exitCode = 1
      }
   }
}
