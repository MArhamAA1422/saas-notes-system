import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Company from '#models/company'
import hash from '@adonisjs/core/services/hash'
import { createUserValidator } from '#validators/auth/create_user'
import { loginValidator } from '#validators/auth/login'

export default class AuthController {
   /**
    * Register a new user
    */
   async register({ request, response, session }: HttpContext) {
      // Validate input
      const payload = await request.validateUsing(createUserValidator)

      // Get company by hostname (or create default for localhost)
      const hostname = request.hostname() || 'localhost'

      let company = await Company.findBy('hostname', hostname)

      if (!company) {
         // Create default company for localhost/development
         company = await Company.create({
            name: 'Default Company',
            hostname: hostname,
         })
      }

      // Check if email already exists
      const existingUser = await User.findBy('email', payload.email)
      if (existingUser) {
         return response.conflict({
            error: 'Conflict',
            message: 'Email already registered',
         })
      }

      // Create user
      const user = await User.create({
         tenantId: company.id,
         fullName: payload.fullName,
         email: payload.email,
         password: payload.password, // Will be hashed by model hook
      })

      // Create session
      session.put('user_id', Number(user.id))

      return response.created({
         message: 'Registration successful',
         user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            companyId: user.tenantId,
         },
      })
   }

   /**
    * Login user
    */
   async login({ request, response, session }: HttpContext) {
      const payload = await request.validateUsing(loginValidator)

      // Find user
      const user = await User.findBy('email', payload.email)

      if (!user) {
         return response.unauthorized({
            error: 'Unauthorized',
            message: 'Invalid credentials',
         })
      }

      // Verify password
      const isPasswordValid = await hash.verify(user.password, payload.password)

      if (!isPasswordValid) {
         return response.unauthorized({
            error: 'Unauthorized',
            message: 'Invalid credentials',
         })
      }

      // Create session
      session.put('user_id', Number(user.id))

      return response.ok({
         message: 'Login successful',
         user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            companyId: user.tenantId,
         },
      })
   }

   /**
    * Logout user
    */
   async logout({ response, session }: HttpContext) {
      session.forget('user_id')
      await session.clear()

      return response.ok({
         message: 'Logout successful',
      })
   }

   /**
    * Get current authenticated user
    */
   async me({ response, auth }: HttpContext) {
      const user = auth.user

      await user?.load('company')

      return response.ok({
         user: {
            id: user?.id,
            fullName: user?.fullName,
            email: user?.email,
            companyId: user?.tenantId,
            company: {
               id: user?.company.id,
               name: user?.company.name,
               hostname: user?.company.hostname,
            },
         },
      })
   }
}
