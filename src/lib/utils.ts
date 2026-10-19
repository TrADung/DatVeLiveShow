import crypto from 'crypto'

export function generateOrderCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `CLB-${timestamp.slice(-4)}${random}`
}

export function generateLuckyNumber(existingNumbers: number[]): number {
  let num: number
  do {
    num = Math.floor(1000 + Math.random() * 9000) // 4-digit number
  } while (existingNumbers.includes(num))
  return num
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
