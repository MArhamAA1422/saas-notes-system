import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'

export default class AuthMiddleware {
   async handle(ctx: HttpContext, next: NextFn) {
      const userId = ctx.session.get('user_id')

      if (!userId) {
         return ctx.response.unauthorized({
            error: 'Unauthorized',
            message: 'Please login to continue',
         })
      }

      try {
         // Load user with company relationship
         const user = await User.query().where('id', userId).preload('company').firstOrFail()

         // Attach user to context for easy access
         ctx.currentUser = user

         await next()
      } catch (error) {
         ctx.session.forget('user_id')
         return ctx.response.unauthorized({
            error: 'Unauthorized',
            message: 'Invalid session',
         })
      }
   }
}
