'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import TimelineSection from '@/components/TimelineSection'
import ActivitiesSection from '@/components/ActivitiesSection'
import SponsorsMarquee from '@/components/SponsorsMarquee'
import MusicPlayer from '@/components/MusicPlayer'
import MinigameSection from '@/components/MinigameSection'
import Footer from '@/components/Footer'
import BookingModal from '@/components/BookingModal'
import { useAudio } from '@/hooks/useAudio'

export default function HomePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const { playClickSound } = useAudio()

  const handleOpenBooking = () => {
    playClickSound()
    setIsBookingOpen(true)
  }

  return (
    <div className="relative w-full min-h-screen bg-[#0D0D0D] text-white flex flex-col">
      {/* Sticky Header with Backdrop Blur */}
      <Header onOpenBooking={handleOpenBooking} />
      
      {/* Main Document Flow with Relative Blocks */}
      <main className="relative w-full flex-1 block">
        {/* Hero Section */}
        <HeroSection onBuyTicket={handleOpenBooking} />
        
        {/* Artistic Zigzag Timeline with Central Axis */}
        <TimelineSection />
        
        {/* Club Activities Bento Grid */}
        <ActivitiesSection />
        
        {/* Infinite Partners Marquee */}
        <SponsorsMarquee />
        
        {/* Stage Minigame & Countdown Section */}
        <MinigameSection />
      </main>

      {/* Footer */}
      <Footer onBuyTicket={handleOpenBooking} />

      {/* Independent Booking Modal Portal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      {/* Ambient Music Player */}
      <MusicPlayer />
    </div>
  )
}
