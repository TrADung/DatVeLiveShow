'use client'

const sponsors = [
  { name: 'Yamaha Music VN', role: 'Đồng Hành Âm Thanh' },
  { name: 'Guitar Plus', role: 'Tài Trợ Nhạc Cụ' },
  { name: 'Red Chess Club', role: 'Cố Vấn Nghệ Thuật' },
  { name: 'Coffee House', role: 'Tài Trợ Địa Điểm' },
  { name: 'Acoustic Soul', role: 'Bảo Trợ Truyền Thông' },
  { name: 'VietQR Pay', role: 'Đối Tác Thanh Toán' },
]

export default function SponsorsMarquee() {
  const doubledSponsors = [...sponsors, ...sponsors, ...sponsors]

  return (
    <section className="py-12 border-b border-slate-200 bg-slate-50 overflow-hidden">
      <div className="mb-6 text-center">
        <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">
          ĐỐI TÁC & ĐƠN VỊ ĐỒNG HÀNH
        </p>
      </div>

      <div className="relative overflow-hidden">
        {/* Soft fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />

        <div className="marquee-inner flex items-center">
          {doubledSponsors.map((sponsor, i) => (
            <div
              key={i}
              className="flex items-center justify-center mx-3 sm:mx-4"
            >
              <div className="bg-white rounded-xl px-5 py-2.5 border border-slate-200 shadow-2xs hover:border-red-500 transition-colors flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <div>
                  <div className="text-xs font-black text-slate-900 whitespace-nowrap">
                    {sponsor.name}
                  </div>
                  <div className="text-[10px] text-slate-500 whitespace-nowrap">
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
