# ♟️ CHESS NIGHT - Hệ Thống Đặt Vé & Quản Lý Live Show Sinh Nhật CLB

Hệ thống web đặt vé và quản lý sự kiện âm nhạc (Live Show Sinh Nhật Câu Lạc Bộ Âm Nhạc) mang phong cách nghệ thuật hiện đại kết hợp ngôn ngữ thiết kế **Concept Cờ Vua Cao Cấp (Premium Tournament Chess)**.

---

## 🌟 Tính Năng Nổi Bật

### 1. 🎨 Design System & Trải Nghiệm Người Dùng (Chess Tournament Concept)
- **Bảng màu chủ đạo:**
  - `Background Primary`: `#121212` (Đen nhám mờ - Matte Resin Black) & `#1A1A1A`.
  - `Background Secondary / Card`: `#F5F2EB` (Trắng ngà - Ivory Microfiber) với hiệu ứng Glassmorphism tối.
  - `Accent Primary`: `#D4AF37` (Vàng Champagne / Amber Gold) hiệu ứng phát sáng Gold.
  - `Accent Secondary`: `#6E472B` (Nâu gỗ óc chó - Walnut Wood).
- **Âm thanh & Tương tác:**
  - **Tactile Click Sound (Web Audio API):** Âm thanh click trầm ấm tựa tiếng đặt quân cờ lên bàn gỗ mộc mạc, phát tự động khi click button/link.
  - **Background Music:** Bộ phát nhạc nền ambient/acoustic nhẹ nhàng với nút Floating Mute/Unmute tinh tế ở góc dưới màn hình.
- **Responsive:** Thích ứng chuẩn mực trên 3 tỉ lệ: Desktop 16:9, Tablet 4:3 và Mobile 9:16.

### 2. 👥 Phân Quyền Chi Tiết (Role-Based Access Control - RBAC)
- **Role Khán Giả (`user`):**
  - Đăng nhập an toàn qua Google OAuth để xác thực email nhận vé.
  - Form đặt vé đầy đủ thông tin: Họ tên, Ngày sinh, Giới tính, Trường/Đơn vị công tác, SĐT, Nguồn biết đến show, Lời nhắn.
  - Tích hợp thanh toán **VietQR API** tự động sinh mã đơn hàng, hiển thị mã QR kèm nội dung chuyển khoản.
  - Tải lên ảnh chụp màn hình minh chứng chuyển khoản (lưu trữ Supabase Storage).
  - Cấp **Số May Mắn (Lucky Number)** và mã QR bảo mật chống làm giả.
  - Trang **"Vé Của Tôi"** xem trạng thái vé (Chờ duyệt, Đã thanh toán, Đã check-in) và đếm ngược giờ bốc thăm.
- **Role Ban Tổ Chức & Staff (`admin`):**
  - **Admin Dashboard Thống Kê (Recharts):** KPI vé, doanh thu thực tế, tiến độ check-in real-time.
  - **Biểu đồ phân tích:** Nhân khẩu học (Đơn vị/Trường học), phân bố độ tuổi/giới tính, kênh truyền thông hiệu quả, booking velocity.
  - **Quản lý & Duyệt vé:** Xem ảnh minh chứng chuyển khoản, xác nhận thanh toán hoặc từ chối.
  - **Tự động gửi vé hàng loạt (Bulk Email Automation):** Gửi vé điện tử kèm mã QR cá nhân hóa và số may mắn qua Gmail SMTP (`nodemailer`) với template HTML sang trọng.
  - **Trình Quét Mã QR Check-in (Mobile Camera Scanner):** Quét mã QR bằng camera điện thoại (`html5-qrcode`), bật popup thông tin khách hàng kèm cơ chế **Anti-Passback** chống quét trùng lặp.
  - **Màn hình Quay Số Trúng Thưởng (Lucky Draw):** Animation quay số ngẫu nhiên từ danh sách khách đã check-in trên sân khấu.
  - **Xuất dữ liệu:** Xuất danh sách khách hàng ra file CSV chỉ với 1 click.
