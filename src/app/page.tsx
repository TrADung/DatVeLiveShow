'use client'

import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import TimelineSection from '@/components/TimelineSection'
import ActivitiesSection from '@/components/ActivitiesSection'
import SponsorsMarquee from '@/components/SponsorsMarquee'
import MusicPlayer from '@/components/MusicPlayer'
import MinigameSection from '@/components/MinigameSection'
import Footer from '@/components/Footer'
import { useAudio } from '@/hooks/useAudio'

export default function HomePage() {
  const router = useRouter()
  const { playClickSound } = useAudio()

  const handleNavigateToBook = () => {
    playClickSound()
    router.push('/book')
  }

  return (
    <main className="relative min-h-screen bg-[#0A0A0C] text-white overflow-hidden">
      <Header />
      
      <HeroSection onBuyTicket={handleNavigateToBook} />
      
      <TimelineSection />
      
      <ActivitiesSection />
      
      <SponsorsMarquee />
      
      <MinigameSection />
      
      <Footer onBuyTicket={handleNavigateToBook} />
      
      <MusicPlayer />
    </main>
  )
}
