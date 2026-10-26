'use client'

import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'

interface ThemeToggleProps {
  showLabel?: boolean
  className?: string
}

export default function ThemeToggle({ showLabel = false, className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme, isLight } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 cursor-pointer select-none active:scale-95 ${
        isLight
          ? 'bg-amber-100/60 hover:bg-amber-100 border-amber-300/60 text-amber-900 shadow-sm'
          : 'bg-white/5 hover:bg-white/10 border-white/15 text-neutral-200 hover:border-[#D4AF37]/50 shadow-md'
      } ${className}`}
      title={isLight ? 'Chuyển sang Chế độ Tối (Dark mode)' : 'Chuyển sang Chế độ Sáng (#EEE5D8)'}
      aria-label="Toggle theme"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isLight ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: 90, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={15} className="text-amber-800" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            exit={{ rotate: -90, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={15} className="text-[#D4AF37]" />
          </motion.div>
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-bold tracking-tight">
          {isLight ? 'Tối' : 'Sáng'}
        </span>
      )}
    </button>
  )
}
