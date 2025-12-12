import scheduler from 'adonisjs-scheduler/services/main'

// Run cleanup every day at 2:00 AM
scheduler.command('cleanup:old-histories').cron('0 2 * * *')

// Or every 6 hours
// scheduler.command('cleanup:old-histories').cron('0 */6 * * *')
