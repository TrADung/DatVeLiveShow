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

  const fetchUserRole = useCallback(async (email: string) => {
    const { data } = await supabase
      .from('users_role')
      .select('role')
      .eq('email', email)
      .single()
    
    return (data?.role as UserRole) || 'user'
  }, [supabase])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user?.email) {
        const role = await fetchUserRole(user.email)
        setUserRole(role)
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user?.email) {
        const role = await fetchUserRole(session.user.email)
        setUserRole(role)
      } else {
        setUserRole('user')
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchUserRole])

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })
    return { error }
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [supabase])

  return { user, userRole, loading, signInWithGoogle, signOut }
}
