'use client'

import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import TimelineSection from '@/components/TimelineSection'
import DressCodeSection from '@/components/DressCodeSection'
import ActivitiesSection from '@/components/ActivitiesSection'
import MinigameSection from '@/components/MinigameSection'
import Footer from '@/components/Footer'
import { useAudio } from '@/hooks/useAudio'

export default function HomePage() {
  const router = useRouter()
  const { playClickSound } = useAudio()

  const handleGoToBooking = () => {
    playClickSound()
    router.push('/book')
  }

  return (
    <div className="relative w-full min-h-screen bg-[#0D0D0D] text-white flex flex-col">
      {/* Sticky Header with Backdrop Blur */}
      <Header onOpenBooking={handleGoToBooking} />
      
      {/* Main Document Flow with Relative Blocks */}
      <main className="relative w-full flex-1 block">
        {/* Hero Section */}
        <HeroSection onBuyTicket={handleGoToBooking} />
        
        {/* Artistic Zigzag Timeline with Central Axis */}
        <TimelineSection />

        {/* Dress Code Section */}
        <DressCodeSection />
        
        {/* Club Activities Bento Grid */}
        <ActivitiesSection />
        
        {/* Stage Countdown Section */}
        <MinigameSection />
      </main>

      {/* Footer */}
      <Footer onBuyTicket={handleGoToBooking} />
    </div>
  )
}
