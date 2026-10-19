'use client'

import { motion } from 'framer-motion'

const sponsors = [
  { name: 'Sponsor A', logo: 'https://via.placeholder.com/120x40/D4AF37/121212?text=SPONSOR+A' },
  { name: 'Sponsor B', logo: 'https://via.placeholder.com/120x40/6E472B/F5F2EB?text=SPONSOR+B' },
  { name: 'Partner C', logo: 'https://via.placeholder.com/120x40/1A1A1A/D4AF37?text=PARTNER+C' },
  { name: 'Sponsor D', logo: 'https://via.placeholder.com/120x40/D4AF37/121212?text=SPONSOR+D' },
  { name: 'Partner E', logo: 'https://via.placeholder.com/120x40/6E472B/F5F2EB?text=PARTNER+E' },
  { name: 'Sponsor F', logo: 'https://via.placeholder.com/120x40/1A1A1A/D4AF37?text=SPONSOR+F' },
]

export default function SponsorsMarquee() {
  const doubledSponsors = [...sponsors, ...sponsors]

  return (
    <section className="py-12 border-t border-b border-[#D4AF37]/10 bg-[#0D0D0D] overflow-hidden">
      <div className="mb-6 text-center">
        <p className="text-xs text-[#A8A090] tracking-widest uppercase">Đối Tác & Nhà Tài Trợ</p>
      </div>
      
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#0D0D0D] to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#0D0D0D] to-transparent" />
        
        <div className="marquee-inner">
          {doubledSponsors.map((sponsor, i) => (
            <div
              key={i}
              className="flex items-center justify-center mx-8 opacity-50 hover:opacity-100 transition-opacity"
            >
              <div className="glass-dark rounded-lg px-6 py-3 border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all">
                <span className="text-sm font-semibold text-[#A8A090] whitespace-nowrap tracking-wider">
                  {sponsor.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
