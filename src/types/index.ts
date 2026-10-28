export type UserRole = 'user' | 'admin' | 'dev'
export type PaymentStatus = 'pending' | 'paid' | 'rejected'
export type Gender = 'Nam' | 'Nu' | 'Khac'
export type ReferralSource = 'Facebook CLB' | 'TikTok' | 'Bạn bè giới thiệu' | 'Poster/Banner trường' | 'Khác'

export interface UserRoleRecord {
  email: string
  role: UserRole
  created_at: string
}

export interface Ticket {
  id: string
  order_code: string
  user_email: string
  full_name: string
  dob: string
  gender: Gender
  phone: string
  organization: string
  referral_source: ReferralSource | string
  feedback?: string
  amount: number
  payment_proof_url?: string
  payment_status: PaymentStatus
  is_email_sent: boolean
  is_checked_in: boolean
  checked_in_at?: string
  lucky_number?: number
  qr_secret_hash: string
  created_at: string
  updated_at: string
  verified_by?: string
  verified_at?: string
}

export interface SiteSetting {
  key: string
  value: string
  description?: string
  updated_at: string
  updated_by?: string
}

export interface SystemLog {
  id: string
  action: string
  performed_by: string
  target_id?: string
  details?: Record<string, unknown>
  created_at: string
}

export interface BookingFormData {
  full_name: string
  dob: string
  gender: Gender
  phone: string
  organization?: string
  referral_source: string
  feedback?: string
}

export interface AdminStats {
  total_tickets: number
  paid_tickets: number
  pending_tickets: number
  rejected_tickets: number
  total_revenue: number
  checked_in_count: number
  email_sent_count: number
}

export interface DemographicData {
  organization: string
  count: number
}

export interface AgeGroupData {
  age_group: string
  count: number
}

export interface GenderData {
  gender: string
  count: number
}

export interface ReferralData {
  source: string
  count: number
}

export interface BookingVelocityData {
  date: string
  count: number
}

export interface CheckinVelocityData {
  hour: string
  count: number
}
