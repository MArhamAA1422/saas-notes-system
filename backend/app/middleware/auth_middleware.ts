import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'

export default class AuthMiddleware {
   async handle(ctx: HttpContext, next: NextFn) {
      const userId = ctx.session.get('user_id')
      // console.log('HERE', ctx.session)

      if (!userId) {
         return ctx.response.unauthorized({
            error: 'Unauthorized',
            message: 'Please login to continue',
         })
      }

      try {
         // Load user with company info
         const user = await User.query().where('id', userId).preload('company').firstOrFail()

         // Attach user to context
         ctx.currentUser = user

         // Tenant/company isolation: you can also validate hostname here if needed
         // const hostname = ctx.request.hostname()
         // if (user.tenantId !== company.id) { ... }

         await next()
      } catch (error) {
         console.error('AuthMiddleware error:', error)
         ctx.session.forget('user_id')
         return ctx.response.unauthorized({
            error: 'Unauthorized',
            message: 'Invalid session or user not found',
         })
      }
   }
}
