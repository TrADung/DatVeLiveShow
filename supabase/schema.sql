-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Role Table
CREATE TABLE IF NOT EXISTS users_role (
  email TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'dev')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_code TEXT UNIQUE NOT NULL,
  user_email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  dob DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Nam', 'Nu', 'Khac')),
  phone TEXT NOT NULL,
  organization TEXT NOT NULL,
  referral_source TEXT NOT NULL,
  feedback TEXT,
  amount INTEGER NOT NULL DEFAULT 70000,
  payment_proof_url TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'rejected')),
  is_email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  is_checked_in BOOLEAN NOT NULL DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  lucky_number INTEGER,
  qr_secret_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  verified_by TEXT,
  verified_at TIMESTAMPTZ
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default site settings
INSERT INTO site_settings (key, value, description) VALUES
  ('ticket_price', '70000', 'Gia ve tinh bang VND'),
  ('bank_id', 'TCB', 'Ma ngan hang VietQR'),
  ('bank_account_no', '2611102006', 'So tai khoan ngan hang'),
  ('bank_account_name', 'TRAN ANH DUNG', 'Ten chu tai khoan'),
  ('event_name', 'Live Show Sinh Nhat Club - SẮC I. VÁN CỜ'),
  ('event_date', '2026-11-07', 'Ngay to chuc su kien'),
  ('event_venue', '', 'Dia diem to chuc su kien'),
  ('ticket_sale_open', 'true', 'Trang thai mo cua ban ve'),
  ('smtp_host', 'smtp.gmail.com', 'SMTP host'),
  ('smtp_port', '587', 'SMTP port'),
  ('smtp_user', '', 'SMTP username/email'),
  ('smtp_pass', '', 'SMTP password/app password'),
  ('lucky_draw_time', '2026-11-07T21:00:00', 'Thoi gian quay so trung thuong'),
  ('admin_emails', '', 'Danh sach email admin cach nhau bang dau phay')
ON CONFLICT (key) DO NOTHING;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE users_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Helper Security Definer function to check admin/dev without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin_or_dev()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users_role 
    WHERE email = auth.email() AND role IN ('admin', 'dev')
  );
$$;

-- RLS Policies for users_role
DROP POLICY IF EXISTS "Allow read users_role" ON users_role;
DROP POLICY IF EXISTS "Allow public read users_role" ON users_role;
DROP POLICY IF EXISTS "Users can view their own role" ON users_role;
DROP POLICY IF EXISTS "Admins can view all roles" ON users_role;
DROP POLICY IF EXISTS "Dev can manage all roles" ON users_role;
DROP POLICY IF EXISTS "Admins can modify roles" ON users_role;

CREATE POLICY "Allow read users_role" ON users_role
  FOR SELECT USING (true);

CREATE POLICY "Admins can modify roles" ON users_role
  FOR ALL USING (public.is_admin_or_dev());

-- Insert default master admin
INSERT INTO users_role (email, role) VALUES 
  ('trananhdung11102006@gmail.com', 'dev')
ON CONFLICT (email) DO UPDATE SET role = 'dev';

-- RLS Policies for tickets
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Anyone can book tickets" ON tickets;
DROP POLICY IF EXISTS "Users can update their own pending tickets" ON tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON tickets;
DROP POLICY IF EXISTS "Admins can update all tickets" ON tickets;
DROP POLICY IF EXISTS "Admins can delete tickets" ON tickets;
DROP POLICY IF EXISTS "Public read tickets" ON tickets;

CREATE POLICY "Public read tickets" ON tickets
  FOR SELECT USING (true);

CREATE POLICY "Anyone can book tickets" ON tickets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own pending tickets" ON tickets
  FOR UPDATE USING (payment_status = 'pending');

CREATE POLICY "Admins can update all tickets" ON tickets
  FOR UPDATE USING (public.is_admin_or_dev());

CREATE POLICY "Admins can delete tickets" ON tickets
  FOR DELETE USING (public.is_admin_or_dev());

-- RLS Policies for site_settings
DROP POLICY IF EXISTS "Anyone can view site settings" ON site_settings;
DROP POLICY IF EXISTS "Public read site settings" ON site_settings;
DROP POLICY IF EXISTS "Only dev can modify site settings" ON site_settings;
DROP POLICY IF EXISTS "Dev modify site settings" ON site_settings;

CREATE POLICY "Public read site settings" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Dev modify site settings" ON site_settings
  FOR ALL USING (public.is_admin_or_dev());

-- RLS Policies for system_logs
DROP POLICY IF EXISTS "Admins can view system logs" ON system_logs;
DROP POLICY IF EXISTS "Admins can insert system logs" ON system_logs;

CREATE POLICY "Admins can view system logs" ON system_logs
  FOR SELECT USING (public.is_admin_or_dev());

CREATE POLICY "Admins can insert system logs" ON system_logs
  FOR INSERT WITH CHECK (public.is_admin_or_dev());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_user_email ON tickets(user_email);
CREATE INDEX IF NOT EXISTS idx_tickets_payment_status ON tickets(payment_status);
CREATE INDEX IF NOT EXISTS idx_tickets_order_code ON tickets(order_code);
CREATE INDEX IF NOT EXISTS idx_tickets_qr_secret_hash ON tickets(qr_secret_hash);
CREATE INDEX IF NOT EXISTS idx_tickets_lucky_number ON tickets(lucky_number);
CREATE INDEX IF NOT EXISTS idx_system_logs_performed_by ON system_logs(performed_by);
