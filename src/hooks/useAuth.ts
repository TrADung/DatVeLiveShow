'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/types'
import type { User } from '@supabase/supabase-js'

export interface DemoUser {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | DemoUser | null>(null)
  const [userRole, setUserRole] = useState<UserRole>('user')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchUserRole = useCallback(async (email: string): Promise<UserRole> => {
    // Check local dev/admin shortcut
    if (email.includes('admin') || email.includes('btc')) return 'admin'
    if (email.includes('dev')) return 'dev'

    try {
      const { data, error } = await supabase
        .from('users_role')
        .select('role')
        .eq('email', email)
        .single()
      
      if (!error && data?.role) {
        return data.role as UserRole
      }
    } catch {
      // Fallback
    }
    return 'user'
  }, [supabase])

  useEffect(() => {
    const initAuth = async () => {
      // 1. Check local demo user session first
      const savedDemo = typeof window !== 'undefined' ? localStorage.getItem('demo_user_session') : null
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo)
          setUser(parsed.user)
          setUserRole(parsed.role || 'user')
          setLoading(false)
          return
        } catch {}
      }

      // 2. Check Supabase session
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          if (user.email) {
            const role = await fetchUserRole(user.email)
            setUserRole(role)
          }
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
        const savedDemo = typeof window !== 'undefined' ? localStorage.getItem('demo_user_session') : null
        if (!savedDemo) {
          setUser(null)
          setUserRole('user')
        }
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchUserRole])

  const signInWithGoogle = useCallback(async () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      })
      if (error) {
        console.error('Google OAuth error:', error.message)
        return { error }
      }
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }, [supabase])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (!error && data.user) {
        setUser(data.user)
        const role = await fetchUserRole(email)
        setUserRole(role)
        if (typeof window !== 'undefined') localStorage.removeItem('demo_user_session')
      }
      return { data, error }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }, [supabase, fetchUserRole])

  const signUpWithEmail = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })
      if (!error && data.user) {
        setUser(data.user)
        setUserRole('user')
      }
      return { data, error }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }, [supabase])

  const quickDemoLogin = useCallback(async (email: string, role: UserRole = 'user', name: string = 'Khán Giả') => {
    const demoUser: DemoUser = {
      id: `demo-${Date.now()}`,
      email,
      user_metadata: {
        full_name: name,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      },
    }
    setUser(demoUser)
    setUserRole(role)
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_user_session', JSON.stringify({ user: demoUser, role }))
    }
    return { success: true }
  }, [])

  const signOut = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_user_session')
    }
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
    quickDemoLogin,
    signOut,
  }
}