- **Role Developer (`dev` - Super Admin):**
  - Toàn quyền Admin + Giao diện cấu hình nóng (`Dev Panel`): Chỉnh sửa giá vé, thông tin ngân hàng VietQR, cấu hình SMTP, đóng/mở cổng bán vé, phân quyền admin mà không cần sửa code.
  - Quản lý System Logs kiểm tra nhật ký hoạt động.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Framework:** Next.js (App Router), TypeScript, React 19.
- **Styling:** Tailwind CSS, Framer Motion, Lucide React Icons.
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security, Supabase Auth Google OAuth, Supabase Storage).
- **Payment:** VietQR API Integration.
- **QR Code & Camera Scanner:** `qrcode`, `html5-qrcode`.
- **Charts:** `recharts`.
- **Email:** `nodemailer` (Gmail SMTP).
- **Audio:** Web Audio API (Synthesized tactile sound) & HTML5 Audio.

---

## 📁 Cấu Trúc Thư Mục

```
datveliveshow/
├── supabase/
│   └── schema.sql             # SQL Schema: Tables, Triggers, RLS Policies, Indexes
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── checkin/       # Trang quét QR Camera cho Staff
│   │   │   └── page.tsx       # Admin Dashboard & Analytics & Lucky Draw
│   │   ├── api/
│   │   │   ├── admin/         # API: checkin, send-emails, stats, verify
│   │   │   ├── dev/settings/  # API cấu hình động cho Dev
│   │   │   └── tickets/       # API đặt vé & upload minh chứng
│   │   ├── auth/callback/     # Supabase OAuth Callback
│   │   ├── dev/               # Trang cấu hình Dev Panel
│   │   ├── my-tickets/        # Trang xem vé & QR của khán giả
│   │   ├── globals.css        # Chess theme styles & animations
│   │   ├── layout.tsx
│   │   └── page.tsx           # Landing Page chính
│   ├── components/            # Header, HeroSection, Timeline, Activities, Sponsors, BookingModal, MusicPlayer, etc.
│   ├── hooks/                 # useAudio (Web Audio API), useAuth (Supabase Auth & Roles)
│   ├── lib/                   # Supabase client/server helper, utils (QR Hash, VietQR generator)
│   └── types/                 # TypeScript interfaces
├── .env.example
├── next.config.ts
└── package.json
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Cấu hình Supabase Database
1. Tạo một dự án mới trên [Supabase](https://supabase.com).
2. Vào **SQL Editor** trong Supabase Dashboard.
3. Mở file `supabase/schema.sql` trong dự án, copy toàn bộ nội dung và bấm **Run** để khởi tạo các bảng, trigger và RLS policies:
   - `users_role` (phân quyền user, admin, dev)
   - `tickets` (thông tin vé, thanh toán, check-in, số may mắn, qr hash)
   - `site_settings` (cấu hình động cho Role Dev)
   - `system_logs` (nhật ký hệ thống)
4. Vào **Storage** trên Supabase, tạo một bucket public tên là `payment-proofs` để lưu ảnh chụp màn hình thanh toán.
5. Vào **Authentication -> Providers**, bật **Google** và cấu hình Client ID & Secret từ Google Cloud Console.

### 3. Cấu hình Biến Môi Trường (`.env.local`)
Tạo file `.env.local` dựa trên `.env.example`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email (Gmail SMTP của CLB)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_club_email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=CLB Am Nhac <your_club_email@gmail.com>

# VietQR Payment
VIETQR_BANK_ID=MB
VIETQR_ACCOUNT_NO=1234567890
VIETQR_ACCOUNT_NAME=CLB AM NHAC
TICKET_PRICE=150000

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
QR_SECRET_KEY=chess_club_secret_key_2024_minimum_32_chars
```

### 4. Khởi chạy Development Server
```bash
npm run dev
```
Truy cập [http://localhost:3000](http://localhost:3000) trên trình duyệt.

### 5. Build Production
```bash
npm run build
npm run start
```

---

## 🔒 Bản Quyền & Giấy Phép
Dự án được xây dựng phục vụ Đêm nhạc Sinh nhật Câu lạc bộ Âm nhạc - Chess Night. All rights reserved.
