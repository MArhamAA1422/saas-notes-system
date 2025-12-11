import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Middleware to ensure user belongs to the company they're trying to access
 * Must be used after auth middleware
 */
export default class CompanyMiddleware {
   async handle(ctx: HttpContext, next: NextFn) {
      const user = ctx.currentUser

      if (!user) {
         return ctx.response.unauthorized({
            error: 'Unauthorized',
            message: 'Authentication required',
         })
      }

      // Attach company ID to context for easy scoping
      ctx.tenantId = Number(user.tenantId)

      await next()
   }
}
