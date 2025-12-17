import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// DASHBOARD (PROTECTED)
router
   .get('/api/', '#controllers/dashboard_controller.index')
   .use([middleware.auth(), middleware.company()])

// Public routes
router
   .group(() => {
      router.post('/register', '#controllers/auth_controller.register')
      router.post('/login', '#controllers/auth_controller.login')
   })
   .prefix('/api/auth')

// Protected routes
router
   .group(() => {
      router.get('/me', '#controllers/auth_controller.me')
      router.post('/logout', '#controllers/auth_controller.logout')
   })
   .prefix('/api/auth')
   .use(middleware.auth())

// Notes routes
router
   .group(() => {
      // Workspace notes
      router.get('/workspaces/:workspaceId/notes', '#controllers/notes_controller.index')
      router.post('/workspaces/:workspaceId/notes', '#controllers/notes_controller.store')

      router.get('/notes/:type', '#controllers/notes_controller.getUserNotes')

      // Individual notes
      router.get('/notes/:id', '#controllers/notes_controller.show')
      router.put('/notes/:id', '#controllers/notes_controller.update')
      router.delete('/notes/:id', '#controllers/notes_controller.destroy')

      // Note actions
      router.patch('/notes/:id/autosave', '#controllers/notes_controller.autosave')
      router.post('/notes/:id/publish', '#controllers/notes_controller.publish')
      router.post('/notes/:id/unpublish', '#controllers/notes_controller.unpublish')
   })
   .prefix('/api')
   .use([middleware.auth(), middleware.company()])

// Public notes directory (protected but company-scoped)
router
   .group(() => {
      router.get('/notes', '#controllers/public_notes_controller.index')
      router.get('/notes/:id', '#controllers/public_notes_controller.show')
   })
   .prefix('/api/public')
   .use([middleware.auth(), middleware.company()])

// VOTING Routes
router
   .group(() => {
      // Vote on a note
      router.post('/notes/:id/vote', '#controllers/votes_controller.store')
      router.delete('/notes/:id/vote', '#controllers/votes_controller.destroy')
      router.get('/notes/:id/vote', '#controllers/votes_controller.show')

      // Vote statistics (public can see this too)
      router.get('/notes/:id/votes/stats', '#controllers/votes_controller.stats')
   })
   .prefix('/api')
   .use(middleware.auth())

// Workspace Routes
router
   .group(() => {
      router.get('/workspaces', '#controllers/workspaces_controller.index')
      router.get('/workspaces/:id', '#controllers/workspaces_controller.show')
   })
   .prefix('/api')
   .use([middleware.auth(), middleware.company()])

// Note History Routes
router
   .group(() => {
      router.get('/notes/:id/history', '#controllers/note_histories_controller.index')
      router.post(
         '/notes/:id/history/:historyId/restore',
         '#controllers/note_histories_controller.restore'
      )
      router.get('/notes/:id/history/stats', '#controllers/note_histories_controller.stats')
   })
   .prefix('/api')
   .use([middleware.auth(), middleware.company()])
