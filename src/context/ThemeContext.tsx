'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAudio } from '@/hooks/useAudio'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  isLight: boolean
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)
  const { playClickSound } = useAudio()

  useEffect(() => {
    // Read saved theme from localStorage, default to 'light' per user preference
    try {
      const saved = localStorage.getItem('dtu_theme') as Theme | null
      const initialTheme: Theme = saved === 'dark' ? 'dark' : 'light'
      setThemeState(initialTheme)
      applyTheme(initialTheme)
    } catch {
      applyTheme('light')
    }
    setMounted(true)
  }, [])

  const applyTheme = (t: Theme) => {
    const root = document.documentElement
    root.setAttribute('data-theme', t)
    if (t === 'light') {
      root.classList.remove('dark')
      root.classList.add('light')
    } else {
      root.classList.remove('light')
      root.classList.add('dark')
    }
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem('dtu_theme', newTheme)
    } catch {}
    applyTheme(newTheme)
  }

  const toggleTheme = () => {
    playClickSound()
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        isLight: mounted ? theme === 'light' : true,
        isDark: mounted ? theme === 'dark' : false,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
