'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, CheckCircle, XCircle, AlertTriangle, Loader2, X, User, Hash, Building, Calendar, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import { formatDate, formatDateTime } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrcodeRef = useRef<unknown>(null)

  useEffect(() => {
    if (!authLoading && (!user || !['admin', 'dev'].includes(userRole))) {
      router.push('/')
    }
  }, [authLoading, user, userRole, router])

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
        async (decodedText) => {
          // Stop scanning on first successful scan
          try {
            await scanner.stop()
          } catch {}
          setScanning(false)
          await handleQRScan(decodedText)
        },
        () => {} // Error callback (ignore frame errors)
      )
    } catch (err) {
      console.error('Scanner error:', err)
      setScanning(false)
      playErrorSound()
    }
  }, [playClickSound, playErrorSound])

  const stopScanner = useCallback(async () => {
    playClickSound()
    if (html5QrcodeRef.current) {
      try {
        const scanner = html5QrcodeRef.current as { stop: () => Promise<void> }
        await scanner.stop()
      } catch {}
      html5QrcodeRef.current = null
    }
    setScanning(false)
  }, [playClickSound])

  useEffect(() => {
    return () => {
      if (html5QrcodeRef.current) {
        try {
          const scanner = html5QrcodeRef.current as { stop: () => Promise<void> }
          scanner.stop()
        } catch {}
      }
    }
  }, [])

  const handleQRScan = async (qrData: string) => {
    try {
      const res = await fetch('/api/admin/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_data: qrData }),
      })
      const data = await res.json()

      if (res.status === 409) {
        // Already checked in
        playErrorSound()
        setScanResult({ status: 'already_checked_in', ...data })
      } else if (res.ok) {
        playSuccessSound()
        setScanResult(data)
      } else {
        playErrorSound()
        setScanResult({ status: data.status || 'error', error: data.error })
      }
    } catch {
      playErrorSound()
      setScanResult({ status: 'error', error: 'Lỗi kết nối mạng' })
    }
  }

  const handleConfirmCheckIn = async () => {
    if (!scanResult?.ticket) return
    playClickSound()
    setConfirmingCheckIn(true)

    try {
      const res = await fetch('/api/admin/checkin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: scanResult.ticket.id }),
      })

      if (res.ok) {
        playSuccessSound()
        setCheckInSuccess(true)
        setScanResult(null)
        // Auto-reset after 3 seconds to scan next
        setTimeout(() => {
          setCheckInSuccess(false)
        }, 3000)
      } else {
        const data = await res.json()
        playErrorSound()
        alert(data.error || 'Lỗi check-in')
      }
    } finally {
      setConfirmingCheckIn(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <Loader2 size={32} className="text-[#D4AF37] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      {/* Header */}
      <div className="glass-dark border-b border-[#D4AF37]/10 px-4 py-3 flex items-center gap-3">
        <Link href="/admin" className="text-[#A8A090] hover:text-[#D4AF37] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-base font-bold text-[#F5F2EB]">QR Check-in Scanner</h1>
          <p className="text-xs text-[#A8A090]">Quét mã QR vé của khán giả</p>
        </div>
        <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-start p-4 max-w-md mx-auto w-full">
        {/* Success message */}
        <AnimatePresence>
          {checkInSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            >
              <div className="text-center p-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="w-24 h-24 mx-auto rounded-full bg-green-500 flex items-center justify-center mb-4 shadow-lg shadow-green-500/50"
                >
                  <CheckCircle size={48} className="text-white" />
                </motion.div>
                <div className="text-2xl font-black text-green-400">CHECK-IN THÀNH CÔNG!</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanner UI */}
        <div className="w-full mt-4">
          {!scanning && !scanResult && (
            <div className="text-center">
              <div className="w-64 h-64 mx-auto mb-6 rounded-2xl border-2 border-dashed border-[#D4AF37]/30 flex items-center justify-center">
                <Camera size={64} className="text-[#D4AF37]/30" />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startScanner}
                className="w-full bg-[#D4AF37] text-[#121212] font-black py-5 rounded-2xl text-lg glow-gold flex items-center justify-center gap-3"
              >
                <Camera size={24} />
                BẮT ĐẦU QUÉT QR
              </motion.button>
            </div>
          )}

          {/* Scanner view */}
          {scanning && (
            <div className="relative">
              <div id="qr-reader" className="w-full rounded-2xl overflow-hidden" />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <div className="qr-corner qr-corner-tl" />
                  <div className="qr-corner qr-corner-tr" />
                  <div className="qr-corner qr-corner-bl" />
                  <div className="qr-corner qr-corner-br" />
                  <motion.div
                    animate={{ y: [0, 240, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 right-0 h-0.5 bg-[#D4AF37] shadow-lg shadow-[#D4AF37]/50"
                  />
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-[#A8A090]">Hướng camera vào mã QR trên vé...</div>
              <button
                onClick={stopScanner}
                className="w-full mt-4 border border-red-500/30 text-red-400 font-semibold py-3 rounded-xl hover:bg-red-500/10 transition-colors"
              >
                Dừng Quét
              </button>
            </div>
          )}

          {/* Scan Result */}
          <AnimatePresence>
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Already checked in - ERROR */}
                {scanResult.status === 'already_checked_in' && (
                  <div className="rounded-2xl border-2 border-red-500 bg-red-900/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                        <AlertTriangle size={24} className="text-white" />
                      </div>
                      <div>
                        <div className="font-black text-red-400 text-lg">⚠️ CẢNH BÁO!</div>
                        <div className="text-sm text-red-300">{scanResult.error}</div>
                      </div>
                    </div>
                    {scanResult.ticket && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#A8A090]">Khách hàng</span>
                          <span className="text-[#F5F2EB] font-bold">{scanResult.ticket.full_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#A8A090]">Mã đơn</span>
                          <span className="text-red-400 font-mono">{scanResult.ticket.order_code}</span>
                        </div>
                      </div>
                    )}
                    <button onClick={() => { playClickSound(); setScanResult(null) }}
                      className="w-full mt-4 bg-[#2A2A2A] text-[#F5F2EB] font-bold py-3 rounded-xl hover:bg-[#3A3A3A] transition-colors">
                      Quét Tiếp
                    </button>
                  </div>
                )}

                {/* Ready to check in - SUCCESS */}
                {scanResult.status === 'ready' && scanResult.ticket && (
                  <div className="rounded-2xl border-2 border-[#D4AF37] bg-[#D4AF37]/5 p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center">
                        <CheckCircle size={24} className="text-[#121212]" />
                      </div>
                      <div>
                        <div className="font-black text-[#D4AF37] text-lg">VÉ HỢP LỆ</div>
                        <div className="text-xs text-[#A8A090]">Mã đơn: {scanResult.ticket.order_code}</div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {[
                        [User, 'Họ tên', scanResult.ticket.full_name],
                        [Calendar, 'Ngày sinh', formatDate(scanResult.ticket.dob)],
                        [Building, 'Trường/Đơn vị', scanResult.ticket.organization],
                        [Hash, 'Số may mắn', scanResult.ticket.lucky_number?.toString() || '-'],
                      ].map(([Icon, label, value]) => (
                        <div key={String(label)} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                            <Icon size={16} className="text-[#D4AF37]" />
                          </div>
                          <div>
                            <div className="text-xs text-[#A8A090]">{label}</div>
                            <div className="text-sm font-semibold text-[#F5F2EB]">{value}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmCheckIn}
                      disabled={confirmingCheckIn}
                      className="w-full bg-[#D4AF37] text-[#121212] font-black py-5 rounded-2xl text-xl glow-gold flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {confirmingCheckIn ? (
                        <Loader2 size={24} className="animate-spin" />
                      ) : (
                        <><CheckCircle size={24} /> XÁC NHẬN CHECK-IN</>
                      )}
                    </motion.button>

                    <button onClick={() => { playClickSound(); setScanResult(null) }}
                      className="w-full mt-3 text-[#A8A090] text-sm hover:text-[#F5F2EB] transition-colors">
                      Hủy / Quét Lại
                    </button>
                  </div>
                )}

                {/* Error states */}
                {['not_found', 'not_paid', 'invalid_qr', 'error'].includes(scanResult.status) && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-900/10 p-6 text-center">
                    <XCircle size={40} className="mx-auto mb-3 text-red-400" />
                    <div className="font-bold text-red-400 mb-2">
                      {scanResult.status === 'not_paid' ? 'Vé Chưa Thanh Toán' :
                       scanResult.status === 'not_found' ? 'Không Tìm Thấy Vé' :
                       scanResult.status === 'invalid_qr' ? 'QR Không Hợp Lệ' : 'Lỗi Hệ Thống'}
                    </div>
                    <p className="text-sm text-[#A8A090] mb-4">{scanResult.error}</p>
                    <button onClick={() => { playClickSound(); setScanResult(null) }}
                      className="w-full bg-[#2A2A2A] text-[#F5F2EB] font-bold py-3 rounded-xl hover:bg-[#3A3A3A] transition-colors">
                      Thử Lại
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Manual input fallback */}
          {!scanning && !scanResult && (
            <div className="mt-6">
              <p className="text-xs text-center text-[#A8A090] mb-3">Hoặc nhập mã QR thủ công</p>
              <div className="flex gap-2">
                <input
                  id="manual-qr"
                  placeholder="Dán nội dung mã QR..."
                  className="flex-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-2.5 text-sm text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  onClick={() => {
                    const val = (document.getElementById('manual-qr') as HTMLInputElement)?.value
                    if (val) handleQRScan(val)
                  }}
                  className="bg-[#D4AF37] text-[#121212] font-bold px-4 rounded-xl hover:bg-[#e8c845] transition-colors"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
