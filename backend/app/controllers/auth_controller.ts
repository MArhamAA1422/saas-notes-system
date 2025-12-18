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
      try {
         const payload = await request.validateUsing(createUserValidator)

         // Get company from hostname
         const hostname =
            (payload.email.includes('ezycomp') ? 'ezycomp' : request.hostname()) || 'localhost'
         const company = await Company.findBy('hostname', hostname)

         if (!company) {
            return response.badRequest({
               error: 'Unauthorized',
               message: `No company found for hostname: ${hostname}`,
            })
         }

         // Check if email already exists for this company
         const existingUser = await User.query()
            .where('email', payload.email)
            .where('tenant_id', company.id)
            .first()

         if (existingUser) {
            return response.conflict({
               error: 'Conflict',
               message: 'Credentials already exist',
            })
         }

         // Create user
         const user = await User.create({
            tenantId: company.id,
            fullName: payload.fullName,
            email: payload.email,
            password: payload.password, // hashed by model hook
         })

         // Save user session
         await session.regenerate()
         session.put('user_id', Number(user.id))

         return response.created({
            message: 'Registration successful',
            user: {
               id: user.id,
               fullName: user.fullName,
               email: user.email,
               tenantId: user.tenantId,
            },
         })
      } catch (error) {
         console.error('Registration error:', error)
         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong during registration',
         })
      }
   }

   /**
    * Login user
    */
   async login({ request, response, session }: HttpContext) {
      try {
         const payload = await request.validateUsing(loginValidator)

         const hostname =
            (payload.email.includes('ezycomp') ? 'ezycomp' : request.hostname()) || 'localhost'
         const company = await Company.findBy('hostname', hostname)

         if (!company) {
            return response.badRequest({
               error: 'Unauthorized',
               message: 'You are not authorized for this company',
            })
         }

         // Find user for this company
         const user = await User.query()
            .where('email', payload.email)
            .where('tenant_id', company.id)
            .first()

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

         // Save session
         session.regenerate()
         session.put('user_id', Number(user.id))

         return response.ok({
            message: 'Login successful',
            user: {
               id: user.id,
               fullName: user.fullName,
               email: user.email,
               tenantId: user.tenantId,
               company: {
                  id: company.id,
                  name: company.name,
               },
            },
         })
      } catch (error) {
         console.error('Login error:', error)
         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong during login',
         })
      }
   }

   /**
    * Logout user
    */
   async logout({ response, session }: HttpContext) {
      try {
         session.forget('user_id')
         await session.clear()

         return response.ok({
            message: 'Logout successful',
         })
      } catch (error) {
         console.error('Logout error:', error)
         return response.internalServerError({
            error: 'Server Error',
            message: 'Something went wrong during logout',
         })
      }
   }

   /**
    * Get current authenticated user
    */
   async me({ response, currentUser }: HttpContext) {
      return response.ok({
         user: {
            id: currentUser?.id,
            fullName: currentUser?.fullName,
            email: currentUser?.email,
            tenantId: currentUser?.tenantId,
            company: currentUser?.company
               ? {
                    id: currentUser.company.id,
                    name: currentUser.company.name,
                 }
               : null,
         },
      })
   }
}
