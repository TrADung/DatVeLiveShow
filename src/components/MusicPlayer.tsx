'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAudio } from '@/hooks/useAudio'

export default function MusicPlayer() {
  const [isMuted, setIsMuted] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const { toggleMute: toggleAudioMute, playClickSound } = useAudio()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Show after 1.5 seconds
    const timer = setTimeout(() => setIsVisible(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true)
        if (audioRef.current && !isMuted) {
          audioRef.current.play().catch(() => {})
        }
      }
    }

    document.addEventListener('click', handleFirstInteraction, { once: true })
    document.addEventListener('touchstart', handleFirstInteraction, { once: true })
    return () => {
      document.removeEventListener('click', handleFirstInteraction)
      document.removeEventListener('touchstart', handleFirstInteraction)
    }
  }, [hasInteracted, isMuted])

  const handleToggle = useCallback(() => {
    playClickSound()
    const newMuted = !isMuted
    setIsMuted(newMuted)
    toggleAudioMute()

    if (audioRef.current) {
      if (newMuted) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(() => {})
      }
    }
  }, [isMuted, playClickSound, toggleAudioMute])

  return (
    <>
      <audio
        ref={audioRef}
        loop
        preload="none"
        style={{ display: 'none' }}
      />

      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            onClick={handleToggle}
            className="fixed bottom-6 left-6 z-40 w-11 h-11 rounded-full bg-white text-slate-800 shadow-lg border border-slate-200 hover:border-red-600 hover:text-red-600 flex items-center justify-center cursor-pointer transition-all duration-200"
            title={isMuted ? 'Bật âm thanh & nhạc nền' : 'Tắt âm thanh'}
            aria-label="Toggle sound"
          >
            {isMuted ? (
              <VolumeX size={18} className="text-slate-500" />
            ) : (
              <Volume2 size={18} className="text-red-600" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
