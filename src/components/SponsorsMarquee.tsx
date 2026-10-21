'use client'

const tickerItems = [
  { text: 'CHESS NIGHT LIVE CONCERT 2025', highlight: true },
  { text: 'YAMAHA MUSIC VIETNAM', sub: 'Đồng Hành Âm Thanh' },
  { text: '31.12.2025 • HÀ NỘI CONCERT HALL', highlight: true },
  { text: 'GUITAR PLUS STUDIO', sub: 'Tài Trợ Nhạc Cụ' },
  { text: 'ACOUSTIC & FULL BAND LIVE', highlight: true },
  { text: 'VIETQR AUTOMATION', sub: 'Đối Tác Thanh Toán' },
  { text: 'MINIGAME LUCKY DRAW #????', highlight: true },
  { text: 'THE COFFEE HOUSE', sub: 'Tài Trợ Đồ Uống' },
]

export default function SponsorsMarquee() {
  const repeatedItems = [...tickerItems, ...tickerItems, ...tickerItems]

  return (
    <section className="relative w-full block py-12 md:py-16 bg-[#141414] border-t border-b border-white/10 overflow-hidden">
      {/* Soft gradient edge masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-36 z-10 bg-gradient-to-r from-[#141414] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-36 z-10 bg-gradient-to-l from-[#141414] to-transparent pointer-events-none" />

      <div className="marquee-track flex items-center">
        {repeatedItems.map((item, i) => (
          <div key={i} className="flex items-center gap-6 sm:gap-8 mx-4 sm:mx-6 shrink-0">
            <div className="flex items-center gap-3">
              {item.highlight ? (
                <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-4 py-1.5 rounded-full flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E53935] animate-pulse" />
                  <span>{item.text}</span>
                </span>
              ) : (
                <div className="flex items-center gap-2.5">
                  <span className="text-xs sm:text-sm font-black text-neutral-300 tracking-wider uppercase">
                    {item.text}
                  </span>
                  {item.sub && (
                    <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wide">
                      ({item.sub})
                    </span>
                  )}
                </div>
              )}
            </div>
            <span className="text-[#D4AF37] text-sm select-none">✹</span>
          </div>
        ))}
      </div>
    </section>
  )
}
