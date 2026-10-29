import { EVENT_INFO } from './constants'
import { formatCurrency, formatDate, formatLuckyNumber } from './utils'

export const DEFAULT_EMAIL_SUBJECT = '[Vé Điện Tử] SẮC I. VÁN CỜ | Khán giả: {{full_name}} | Mã: {{order_code}}'

export const EMAIL_PLACEHOLDERS = [
  { key: '{{full_name}}', label: 'Họ và tên', desc: 'Tên đầy đủ của khán giả', example: 'Trần Anh Dũng' },
  { key: '{{lucky_number}}', label: 'Số may mắn', desc: 'Số bốc thăm 3 chữ số (000-999)', example: '009' },
  { key: '{{feedback}}', label: 'Lời nhắn gửi ban nhạc', desc: 'Lời nhắn lúc đặt vé (nếu không có thì hiển thị "Không")', example: 'Mong được nghe bài Diễm Xưa ạ!' },
  { key: '{{event_venue}}', label: 'Địa điểm (Tự động)', desc: 'Địa chỉ kèm link Google Maps nếu có', example: 'Hội trường lớn - 03 Quang Trung, Đà Nẵng' },
  { key: '{{order_code}}', label: 'Mã đơn vé', desc: 'Mã định danh vé duy nhất', example: 'CLB-LG6FHWZ' },
  { key: '{{qr_code}}', label: 'Ảnh mã QR', desc: 'Ảnh QR dùng check-in tại cổng', example: '[Hình ảnh mã QR]' },
  { key: '{{event_name}}', label: 'Tên sự kiện', desc: 'Tên chính thức của liveshow', example: 'SẮC I. VÁN CỜ' },
  { key: '{{event_date}}', label: 'Ngày diễn ra', desc: 'Ngày tổ chức liveshow', example: '07/11/2026' },
  { key: '{{event_time}}', label: 'Giờ diễn ra', desc: 'Khung giờ biểu diễn', example: '18:30 - 21:30' },
  { key: '{{event_venue_name}}', label: 'Tên địa điểm', desc: 'Tên nơi tổ chức (cấu hình trong /dev)', example: 'Hội trường lớn Đại học Duy Tân' },
  { key: '{{event_venue_address}}', label: 'Địa chỉ', desc: 'Địa chỉ chi tiết (cấu hình trong /dev)', example: '03 Quang Trung, Q. Hải Châu, Đà Nẵng' },
  { key: '{{event_venue_maps_url}}', label: 'Link Google Maps', desc: 'Đường dẫn mở ứng dụng Google Maps', example: 'https://maps.google.com' },
  { key: '{{user_email}}', label: 'Email khán giả', desc: 'Địa chỉ hòm thư người nhận', example: 'khangia@gmail.com' },
  { key: '{{phone}}', label: 'Số điện thoại', desc: 'Số liên hệ của người đặt vé', example: '0905 123 456' },
  { key: '{{hotline}}', label: 'Hotline BTC', desc: 'Số điện thoại hỗ trợ', example: '0362161480 (Bích Ngọc - Chủ Nhiệm)' },
]

