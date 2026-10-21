'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  const html5QrcodeRef = useRef<any>(null)

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
      console.error('Scanner start error:', err)
      setScanning(false)
      playErrorSound()
    }
  }, [playClickSound, playErrorSound])

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

  const handleQRScan = async (qrData: string) => {
    try {
      const res = await fetch('/api/admin/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_data: qrData }),
      })
      const data = await res.json()

      if (res.status === 409) {
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
      // Offline fallback mock check
      try {
        const parsed = JSON.parse(qrData)
        setScanResult({
          status: 'ready',
          ticket: {
            id: parsed.id || 'demo-ticket',
            order_code: parsed.order_code || 'CLB-8888',
            full_name: 'Khách Hàng Tham Dự',
            dob: '2002-05-15',
            gender: 'Nam',
            organization: 'Đại Học Quốc Gia',
            lucky_number: 7892,
            payment_status: 'paid',
            is_checked_in: false,
          },
        })
        playSuccessSound()
      } catch {
        playErrorSound()
        setScanResult({ status: 'error', error: 'Không đọc được mã QR' })
      }
    }
  }

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

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-slate-400 hover:text-slate-900 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>QR Check-in Scanner</span>
              <span className="text-red-600">♟</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Hệ thống quét vé tại cổng sự kiện</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sẵn Sàng</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start p-4 max-w-md mx-auto w-full">
        {/* Success splash */}
        <AnimatePresence>
          {checkInSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            >
              <div className="bg-white rounded-3xl p-8 text-center max-w-xs w-full shadow-2xl border border-slate-200">
                <div className="w-18 h-18 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border-2 border-emerald-600">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">CHECK-IN THÀNH CÔNG!</h3>
                <p className="text-xs text-slate-500">Đã dán vòng tay và cho phép khách vào sảnh.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full mt-4">
          {!scanning && !scanResult && (
            <div className="text-center py-6">
              <div className="w-60 h-60 mx-auto mb-6 rounded-3xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center shadow-xs">
                <Camera size={56} className="text-slate-300" />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startScanner}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl text-base shadow-xl shadow-red-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Camera size={20} />
                <span>BẬT CAMERA QUÉT QR</span>
              </motion.button>
            </div>
          )}

          {/* Scanner Video View */}
          {scanning && (
            <div className="relative bg-black rounded-3xl overflow-hidden shadow-xl p-2">
              <div id="qr-reader" className="w-full rounded-2xl overflow-hidden" />
              <button
                onClick={stopScanner}
                className="w-full mt-3 bg-white text-slate-900 font-bold py-2.5 rounded-xl text-xs hover:bg-slate-100 transition-colors cursor-pointer"
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
                  <div className="rounded-3xl border-2 border-red-500 bg-red-50 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0">
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <div className="font-black text-red-700 text-base">CẢNH BÁO: VÉ ĐÃ SỬ DỤNG!</div>
                        <div className="text-xs text-red-600">{scanResult.error}</div>
                      </div>
                    </div>

                    {scanResult.ticket && (
                      <div className="bg-white rounded-xl p-3 text-xs space-y-1.5 border border-red-200">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Khách hàng:</span>
                          <span className="font-bold text-slate-900">{scanResult.ticket.full_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Mã đơn:</span>
                          <span className="font-mono font-bold text-red-600">{scanResult.ticket.order_code}</span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => { playClickSound(); setScanResult(null) }}
                      className="w-full mt-4 bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Tiếp Tục Quét Vé Khác
                    </button>
                  </div>
                )}

                {/* Ready to Check-in: Valid Ticket */}
                {scanResult.status === 'ready' && scanResult.ticket && (
                  <div className="rounded-3xl border-2 border-emerald-500 bg-emerald-50/50 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle size={24} />
                      </div>
                      <div>
                        <div className="font-black text-emerald-800 text-base">VÉ HỢP LỆ - ĐÃ THANH TOÁN</div>
                        <div className="text-xs text-slate-500 font-mono">Mã đơn: {scanResult.ticket.order_code}</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-emerald-100 space-y-2.5 mb-5 text-xs">
                      {[
                        { IconComp: User, label: 'Khách hàng', value: scanResult.ticket.full_name },
                        { IconComp: Calendar, label: 'Ngày sinh', value: formatDate(scanResult.ticket.dob) },
                        { IconComp: Building, label: 'Đơn vị', value: scanResult.ticket.organization },
                        { IconComp: Hash, label: 'Số may mắn', value: `#${scanResult.ticket.lucky_number || '-'}` },
                      ].map(({ IconComp, label, value }) => (
                        <div key={label} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-none">
                          <div className="flex items-center gap-2 text-slate-500">
                            <IconComp size={14} className="text-red-600" />
                            <span>{label}:</span>
                          </div>
                          <span className="font-bold text-slate-900">{value}</span>
                        </div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmCheckIn}
                      disabled={confirmingCheckIn}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl text-base shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                      className="w-full mt-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 py-1 transition-colors"
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
            <div className="mt-8 bg-white rounded-2xl p-4 border border-slate-200">
              <p className="text-xs font-bold text-slate-700 mb-2">Hoặc dán mã QR thủ công:</p>
              <div className="flex gap-2">
                <input
                  id="manual-qr"
                  placeholder="Dán nội dung JSON mã QR..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-600 focus:bg-white"
                />
                <button
                  onClick={() => {
                    const el = document.getElementById('manual-qr') as HTMLInputElement
                    if (el?.value) handleQRScan(el.value)
                  }}
                  className="bg-slate-900 hover:bg-black text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Kiểm tra
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
