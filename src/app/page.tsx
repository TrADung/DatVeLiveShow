'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import TimelineSection from '@/components/TimelineSection'
import ActivitiesSection from '@/components/ActivitiesSection'
import SponsorsMarquee from '@/components/SponsorsMarquee'
import BookingModal from '@/components/BookingModal'
import MusicPlayer from '@/components/MusicPlayer'
import MinigameSection from '@/components/MinigameSection'
import Footer from '@/components/Footer'

export default function HomePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  return (
    <main className="relative">
      <Header />
      
      <HeroSection onBuyTicket={() => setIsBookingOpen(true)} />
      
      <TimelineSection />
      
      <ActivitiesSection />
      
      <SponsorsMarquee />
      
      <MinigameSection />
      
      <Footer onBuyTicket={() => setIsBookingOpen(true)} />
      
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
      
      <MusicPlayer />
    </main>
  )
}
