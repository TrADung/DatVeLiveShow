'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  X,
  User,
  Hash,
  Building,
  Calendar,
  ArrowLeft,
  Shield,
  RotateCw,
  Upload,
  Search,
  Sparkles,
  RefreshCw,
  Info,
  Undo2
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAudio } from '@/hooks/useAudio'
import { formatDate, formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import Header from '@/components/Header'

type ScanResult = {
  status: 'success' | 'ready' | 'already_checked_in' | 'not_paid' | 'not_found' | 'invalid_qr' | 'error'
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
  message?: string
}

export default function QRScannerPage() {
  const { user, userRole, loading: authLoading } = useAuth()
  const { playClickSound, playSuccessSound, playErrorSound } = useAudio()

  const [scanning, setScanning] = useState(false)
  const [startingCamera, setStartingCamera] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([])
  const [selectedCameraIndex, setSelectedCameraIndex] = useState(0)

  const [scanLoading, setScanLoading] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [undoingCheckIn, setUndoingCheckIn] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [manualCode, setManualCode] = useState('')

  const html5QrcodeRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Verify and process ticket QR or order code with AUTOMATIC CHECK-IN
  const handleQRScan = useCallback(async (qrData: string) => {
    if (!qrData || !qrData.trim()) return
    setScanLoading(true)
    try {
      const res = await fetch('/api/admin/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_data: qrData.trim() }),
      })
      const data = await res.json()

      if (res.status === 409) {
        playErrorSound()
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate([200, 100, 200]) } catch {}
        }
        setScanResult({
          status: 'already_checked_in',
          error: data.error || 'Vé này đã được check-in trước đó!',
          ticket: data.ticket,
          checked_in_at: data.checked_in_at,
        })
      } else if (res.ok) {
        playSuccessSound()
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate([100, 50, 100]) } catch {}
        }
        setScanResult({
          status: 'success',
          ticket: data.ticket,
          checked_in_at: data.checked_in_at,
          message: data.message || 'Check-in thành công!',
        })
      } else {
        playErrorSound()
        setScanResult({
          status: 'error',
          error: data.error || 'Mã QR không hợp lệ hoặc vé chưa duyệt thanh toán.',
          ticket: data.ticket,
        })
      }
    } catch {
      playErrorSound()
      setScanResult({
        status: 'error',
        error: 'Lỗi kết nối máy chủ. Vui lòng kiểm tra lại mạng hoặc thử lại.',
      })
    } finally {
      setScanLoading(false)
    }
  }, [playErrorSound, playSuccessSound])

  // Stop camera helper
  const stopScanner = useCallback(async () => {
    playClickSound()
    if (html5QrcodeRef.current) {
      try {
        await html5QrcodeRef.current.stop()
      } catch {}
      try {
        html5QrcodeRef.current.clear()
      } catch {}
      html5QrcodeRef.current = null
    }
    setScanning(false)
    setStartingCamera(false)
  }, [playClickSound])

  // Start camera scanner with device detection & fallbacks
  const startScanner = useCallback(async (camIndex = 0) => {
    playClickSound()
    setCameraError(null)
    setScanResult(null)
    setStartingCamera(true)

    try {
      const { Html5Qrcode } = await import('html5-qrcode')

      // Stop existing instance if running
      if (html5QrcodeRef.current) {
        try {
          await html5QrcodeRef.current.stop()
        } catch {}
        try {
          html5QrcodeRef.current.clear()
        } catch {}
        html5QrcodeRef.current = null
      }

      // Display camera container first so #qr-reader is mounted and visible
      setScanning(true)
      await new Promise((r) => setTimeout(r, 60))

      let foundCameras: Array<{ id: string; label: string }> = []
      try {
        foundCameras = await Html5Qrcode.getCameras()
        if (foundCameras && foundCameras.length > 0) {
          setCameras(foundCameras)
        }
      } catch (enumErr) {
        console.warn('Could not enumerate cameras:', enumErr)
      }

      const scanner = new Html5Qrcode('qr-reader')
      html5QrcodeRef.current = scanner

      // Choose preferred camera: rear for mobile, or first camera on laptop/desktop
      let cameraConfig: any = { facingMode: 'environment' }
      if (foundCameras && foundCameras.length > 0) {
        const backCamIndex = foundCameras.findIndex((c) =>
          /back|rear|environment|sau/i.test(c.label)
        )
        const chosenIndex = camIndex !== 0
          ? camIndex % foundCameras.length
          : backCamIndex !== -1
          ? backCamIndex
          : 0

        setSelectedCameraIndex(chosenIndex)
        cameraConfig = foundCameras[chosenIndex].id
      }

      const scanConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }

      const onScanSuccess = async (decodedText: string) => {
        try {
          await scanner.stop()
        } catch {}
        setScanning(false)
        await handleQRScan(decodedText)
      }

      try {
        await scanner.start(cameraConfig, scanConfig, onScanSuccess, () => {})
      } catch (startErr: any) {
        console.warn('Initial camera start failed, retrying with fallback...', startErr)
        // Fallback: try facingMode user or first available camera
        if (foundCameras && foundCameras.length > 0) {
          await scanner.start(foundCameras[0].id, scanConfig, onScanSuccess, () => {})
        } else {
          await scanner.start({ facingMode: 'user' }, scanConfig, onScanSuccess, () => {})
        }
      }
    } catch (err: any) {
      console.warn('Camera access notice:', err?.message || err)
      setScanning(false)
      playErrorSound()

      let msg = 'Không thể khởi động camera. Vui lòng kiểm tra quyền truy cập trên trình duyệt.'
      if (err?.name === 'NotAllowedError' || err?.message?.toLowerCase().includes('permission')) {
        msg = 'Trình duyệt chưa được cấp quyền Camera. Hãy bấm vào biểu tượng Ổ Khóa hoặc Camera trên thanh địa chỉ URL và chọn "Cho phép" (Allow).'
      } else if (err?.name === 'NotFoundError' || err?.message?.toLowerCase().includes('not found')) {
        msg = 'Không tìm thấy thiết bị camera trên máy này. Bạn có thể tải ảnh chụp QR hoặc nhập mã vé trực tiếp bên dưới.'
      } else if (err?.name === 'NotReadableError' || err?.message?.includes('NotReadableError') || err?.message?.includes('Could not start video source')) {
        msg = 'Camera đang bị ứng dụng khác (Zalo, Zoom, Teams, v.v.) chiếm dụng hoặc chưa tắt kết nối. Bạn hãy tắt ứng dụng đó rồi bấm BẬT CAMERA lại, hoặc sử dụng tính năng tải ảnh QR / nhập mã vé bên dưới.'
      } else if (err?.message) {
        msg = `Lỗi: ${err.message}`
      }
      setCameraError(msg)
    } finally {
      setStartingCamera(false)
    }
  }, [handleQRScan, playClickSound, playErrorSound])

  // Switch to another camera (e.g. front <-> back on mobile)
  const switchCamera = useCallback(async () => {
    if (cameras.length <= 1) return
    const nextIndex = (selectedCameraIndex + 1) % cameras.length
    await startScanner(nextIndex)
  }, [cameras, selectedCameraIndex, startScanner])

  // Upload QR image file fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    playClickSound()
    setUploadingImage(true)
    setCameraError(null)
    setScanResult(null)

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const scanner = new Html5Qrcode('qr-reader')
      const decodedText = await scanner.scanFile(file, true)
      await scanner.clear()
      await handleQRScan(decodedText)
    } catch (err: any) {
      console.warn('File scan notice:', err?.message || err)
      playErrorSound()
      setScanResult({
        status: 'error',
        error: 'Không tìm thấy mã QR hợp lệ trong ảnh này. Vui lòng chụp rõ nét hơn hoặc nhập mã đơn bằng tay.',
      })
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (html5QrcodeRef.current) {
        try {
          html5QrcodeRef.current.stop()
        } catch {}
        try {
          html5QrcodeRef.current.clear()
        } catch {}
      }
    }
  }, [])

  // Undo Check-in action (revert back to unchecked)
  const handleUndoCheckIn = async () => {
    if (!scanResult?.ticket) return
    playClickSound()
    setUndoingCheckIn(true)

    try {
      const res = await fetch('/api/admin/checkin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: scanResult.ticket.id,
          order_code: scanResult.ticket.order_code,
          action: 'uncheck',
        }),
      })
      const data = await res.json()

      if (res.ok) {
        playSuccessSound()
        alert(`Đã hoàn tác check-in cho vé ${scanResult.ticket.order_code}!`)
        setScanResult(null)
      } else {
        playErrorSound()
        alert(data.error || 'Hoàn tác thất bại. Vui lòng thử lại!')
      }
    } catch {
      playErrorSound()
      alert('Lỗi kết nối máy chủ khi hoàn tác check-in.')
    } finally {
      setUndoingCheckIn(false)
    }
  }

  // Auth gate check
  if (authLoading) {
    return (
      <div className="theme-page-bg min-h-screen text-slate-900 dark:text-white flex flex-col items-center justify-center">
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
      <div className="theme-page-bg min-h-screen text-slate-900 dark:text-white flex flex-col">
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
    <div className="theme-page-bg min-h-screen text-slate-900 dark:text-white flex flex-col">
      <Header />

      <main className="flex-1 pt-28 sm:pt-36 pb-20 px-4 max-w-md mx-auto w-full flex flex-col items-center">
        {/* Top Header Card */}
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
              <p className="text-[11px] text-slate-400">Soát vé tự động & dán vòng tay tại cổng</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Tự Động Check-in</span>
          </div>
        </div>

        {/* Camera Permission or Runtime Error Warning */}
        {cameraError && (
          <div className="w-full mb-6 rounded-2xl bg-amber-950/40 border border-amber-500/40 p-4 text-xs text-amber-200">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-amber-300">Thông báo về Camera:</div>
                <div className="leading-relaxed text-amber-200/90">{cameraError}</div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full">
          {/* CAMERA SCANNER CONTAINER (ALWAYS IN DOM, TOGGLED WITH CSS) */}
          <div className={`relative bg-black rounded-3xl overflow-hidden shadow-2xl p-2 border border-white/10 mb-6 ${scanning ? 'block' : 'hidden'}`}>
            <div id="qr-reader" className="w-full rounded-2xl overflow-hidden" />
            <div className="flex gap-2 mt-3">
              {cameras.length > 1 && (
                <button
                  type="button"
                  onClick={switchCamera}
                  className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl text-xs hover:bg-white/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCw size={14} />
                  <span>Đổi Camera ({selectedCameraIndex + 1}/{cameras.length})</span>
                </button>
              )}
              <button
                type="button"
                onClick={stopScanner}
                className="flex-1 bg-white text-slate-900 font-bold py-3 rounded-xl text-xs hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Tắt Camera
              </button>
            </div>
          </div>

          {/* Idle Mode: Start camera & Upload buttons */}
          {!scanning && !scanResult && (
            <div className="text-center py-4">
              <div className="w-56 h-56 mx-auto mb-6 rounded-3xl border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center shadow-2xl">
                <Camera size={56} className="text-slate-500 mb-2" />
                <span className="text-[11px] font-bold text-slate-400">Hướng camera về phía mã QR</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startScanner(0)}
                disabled={startingCamera}
                className="w-full btn-crimson py-4 rounded-2xl text-base font-black flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-red-600/30 disabled:opacity-50"
              >
                {startingCamera ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Đang khởi động Camera...</span>
                  </>
                ) : (
                  <>
                    <Camera size={22} />
                    <span>BẬT CAMERA QUÉT QR</span>
                  </>
                )}
              </motion.button>

              {/* Upload image fallback button */}
              <div className="mt-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-[#D4AF37]" />
                      <span>Đang phân tích mã QR từ ảnh...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="text-[#D4AF37]" />
                      <span>Tải ảnh QR (Nếu camera bị mờ hoặc gửi ảnh)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Loading scan query */}
          {scanLoading && (
            <div className="card-luxury rounded-2xl p-6 text-center my-4 border border-white/10">
              <Loader2 size={32} className="animate-spin text-[#D4AF37] mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-300">Đang quét và ghi nhận check-in tự động...</p>
            </div>
          )}

          {/* Scan Results */}
          <AnimatePresence>
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="mb-6"
              >
                {/* 1. Already Checked-in Alert */}
                {scanResult.status === 'already_checked_in' && (
                  <div className="rounded-3xl border-2 border-red-500 bg-red-950/40 p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0">
                        <AlertTriangle size={26} />
                      </div>
                      <div>
                        <div className="font-black text-red-400 text-base">CẢNH BÁO: VÉ ĐÃ SỬ DỤNG!</div>
                        <div className="text-xs text-red-200">{scanResult.error}</div>
                      </div>
                    </div>

                    {scanResult.ticket && (
                      <div className="bg-[#18181B] rounded-2xl p-4 text-xs space-y-2 border border-white/10 mb-4">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Khách hàng:</span>
                          <span className="font-bold text-white">{scanResult.ticket.full_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Mã đơn:</span>
                          <span className="font-mono font-bold text-red-400">{scanResult.ticket.order_code}</span>
                        </div>
                        {scanResult.ticket.organization && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Đơn vị:</span>
                            <span className="text-white">{scanResult.ticket.organization}</span>
                          </div>
                        )}
                        {scanResult.checked_in_at && (
                          <div className="flex justify-between border-t border-white/5 pt-2">
                            <span className="text-slate-400">Thời gian quét lần trước:</span>
                            <span className="font-mono text-red-300">{formatDateTime(scanResult.checked_in_at)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        playClickSound()
                        setScanResult(null)
                        startScanner(selectedCameraIndex)
                      }}
                      className="w-full bg-white text-slate-900 font-bold py-3.5 rounded-xl text-xs hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw size={14} />
                      <span>Tiếp Tục Quét Vé Khác</span>
                    </button>
                  </div>
                )}

                {/* 2. SUCCESS CHECK-IN (AUTOMATICALLY RECORDED) */}
                {(scanResult.status === 'success' || scanResult.status === 'ready') && scanResult.ticket && (
                  <div className="rounded-3xl border-2 border-emerald-500 bg-emerald-950/40 p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-900 flex items-center justify-center shrink-0 font-bold shadow-lg shadow-emerald-500/20">
                        <CheckCircle size={28} />
                      </div>
                      <div>
                        <div className="font-black text-emerald-400 text-base">CHECK-IN THÀNH CÔNG!</div>
                        <div className="text-xs text-emerald-200">Đã cập nhật hệ thống & cho phép vào cổng</div>
                      </div>
                    </div>

                    <div className="bg-[#18181B] rounded-2xl p-4 border border-white/10 space-y-3 mb-5 text-xs">
                      {[
                        { IconComp: User, label: 'Khách hàng', value: scanResult.ticket.full_name },
                        { IconComp: Hash, label: 'Mã vé', value: scanResult.ticket.order_code },
                        { IconComp: Calendar, label: 'Ngày sinh', value: formatDate(scanResult.ticket.dob) },
                        { IconComp: Building, label: 'Đơn vị', value: scanResult.ticket.organization || 'Khách vãng lai' },
                        { IconComp: Sparkles, label: 'Số may mắn', value: `#${scanResult.ticket.lucky_number || '-'}` },
                      ].map(({ IconComp, label, value }) => (
                        <div key={label} className="flex items-center justify-between py-1 border-b border-white/5 last:border-none">
                          <div className="flex items-center gap-2 text-slate-400">
                            <IconComp size={14} className="text-[#D4AF37]" />
                            <span>{label}:</span>
                          </div>
                          <span className="font-bold text-white font-mono">{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons: Next ticket or Undo */}
                    <div className="space-y-2.5">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          playClickSound()
                          setScanResult(null)
                          startScanner(selectedCameraIndex)
                        }}
                        className="w-full btn-crimson py-4 rounded-2xl text-sm font-black shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Camera size={18} />
                        <span>QUÉT VÉ TIẾP THEO</span>
                      </motion.button>

                      <button
                        onClick={handleUndoCheckIn}
                        disabled={undoingCheckIn}
                        className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-950/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Undo2 size={13} />
                        <span>{undoingCheckIn ? 'Đang hoàn tác...' : 'Hủy check-in (Nếu quét nhầm)'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Error (Not Paid / Invalid QR / Not Found) */}
                {(scanResult.status === 'error' || scanResult.status === 'not_paid' || scanResult.status === 'invalid_qr' || scanResult.status === 'not_found') && (
                  <div className="rounded-3xl border-2 border-red-500/50 bg-red-950/30 p-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/40">
                        <XCircle size={26} />
                      </div>
                      <div>
                        <div className="font-black text-red-400 text-base">KHÔNG THỂ CHECK-IN</div>
                        <div className="text-xs text-red-300">{scanResult.error}</div>
                      </div>
                    </div>

                    {scanResult.ticket && (
                      <div className="bg-[#18181B] rounded-2xl p-4 text-xs space-y-2 border border-white/10 mb-4">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Khách hàng:</span>
                          <span className="font-bold text-white">{scanResult.ticket.full_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Trạng thái:</span>
                          <span className="text-amber-400 font-bold">Chưa duyệt thanh toán</span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        playClickSound()
                        setScanResult(null)
                        startScanner(selectedCameraIndex)
                      }}
                      className="w-full bg-white text-slate-900 font-bold py-3.5 rounded-xl text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Quét Lại
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Manual Input Fallback (Order Code or QR JSON) */}
          {!scanning && !scanResult && (
            <div className="mt-4 card-luxury rounded-2xl p-4 sm:p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Search size={14} className="text-[#D4AF37]" />
                <p className="text-xs font-bold text-slate-300">Nhập Mã Đơn Hoặc Dán QR Thủ Công:</p>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Nếu camera không quét được hoặc khách chỉ cung cấp mã đơn (ví dụ: <span className="font-mono text-red-400 font-bold">CLB-4S5FZWV</span>), bạn có thể nhập trực tiếp tại đây:
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (manualCode.trim()) {
                    handleQRScan(manualCode.trim())
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Ví dụ: CLB-4S5FZWV..."
                  className="flex-1 bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono uppercase"
                />
                <button
                  type="submit"
                  disabled={!manualCode.trim() || scanLoading}
                  className="bg-white text-slate-900 hover:bg-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Check-in
                </button>
              </form>
            </div>
          )}

          {/* Help box */}
          <div className="mt-6 rounded-xl bg-white/5 border border-white/5 p-4 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <Info size={13} className="text-[#D4AF37]" />
              <span>Quy Trình Soát Vé Tự Động:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 leading-relaxed text-slate-400">
              <li>Mỗi khi camera nhận diện mã QR (hoặc nhập mã đơn), hệ thống sẽ <strong>tự động lưu Check-in</strong> vào database ngay lập tức.</li>
              <li>Mỗi vé chỉ có thể check-in <strong>một lần duy nhất</strong>. Nếu quét lại sẽ báo động đỏ.</li>
              <li>Nếu quét nhầm, bạn có thể bấm <strong>Hủy check-in</strong> ngay dưới thông tin vé.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
