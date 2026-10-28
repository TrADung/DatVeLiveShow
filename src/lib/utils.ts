import crypto from 'crypto'

export function generateOrderCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `CLB-${timestamp.slice(-4)}${random}`
}

export function formatLuckyNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined || num === '') return '---'
  const parsed = parseInt(String(num), 10)
  if (isNaN(parsed)) return '---'
  return String(parsed).padStart(3, '0')
}

export function generateLuckyNumber(existingNumbers: number[] = []): number {
  const existingSet = new Set(existingNumbers)
  // Ưu tiên đảm bảo chắc chắn khách hàng có 2 số đặc biệt: 09 (9) và 24 (24)
  if (!existingSet.has(9)) return 9
  if (!existingSet.has(24)) return 24

  // Sau khi cả 9 và 24 đều đã có, cấp số ngẫu nhiên 3 chữ số từ 0 đến 999 chưa được sử dụng
  const available: number[] = []
  for (let i = 0; i <= 999; i++) {
    if (!existingSet.has(i)) {
      available.push(i)
    }
  }

  if (available.length > 0) {
    const randomIndex = Math.floor(Math.random() * available.length)
    return available[randomIndex]
  }

  // Fallback nếu vượt quá 1000 vé
  return Math.floor(Math.random() * 1000)
}

export function generateQRHash(ticketId: string, orderCode: string): string {
  const secret = process.env.QR_SECRET_KEY || 'chess_club_secret_key_2024_minimum_32_chars'
  return crypto
    .createHmac('sha256', secret)
    .update(`${ticketId}-${orderCode}`)
    .digest('hex')
    .substring(0, 32)
}

export function verifyQRHash(ticketId: string, orderCode: string, hash: string): boolean {
  const expectedHash = generateQRHash(ticketId, orderCode)
  return expectedHash === hash
}

export function generateVietQRUrl(
  bankId: string,
  accountNo: string,
  amount: number,
  orderCode: string,
  accountName: string
): string {
  const encodedName = encodeURIComponent(accountName)
  const encodedInfo = encodeURIComponent(`Thanh toan ve ${orderCode}`)
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodedInfo}&accountName=${encodedName}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function calculateAge(dob: string): number {
  const today = new Date()
  const birthDate = new Date(dob)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export function getAgeGroup(dob: string): string {
  const age = calculateAge(dob)
  if (age < 18) return '<18'
  if (age <= 22) return '18-22'
  if (age <= 25) return '23-25'
  if (age <= 30) return '26-30'
  return '>30'
}
