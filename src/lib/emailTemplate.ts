import { EVENT_INFO } from './constants'
import { formatCurrency, formatDate, formatLuckyNumber } from './utils'

export const DEFAULT_EMAIL_SUBJECT = '[Vé Điện Tử] {{event_name}} | Mã vé: {{order_code}} | Khán giả: {{full_name}}'

export const EMAIL_PLACEHOLDERS = [
  { key: '{{full_name}}', label: 'Họ và tên', desc: 'Tên đầy đủ của khán giả', example: 'Trần Anh Dũng' },
  { key: '{{order_code}}', label: 'Mã đơn vé', desc: 'Mã định danh vé duy nhất', example: 'CLB-LG6FHWZ' },
  { key: '{{lucky_number}}', label: 'Số may mắn', desc: 'Số bốc thăm 3 chữ số (000-999)', example: '009' },
  { key: '{{qr_code}}', label: 'Ảnh mã QR', desc: 'Ảnh QR dùng check-in tại cổng', example: '[Hình ảnh mã QR]' },
  { key: '{{event_name}}', label: 'Tên sự kiện', desc: 'Tên chính thức của liveshow', example: 'SẮC I. VÁN CỜ' },
  { key: '{{event_date}}', label: 'Ngày diễn ra', desc: 'Ngày tổ chức liveshow', example: '07/11/2026' },
  { key: '{{event_time}}', label: 'Giờ diễn ra', desc: 'Khung giờ biểu diễn', example: '19:00 - 21:30' },
  { key: '{{event_venue}}', label: 'Địa điểm', desc: 'Địa chỉ tổ chức sự kiện', example: 'Hội trường lớn Đại học Duy Tân, TP. Đà Nẵng' },
  { key: '{{event_venue_maps_url}}', label: 'Link Google Maps', desc: 'Đường dẫn bản đồ chỉ đường', example: 'https://maps.google.com' },
  { key: '{{user_email}}', label: 'Email khán giả', desc: 'Địa chỉ hòm thư người nhận', example: 'khangia@gmail.com' },
  { key: '{{phone}}', label: 'Số điện thoại', desc: 'Số liên hệ của người đặt vé', example: '0905 123 456' },
  { key: '{{organization}}', label: 'Trường / Đơn vị', desc: 'Đơn vị học tập hoặc làm việc', example: 'Đại học Duy Tân' },
  { key: '{{amount}}', label: 'Giá vé', desc: 'Số tiền thanh toán', example: '89.000 ₫' },
  { key: '{{hotline}}', label: 'Hotline BTC', desc: 'Số điện thoại hỗ trợ', example: '0905 123 456' },
]