export const DEFAULT_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vé Điện Tử - SẮC I. VÁN CỜ</title>
  <style>
    body { margin: 0; padding: 0; background-color: #EEE5D8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; }
    .email-wrapper { max-width: 590px; margin: 20px auto; background-color: #FAF7F2; border: 1px solid rgba(180, 150, 100, 0.35); border-radius: 24px; overflow: hidden; box-shadow: 0 10px 35px rgba(60, 45, 20, 0.08); }
    .email-body { padding: 26px 30px; }
    .greeting-name { font-size: 19px; font-weight: 800; color: #111827; margin: 0 0 10px 0; }
    .greeting-text { font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 26px 0; }
    .info-box-title { font-size: 16px; font-weight: 800; color: #111827; margin: 0 0 12px 0; }
    .info-card { background-color: #EFE8DC; border-left: 8px solid #E5C158; border-radius: 0 16px 16px 0; padding: 20px 24px; margin-bottom: 30px; }
    .info-line { margin: 8px 0; font-size: 15px; line-height: 1.7; color: #111827; }
    .info-label { font-weight: 600; color: #4B5563; }
    .info-val { font-weight: 700; color: #111827; }
    .lucky-val { font-weight: 900; color: #B45309; font-family: monospace; font-size: 19px; letter-spacing: 1.5px; }
    .feedback-val { font-style: italic; color: #374151; }
    .section-title { text-align: center; font-size: 17px; font-weight: 900; letter-spacing: 2px; color: #111827; margin: 34px 0 16px 0; text-transform: uppercase; }
    .timeline-box { background-color: #F5EFE6; border: 1px solid rgba(180, 150, 100, 0.28); border-radius: 16px; padding: 18px 24px; margin-bottom: 12px; }
    .timeline-item { font-size: 15px; line-height: 1.9; color: #374151; font-weight: 500; }
    .venue-row { font-size: 15px; line-height: 1.7; color: #111827; margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(180, 150, 100, 0.35); }
    .dresscode-table { width: 100%; max-width: 480px; margin: 0 auto 12px auto; border-spacing: 8px; }
    .dress-card { text-align: center; padding: 14px 8px; border-radius: 16px; background-color: #F5EFE6; border: 1px solid rgba(180, 150, 100, 0.28); }
    .dress-box { width: 56px; height: 56px; border-radius: 14px; margin: 0 auto 8px auto; box-shadow: 0 2px 6px rgba(0,0,0,0.12); }
    .dress-box-black { background-color: #0A0A0A; border: 2px solid #27272A; }
    .dress-box-white { background-color: #FFFFFF; border: 2px solid #CBD5E1; }
    .dress-box-red { background-color: #DC2626; border: 2px solid #EF4444; }
    .dress-box-gold { background: linear-gradient(135deg, #F3D063 0%, #E2B83E 100%); border: 2px solid #F0DA85; }
    .dress-name { font-size: 14px; font-weight: 900; letter-spacing: 0.5px; color: #111827; margin-bottom: 5px; }
    .dress-badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 12px; }
    .badge-gray { background-color: #E5DCCE; color: #4B5563; }
    .badge-gold { background-color: #FEF3C7; color: #92400E; border: 1px solid #FCD34D; }
    .qr-container { text-align: center; margin: 18px 0; }
    .closing-text { text-align: center; font-size: 16px; font-weight: 600; color: #374151; margin: 18px 0 24px 0; line-height: 1.6; }
    .btn-fanpage { display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #FFFFFF !important; font-size: 16px; font-weight: 800; text-decoration: none; padding: 14px 44px; border-radius: 30px; box-shadow: 0 8px 22px rgba(184, 134, 11, 0.35); text-align: center; }
    .footer { text-align: center; padding: 22px 28px; background-color: #E8DFC8; border-top: 1px solid rgba(180, 150, 100, 0.28); font-size: 13px; color: #4B5563; line-height: 1.7; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #EEE5D8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
  <div class="email-wrapper" style="max-width: 590px; margin: 20px auto; background-color: #FAF7F2; border: 1px solid rgba(180, 150, 100, 0.35); border-radius: 24px; overflow: hidden; box-shadow: 0 10px 35px rgba(60, 45, 20, 0.08);">
    
    <!-- BANNER VÉ ĐẦU EMAIL (.PNG NÉT) -->
    <div style="width: 100%; text-align: center; background-color: #0A0A0A; line-height: 0;">
      <img src="/images/EmailForm/ticket.png" alt="Vé Live Show SẮC I. VÁN CỜ" style="width: 100%; max-width: 590px; height: auto; display: block; margin: 0 auto;" />
    </div>

    <div class="email-body" style="padding: 26px 30px;">
      <!-- LỜI CHÀO -->
      <div class="greeting-name" style="font-size: 19px; font-weight: 800; color: #111827; margin: 0 0 10px 0;">
        Xin chào <strong>{{full_name}}</strong>
      </div>
      <div class="greeting-text" style="font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 26px 0;">
        Chúc mừng bạn đã “Thành công” bước vào ván cờ âm nhạc <strong>Sắc I. Ván cờ</strong>
      </div>

      <!-- THÔNG TIN NGƯỜI ĐẶT VÉ (CỘT VÀNG BÊN TRÁI - KHÔNG CÓ SỐ LƯỢNG VÉ) -->
      <div class="info-box-title" style="font-size: 16px; font-weight: 800; color: #111827; margin: 0 0 12px 0;">
        Thông tin người đặt vé
      </div>
      <div class="info-card" style="background-color: #EFE8DC; border-left: 8px solid #E5C158; border-radius: 0 16px 16px 0; padding: 20px 24px; margin-bottom: 30px;">
        <div class="info-line" style="margin: 8px 0; font-size: 15px; line-height: 1.7; color: #111827;">
          <span class="info-label" style="font-weight: 600; color: #4B5563;">Họ và tên:</span>
          <span class="info-val" style="font-weight: 700; color: #111827; margin-left: 6px;">{{full_name}}</span>
        </div>
        <div class="info-line" style="margin: 8px 0; font-size: 15px; line-height: 1.7; color: #111827;">
          <span class="info-label" style="font-weight: 600; color: #4B5563;">Số may mắn:</span>
          <span class="lucky-val" style="font-weight: 900; color: #B45309; font-family: monospace; font-size: 19px; letter-spacing: 1.5px; margin-left: 6px;">#{{lucky_number}}</span>
        </div>
        <div class="info-line" style="margin: 8px 0; font-size: 15px; line-height: 1.7; color: #111827;">
          <span class="info-label" style="font-weight: 600; color: #4B5563;">Lời nhắn (nếu có):</span>
          <span class="feedback-val" style="font-style: italic; color: #374151; margin-left: 6px;">{{feedback}}</span>
        </div>
      </div>

      <!-- THÔNG TIN CHƯƠNG TRÌNH -->
      <div class="section-title" style="text-align: center; font-size: 17px; font-weight: 900; letter-spacing: 2px; color: #111827; margin: 34px 0 16px 0; text-transform: uppercase;">
        THÔNG TIN CHƯƠNG TRÌNH
      </div>
      <div class="timeline-box" style="background-color: #F5EFE6; border: 1px solid rgba(180, 150, 100, 0.28); border-radius: 16px; padding: 18px 24px; margin-bottom: 12px;">
        <div class="timeline-item" style="font-size: 15px; line-height: 1.9; color: #374151; font-weight: 500;">
          • <strong>18H30 - 19H00:</strong> Check in - đón tiếp
        </div>
        <div class="timeline-item" style="font-size: 15px; line-height: 1.9; color: #374151; font-weight: 500;">
          • <strong>19h00 - 21h15:</strong> Liveshow
        </div>
        <div class="timeline-item" style="font-size: 15px; line-height: 1.9; color: #374151; font-weight: 500;">
          • <strong>21h15 - 21h30:</strong> Kết thúc “Ván cờ”
        </div>
        <div class="venue-row" style="font-size: 15px; line-height: 1.7; color: #111827; margin-top: 12px; padding-top: 12px; border-top: 1px dashed rgba(180, 150, 100, 0.35);">
          <strong>Địa điểm:</strong> {{event_venue}}
        </div>
      </div>

      <!-- DRESSCODE (4 Ô MÀU TO Ở GIỮA - VÀNG GOLD NHẠT HƠN) -->
      <div class="section-title" style="text-align: center; font-size: 17px; font-weight: 900; letter-spacing: 2px; color: #111827; margin: 36px 0 16px 0; text-transform: uppercase;">
        DRESSCODE
      </div>
      <table class="dresscode-table" style="width: 100%; max-width: 480px; margin: 0 auto 12px auto; border-spacing: 8px;">
        <tr>
          <!-- ĐEN -->
          <td class="dress-card" style="width: 25%; text-align: center; padding: 14px 6px; border-radius: 16px; background-color: #F5EFE6; border: 1px solid rgba(180, 150, 100, 0.28);">
            <div class="dress-box dress-box-black" style="width: 56px; height: 56px; border-radius: 14px; margin: 0 auto 8px auto; background-color: #0A0A0A; border: 2px solid #27272A; box-shadow: 0 2px 6px rgba(0,0,0,0.15);"></div>
            <div class="dress-name" style="font-size: 14px; font-weight: 900; letter-spacing: 1px; color: #111827; margin-bottom: 5px;">ĐEN</div>
            <span class="dress-badge badge-gray" style="display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 12px; background-color: #E5DCCE; color: #4B5563;">Chủ đạo</span>
          </td>
          <!-- TRẮNG -->
          <td class="dress-card" style="width: 25%; text-align: center; padding: 14px 6px; border-radius: 16px; background-color: #F5EFE6; border: 1px solid rgba(180, 150, 100, 0.28);">
            <div class="dress-box dress-box-white" style="width: 56px; height: 56px; border-radius: 14px; margin: 0 auto 8px auto; background-color: #FFFFFF; border: 2px solid #CBD5E1; box-shadow: 0 2px 6px rgba(0,0,0,0.08);"></div>
            <div class="dress-name" style="font-size: 14px; font-weight: 900; letter-spacing: 1px; color: #111827; margin-bottom: 5px;">TRẮNG</div>
            <span class="dress-badge badge-gray" style="display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 12px; background-color: #E5DCCE; color: #4B5563;">Chủ đạo</span>
          </td>
          <!-- ĐỎ -->
          <td class="dress-card" style="width: 25%; text-align: center; padding: 14px 6px; border-radius: 16px; background-color: #F5EFE6; border: 1px solid rgba(180, 150, 100, 0.28);">
            <div class="dress-box dress-box-red" style="width: 56px; height: 56px; border-radius: 14px; margin: 0 auto 8px auto; background-color: #DC2626; border: 2px solid #EF4444; box-shadow: 0 2px 6px rgba(220,38,38,0.25);"></div>
            <div class="dress-name" style="font-size: 14px; font-weight: 900; letter-spacing: 1px; color: #111827; margin-bottom: 5px;">ĐỎ</div>
            <span class="dress-badge badge-gray" style="display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 12px; background-color: #E5DCCE; color: #4B5563;">Chủ đạo</span>
          </td>
          <!-- VÀNG GOLD (NHẠT HƠN, THEO ĐÚNG ẢNH MẪU) -->
          <td class="dress-card" style="width: 25%; text-align: center; padding: 14px 6px; border-radius: 16px; background-color: #F5EFE6; border: 1px solid rgba(180, 150, 100, 0.28);">
            <div class="dress-box dress-box-gold" style="width: 56px; height: 56px; border-radius: 14px; margin: 0 auto 8px auto; background: linear-gradient(135deg, #F3D063 0%, #E2B83E 100%); border: 2px solid #F0DA85; box-shadow: 0 2px 8px rgba(226,184,62,0.35);"></div>
            <div class="dress-name" style="font-size: 14px; font-weight: 900; letter-spacing: 0.5px; color: #111827; margin-bottom: 5px; line-height: 1.2;">VÀNG<br>GOLD</div>
            <span class="dress-badge badge-gold" style="display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 12px; background-color: #FEF3C7; color: #92400E; border: 1px solid #FCD34D;">Điểm nhấn</span>
          </td>
        </tr>
      </table>

      <!-- MÃ CHECK IN -->
      <div class="section-title" style="text-align: center; font-size: 17px; font-weight: 900; letter-spacing: 2px; color: #111827; margin: 36px 0 16px 0; text-transform: uppercase;">
        MÃ CHECK IN
      </div>
      <div class="qr-container" style="text-align: center; margin: 18px 0;">
        {{qr_code}}
      </div>

      <div class="closing-text" style="text-align: center; font-size: 16px; font-weight: 600; color: #374151; margin: 18px 0 24px 0; line-height: 1.6;">
        Chúc bạn có một hành trình âm nhạc tuyệt vời tại Sắc I. Ván cờ - Album Sắc
      </div>

      <!-- NÚT LIÊN HỆ FANPAGE -->
      <div style="text-align: center; margin: 24px 0 12px 0;">
        <a href="https://www.facebook.com/dtuacoustic" target="_blank" class="btn-fanpage" style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #FFFFFF !important; font-size: 16px; font-weight: 800; text-decoration: none; padding: 14px 44px; border-radius: 30px; box-shadow: 0 8px 22px rgba(184, 134, 11, 0.35); text-align: center;">
          Liên hệ Fanpage
        </a>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer" style="text-align: center; padding: 22px 28px; background-color: #E8DFC8; border-top: 1px solid rgba(180, 150, 100, 0.28); font-size: 13px; color: #4B5563; line-height: 1.7;">
      Hotline: {{hotline}} • Email: dtuacousticclub@gmail.com<br>
      © 2026 CLB DTU Acoustic • SẮC I. VÁN CỜ
    </div>
  </div>
</body>
</html>`

export const MOCK_TICKET_DATA: Record<string, string> = {
  full_name: 'Trần Anh Dũng',
  order_code: 'CLB-LG6FHWZ',
  lucky_number: '009',
  feedback: 'Mong được nghe ban nhạc biểu diễn ca khúc Diễm Xưa ạ!',
  qr_code: '<img src="https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=CLB-DEMO-TICKET" alt="Mã QR Check-in" class="qr-img" style="width: 190px; height: 190px; display: block; margin: 0 auto; border: 3px solid #D4AF37; border-radius: 16px; padding: 8px; background: #FFFFFF; box-shadow: 0 4px 14px rgba(60,45,20,0.1);" />',
  event_name: 'SẮC I. VÁN CỜ',
  event_date: '07/11/2026',
  event_time: '18:30 - 21:30',
  event_venue: '<a href="https://maps.app.goo.gl/qS7bS6jx4Qev1ZeP7?g_st=ic" target="_blank" style="color: #B45309; text-decoration: underline; font-weight: 700;">📍 T&K Coffee - 177 Hồ Tùng Mậu (Mở chỉ đường Google Maps ↗)</a>',
  event_venue_name: 'T&K Coffee',
  event_venue_address: '177 Hồ Tùng Mậu',
  event_venue_maps_url: 'https://maps.app.goo.gl/qS7bS6jx4Qev1ZeP7?g_st=ic',
  user_email: 'trananhdung11102006@gmail.com',
  phone: '0905 123 456',
  organization: 'Tự do',
  amount: '89.000 ₫',
  hotline: '0362161480 (Bích Ngọc - Chủ Nhiệm)',
}

export function compileEmailTemplate(template: string, data: Record<string, any>): string {
  let compiled = template
  for (const [key, val] of Object.entries(data)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    compiled = compiled.replace(pattern, String(val ?? ''))
  }
  return compiled
}

export function compileEmailSubject(subject: string, data: Record<string, any>): string {
  let compiled = subject
  for (const [key, val] of Object.entries(data)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    compiled = compiled.replace(pattern, String(val ?? ''))
  }
  return compiled
}
