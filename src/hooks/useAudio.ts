'use client'

import { useEffect, useRef, useCallback } from 'react'

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const bgMusicRef = useRef<HTMLAudioElement | null>(null)
  const isMutedRef = useRef(false)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playClickSound = useCallback(() => {
    if (isMutedRef.current) return
    try {
      const ctx = getAudioContext()
      
      // Create oscillator for wood "thock" sound
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      
      oscillator.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(ctx.destination)
      
      // Deep, woody thock
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(120, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08)
      
      filter.type = 'lowpass'
      filter.frequency.value = 400
      filter.Q.value = 2
      
      gainNode.gain.setValueAtTime(0.4, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.15)
    } catch {
      // Audio not supported
    }
  }, [getAudioContext])

  const playSuccessSound = useCallback(() => {
    if (isMutedRef.current) return
    try {
      const ctx = getAudioContext()
      
      // Ascending arpeggio
      const notes = [261.63, 329.63, 392.00, 523.25] // C4, E4, G4, C5
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        
        osc.type = 'sine'
        osc.frequency.value = freq
        
        const startTime = ctx.currentTime + i * 0.1
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3)
        
        osc.start(startTime)
        osc.stop(startTime + 0.3)
      })
    } catch {
      // Audio not supported
    }
  }, [getAudioContext])

  const playErrorSound = useCallback(() => {
    if (isMutedRef.current) return
    try {
      const ctx = getAudioContext()
      
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.type = 'square'
      osc.frequency.setValueAtTime(200, ctx.currentTime)
      osc.frequency.setValueAtTime(150, ctx.currentTime + 0.1)
      osc.frequency.setValueAtTime(100, ctx.currentTime + 0.2)
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
    } catch {
      // Audio not supported
    }
  }, [getAudioContext])

  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current
    if (bgMusicRef.current) {
      bgMusicRef.current.muted = isMutedRef.current
    }
    return isMutedRef.current
  }, [])

  const isMuted = useCallback(() => isMutedRef.current, [])

  return { playClickSound, playSuccessSound, playErrorSound, toggleMute, isMuted }
}
