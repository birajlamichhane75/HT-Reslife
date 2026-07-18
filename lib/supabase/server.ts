import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
        set(name, value, options) { 
          try {
            cookieStore.set({ name, value, ...options }) 
          } catch (error) {
            // Ignore error if cookies are set during component rendering
          }
        },
        remove(name, options) { 
          try {
            cookieStore.set({ name, value: '', ...options }) 
          } catch (error) {
            // Ignore error if cookies are deleted during component rendering
          }
        },
      },
    }
  )
}

// Service role client — only use in server-side admin operations
export function createServiceRoleClient() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