export const DEFAULT_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{event_name}} - Vé Điện Tử</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0D0D0D !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF !important; }
    .container { max-width: 580px; margin: 20px auto; background-color: #141414 !important; border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 20px; overflow: hidden; box-shadow: 0 10px 35px rgba(0,0,0,0.6); }
    .header { background: linear-gradient(135deg, #1F1916 0%, #0D0D0D 100%) !important; padding: 36px 24px; text-align: center; border-bottom: 2px solid #D4AF37; }
    .chess-icon { font-size: 42px; display: block; margin-bottom: 8px; color: #D4AF37 !important; }
    .title { color: #D4AF37 !important; font-size: 26px; font-weight: 900; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
    .subtitle { color: #A8A090 !important; font-size: 13px; margin: 8px 0 0; font-weight: 500; }
    .body { padding: 32px 24px; }
    .greeting { color: #FFFFFF !important; font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .text { color: #A8A090 !important; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    .ticket-card { background-color: #0D0D0D !important; border: 1px solid #D4AF37; border-radius: 16px; padding: 24px; margin: 20px 0; }
    .ticket-header { font-size: 11px; color: #A8A090 !important; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; font-weight: 700; }
    .order-code { font-size: 28px; font-weight: 900; color: #D4AF37 !important; margin: 0 0 18px; font-family: monospace; letter-spacing: 2px; }
    .info-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; font-size: 13px; }
    .info-label { color: #8E8E93 !important; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .info-value { color: #FFFFFF !important; font-weight: 700; text-align: right; max-width: 65%; }
    .maps-btn { display: inline-block; margin-top: 8px; padding: 7px 14px; background-color: #D4AF37 !important; color: #0D0D0D !important; text-decoration: none; border-radius: 8px; font-size: 11px; font-weight: 900; letter-spacing: 0.5px; }
    .divider { border: none; border-top: 1px dashed rgba(255, 255, 255, 0.15); margin: 18px 0; }
    .lucky-section { text-align: center; padding: 18px; background: linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(185, 28, 28, 0.12) 100%) !important; border-radius: 14px; border: 1px solid rgba(212, 175, 55, 0.35); margin: 20px 0; }
    .lucky-label { color: #D4AF37 !important; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold; }
    .lucky-number { color: #FFFFFF !important; font-size: 40px; font-weight: 900; letter-spacing: 6px; margin: 6px 0; font-family: monospace; text-shadow: 0 0 15px rgba(212,175,55,0.4); }
    .qr-section { text-align: center; margin: 24px 0 12px; }
    .qr-label { color: #A8A090 !important; font-size: 12px; margin-bottom: 14px; font-weight: 600; }
    .qr-container { display: inline-block; padding: 12px; background-color: #FFFFFF !important; border-radius: 14px; border: 3px solid #D4AF37; }
    .qr-img { width: 190px; height: 190px; display: block; }
    .warning { background-color: rgba(229, 57, 53, 0.08) !important; border: 1px solid rgba(229, 57, 53, 0.3); border-radius: 10px; padding: 14px; margin: 20px 0; }
    .warning-text { color: #FF8A80 !important; font-size: 12px; margin: 0; line-height: 1.5; }
    .footer { background-color: #080808 !important; padding: 24px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08); }
    .footer-text { color: #636366 !important; font-size: 11px; line-height: 1.6; margin: 0; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0D0D0D; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div class="container" style="max-width: 580px; margin: 20px auto; background-color: #141414; border: 1px solid rgba(212, 175, 55, 0.35); border-radius: 20px; overflow: hidden;">
    <div class="header" style="background: linear-gradient(135deg, #1F1916 0%, #0D0D0D 100%); padding: 36px 24px; text-align: center; border-bottom: 2px solid #D4AF37;">
      <span class="chess-icon" style="font-size: 42px; display: block; margin-bottom: 8px; color: #D4AF37;">♟</span>
      <h1 class="title" style="color: #D4AF37 !important; font-size: 26px; font-weight: 900; margin: 0; letter-spacing: 2px; text-transform: uppercase;">{{event_name}}</h1>
      <p class="subtitle" style="color: #A8A090 !important; font-size: 13px; margin: 8px 0 0; font-weight: 500;">Live Show Kỷ Niệm 11 Năm Thành Lập CLB DTU Acoustic</p>
    </div>
    
    <div class="body" style="padding: 32px 24px;">
      <div class="greeting" style="color: #FFFFFF !important; font-size: 18px; font-weight: 700; margin-bottom: 8px;">Xin chào, {{full_name}}! 🎶</div>
      <p class="text" style="color: #A8A090 !important; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        Cảm ơn bạn đã lựa chọn đồng hành cùng đêm diễn <strong style="color: #D4AF37 !important;">{{event_name}}</strong>. 
        Đơn đặt vé của bạn đã được ban tổ chức xác nhận thanh toán thành công. Dưới đây là thông tin vé điện tử chính thức của bạn:
      </p>
      
      <div class="ticket-card" style="background-color: #0D0D0D !important; border: 1px solid #D4AF37; border-radius: 16px; padding: 24px; margin: 20px 0;">
        <div class="ticket-header" style="font-size: 11px; color: #A8A090 !important; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; font-weight: 700;">MÃ VÉ THAM DỰ</div>
        <div class="order-code" style="font-size: 28px; font-weight: 900; color: #D4AF37 !important; margin: 0 0 18px; font-family: monospace; letter-spacing: 2px;">{{order_code}}</div>
        
        <div class="info-row" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; font-size: 13px;">
          <span class="info-label" style="color: #8E8E93 !important; font-size: 12px; font-weight: 600; text-transform: uppercase;">Khán giả:</span>
          <span class="info-value" style="color: #FFFFFF !important; font-weight: 700; text-align: right;">{{full_name}}</span>
        </div>
        <div class="info-row" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; font-size: 13px;">
          <span class="info-label" style="color: #8E8E93 !important; font-size: 12px; font-weight: 600; text-transform: uppercase;">Đơn vị:</span>
          <span class="info-value" style="color: #FFFFFF !important; font-weight: 700; text-align: right;">{{organization}}</span>
        </div>
        <div class="info-row" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; font-size: 13px;">
          <span class="info-label" style="color: #8E8E93 !important; font-size: 12px; font-weight: 600; text-transform: uppercase;">Thời gian:</span>
          <span class="info-value" style="color: #FFFFFF !important; font-weight: 700; text-align: right;">{{event_date}} • {{event_time}}</span>
        </div>
        <div class="info-row" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; font-size: 13px;">
          <span class="info-label" style="color: #8E8E93 !important; font-size: 12px; font-weight: 600; text-transform: uppercase;">Địa điểm:</span>
          <span class="info-value" style="color: #FFFFFF !important; font-weight: 700; text-align: right;">{{event_venue}}</span>
        </div>
        
        <hr class="divider" style="border: none; border-top: 1px dashed rgba(255, 255, 255, 0.15); margin: 18px 0;">
        
        <div class="lucky-section" style="text-align: center; padding: 18px; background: linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(185, 28, 28, 0.12) 100%) !important; border-radius: 14px; border: 1px solid rgba(212, 175, 55, 0.35); margin: 20px 0;">
          <div class="lucky-label" style="color: #D4AF37 !important; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold;">✦ SỐ MAY MẮN LUCKY DRAW ✦</div>
          <div class="lucky-number" style="color: #FFFFFF !important; font-size: 40px; font-weight: 900; letter-spacing: 6px; margin: 6px 0; font-family: monospace; text-shadow: 0 0 15px rgba(212,175,55,0.4);">#{{lucky_number}}</div>
          <div style="color: #A8A090 !important; font-size: 11px;">Lưu lại mã số này để tham gia quay thưởng các phần quà đặc biệt từ BTC!</div>
        </div>
        
        <div class="qr-section" style="text-align: center; margin: 24px 0 12px;">
          <div class="qr-label" style="color: #A8A090 !important; font-size: 12px; margin-bottom: 14px; font-weight: 600;">MÃ QR CHECK-IN TẠI CỔNG</div>
          <div class="qr-container" style="display: inline-block; padding: 12px; background-color: #FFFFFF !important; border-radius: 14px; border: 3px solid #D4AF37;">
            {{qr_code}}
          </div>
          <div style="color: #8E8E93 !important; font-size: 11px; margin-top: 10px;">Vui lòng xuất trình mã QR này cho ban tổ chức tại bàn check-in vào cửa</div>
        </div>
      </div>
      
      <div class="warning" style="background-color: rgba(229, 57, 53, 0.08) !important; border: 1px solid rgba(229, 57, 53, 0.3); border-radius: 10px; padding: 14px; margin: 20px 0;">
        <p class="warning-text" style="color: #FF8A80 !important; font-size: 12px; margin: 0; line-height: 1.5;">
          ⚠️ <strong>Lưu ý quan trọng:</strong> Mỗi mã QR chỉ có giá trị check-in một lần duy nhất. Vui lòng bảo mật thông tin vé và không chia sẻ ảnh mã QR cho người khác để tránh trường hợp bị chiếm dụng quyền vào cửa.
        </p>
      </div>
    </div>
    
    <div class="footer" style="background-color: #080808 !important; padding: 24px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08);">
      <p class="footer-text" style="color: #636366 !important; font-size: 11px; line-height: 1.6; margin: 0;">
        Hotline hỗ trợ: {{hotline}}<br>
        Email: dtuacousticclub@gmail.com<br>
        © 2026 CLB DTU Acoustic • {{event_name}}
      </p>
    </div>
  </div>
</body>
</html>`

export const MOCK_TICKET_DATA: Record<string, string> = {
  full_name: 'Trần Anh Dũng',
  order_code: 'CLB-LG6FHWZ',
  lucky_number: '009',
  qr_code: '<img src="https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=CLB-DEMO-TICKET" alt="Mã QR Demo" class="qr-img" style="width: 190px; height: 190px; display: block;" />',
  event_name: 'SẮC I. VÁN CỜ',
  event_date: '07/11/2026',
  event_time: '19:00 - 21:30',
  event_venue: 'Hội trường lớn Đại học Duy Tân, TP. Đà Nẵng',
  event_venue_maps_url: 'https://maps.google.com',
  user_email: 'trananhdung11102006@gmail.com',
  phone: '0905 123 456',
  organization: 'Đại học Duy Tân',
  amount: '89.000 ₫',
  hotline: '0905 123 456 (CLB DTU Acoustic)',
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
