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
    // Show after 2 seconds
    const timer = setTimeout(() => setIsVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true)
        // Auto-play ambient music on first interaction
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
      {/* Ambient music - using a looping ambient track */}
      <audio
        ref={audioRef}
        loop
        preload="none"
        style={{ display: 'none' }}
      />
      
      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={handleToggle}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full glass-dark 
                       flex items-center justify-center cursor-pointer 
                       border border-[#D4AF37]/30 hover:border-[#D4AF37]/60
                       transition-all duration-300 hover:glow-gold-sm group"
            title={isMuted ? 'Bật nhạc nền' : 'Tắt nhạc nền'}
          >
            <motion.div
              animate={{ rotate: isMuted ? 0 : [0, -5, 5, -5, 0] }}
              transition={{ duration: 0.5, repeat: isMuted ? 0 : Infinity, repeatDelay: 3 }}
            >
              {isMuted ? (
                <VolumeX size={20} className="text-[#A8A090] group-hover:text-[#D4AF37] transition-colors" />
              ) : (
                <Volume2 size={20} className="text-[#D4AF37]" />
              )}
            </motion.div>
            
            {/* Ripple when playing */}
            {!isMuted && (
              <motion.span
                className="absolute inset-0 rounded-full border border-[#D4AF37]/40"
                animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
