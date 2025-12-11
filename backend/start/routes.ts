import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

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
