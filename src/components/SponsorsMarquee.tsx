'use client'

const sponsors = [
  { name: 'Yamaha Music VN', role: 'Đồng Hành Âm Thanh' },
  { name: 'Guitar Plus', role: 'Tài Trợ Nhạc Cụ' },
  { name: 'Red Chess Club', role: 'Cố Vấn Nghệ Thuật' },
  { name: 'The Coffee House', role: 'Tài Trợ Địa Điểm' },
  { name: 'Acoustic Soul', role: 'Bảo Trợ Truyền Thông' },
  { name: 'VietQR Pay', role: 'Đối Tác Thanh Toán' },
]

export default function SponsorsMarquee() {
  const doubledSponsors = [...sponsors, ...sponsors, ...sponsors]

  return (
    <section className="py-16 sm:py-20 border-b border-slate-200 bg-slate-50 overflow-hidden">
      <div className="mb-8 text-center">
        <div className="inline-block text-xs font-black text-slate-500 tracking-widest uppercase bg-white border border-slate-200 px-4 py-1.5 rounded-full shadow-2xs">
          ĐỐI TÁC & ĐƠN VỊ ĐỒNG HÀNH
        </div>
      </div>

      <div className="relative overflow-hidden">
        {/* Soft fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />

        <div className="marquee-inner flex items-center py-2">
          {doubledSponsors.map((sponsor, i) => (
            <div
              key={i}
              className="flex items-center justify-center mx-3 sm:mx-4"
            >
              <div className="bg-white rounded-2xl px-6 py-3.5 border border-slate-200 shadow-2xs hover:border-red-500 transition-colors flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                <div>
                  <div className="text-xs sm:text-sm font-black text-slate-900 whitespace-nowrap">
                    {sponsor.name}
                  </div>
                  <div className="text-[11px] text-slate-500 whitespace-nowrap font-medium">
                    {sponsor.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
