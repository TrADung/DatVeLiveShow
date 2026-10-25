'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/types'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole>('user')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchUserRole = useCallback(async (email: string): Promise<UserRole> => {
    const cleanEmail = email.toLowerCase().trim()
    // Master admin account
    if (cleanEmail === 'trananhdung11102006@gmail.com') return 'dev'

    try {
      const { data, error } = await supabase
        .from('users_role')
        .select('role')
        .eq('email', cleanEmail)
        .single()

      if (!error && data?.role) {
        return data.role as UserRole
      }
    } catch {
      // In case table or connection is not ready
    }
    return 'user'
  }, [supabase])

  useEffect(() => {
    // Clear any obsolete demo sessions from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_user_session')
    }

    const initAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          if (user.email) {
            const role = await fetchUserRole(user.email)
            setUserRole(role)
          }
        } else {
          setUser(null)
          setUserRole('user')
        }
      } catch (err) {
        console.warn('Supabase auth check error:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        if (session.user.email) {
          const role = await fetchUserRole(session.user.email)
          setUserRole(role)
        }
      } else {
        setUser(null)
        setUserRole('user')
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchUserRole])

  const signInWithGoogle = useCallback(async () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      })
      return { data, error }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }, [supabase])

  const signInWithEmail = useCallback(async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      })
      if (!error && data?.user?.email) {
        setUser(data.user)
        const role = await fetchUserRole(data.user.email)
        setUserRole(role)
      }
      return { data, error }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }, [supabase, fetchUserRole])

  const signUpWithEmail = useCallback(async (email: string, pass: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: name,
          },
        },
      })
      return { data, error }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch {}
    setUser(null)
    setUserRole('user')
  }, [supabase])

  return {
    user,
    userRole,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  }
}
