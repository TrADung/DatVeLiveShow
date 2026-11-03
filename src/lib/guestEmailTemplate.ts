import { EVENT_INFO } from './constants'
import { formatLuckyNumber } from './utils'

export interface GuestTicketInfo {
  order_code: string
  lucky_number: number | string
  qr_cid: string
  qr_data_url?: string
}

export interface CompileGuestEmailOptions {
  guestName: string
  targetType: 'Thư Mời' | 'Thư Ngỏ' | 'Cá Nhân'
  customMessage: string
  tickets: GuestTicketInfo[]
  invitationImageCid?: string
  invitationImageUrl?: string
}

export function compileGuestEmailHtml({
  guestName,
  targetType,
  customMessage,
  tickets,
  invitationImageCid,
  invitationImageUrl,
}: CompileGuestEmailOptions): string {
  const isThuNgo = targetType === 'Thư Ngỏ'
  const hasTickets = tickets && tickets.length > 0 && !isThuNgo

  // Lời ngỏ mặc định nếu admin để trống
  const bodyText = (customMessage || '').trim() || (
    isThuNgo
      ? `CLB DTU Acoustic xin gửi lời chào trân trọng nhất đến quý đơn vị / anh/chị. Nhân dịp kỷ niệm 12 năm thành lập, chúng tôi trân trọng kính mời quý vị đến chung vui cùng chúng tôi trong đêm nhạc Liveshow SẮC I. VÁN CỜ.`
      : `CLB DTU Acoustic xin gửi lời chào trân trọng nhất. Chúng tôi rất vinh hạnh được đón tiếp quý đơn vị / anh/chị tại đêm nhạc kỷ niệm 12 năm thành lập - Liveshow SẮC I. VÁN CỜ.`
  )

  const cardImageSrc = invitationImageCid
    ? `cid:${invitationImageCid}`
    : invitationImageUrl || '/images/EmailForm/guest_invitation_sample.png'

  // Render danh sách vé tặng (Mỗi vé gồm Số may mắn + Khối mã QR)
  const ticketsHtml = hasTickets
    ? tickets
        .map((t, idx) => {
          const qrSrc = t.qr_cid ? `cid:${t.qr_cid}` : t.qr_data_url || ''
          const ticketLabel = tickets.length > 1 ? `VÉ MỜI 0${idx + 1}` : 'VÉ MỜI THAM DỰ'
          const formattedLucky = formatLuckyNumber(t.lucky_number)

          return `
          <div style="margin: 28px 0; text-align: center;">
            <!-- SỐ MAY MẮN -->
            <div style="font-size: 18px; font-weight: 800; color: #111827; margin-bottom: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              Số may mắn: <span style="font-family: monospace; font-size: 22px; font-weight: 900; color: #B45309; letter-spacing: 1.5px;">#${formattedLucky}</span>
              ${tickets.length > 1 ? `<span style="font-size: 12px; color: #6B7280; font-weight: 600; margin-left: 6px;">(${ticketLabel})</span>` : ''}
            </div>

            <!-- KHỐI MÃ CHECK IN -->
            <div style="max-width: 440px; margin: 0 auto; background-color: #FFFFFF; border: 2px solid #E5C158; border-radius: 22px; padding: 24px 20px; box-shadow: 0 6px 20px rgba(180, 150, 100, 0.15);">
              <div style="font-size: 14px; font-weight: 900; letter-spacing: 2px; color: #111827; text-transform: uppercase; margin-bottom: 14px;">
                MÃ CHECK IN
              </div>
              <div style="display: inline-block; padding: 6px; border: 2px solid #D4AF37; border-radius: 14px; background: #FFFFFF;">
                <img src="${qrSrc}" alt="Mã QR Check-in" style="width: 180px; height: 180px; display: block; margin: 0 auto;" />
              </div>
              <div style="font-size: 11px; font-mono; font-weight: 700; color: #9CA3AF; margin-top: 8px;">
                MÃ VÉ: ${t.order_code}
              </div>
              <div style="font-size: 13px; color: #4B5563; font-style: italic; margin-top: 14px; line-height: 1.5;">
                Chúc bạn có một hành trình âm nhạc tuyệt vời tại Sắc I. Ván cờ - Album Sắc
              </div>
              <div style="margin-top: 18px;">
                <a href="${EVENT_INFO.facebookUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #FFFFFF !important; font-size: 14px; font-weight: 800; text-decoration: none; padding: 10px 32px; border-radius: 25px; box-shadow: 0 4px 14px rgba(184, 134, 11, 0.35);">
                  Liên hệ Fanpage
                </a>
              </div>
            </div>
          </div>
        `
        })
        .join('')
    : `
      <div style="text-align: center; margin: 26px 0;">
        <div style="font-size: 14px; color: #4B5563; font-style: italic; margin-bottom: 16px;">
          Rất hân hạnh được đón tiếp quý đơn vị / anh/chị tại sự kiện âm nhạc SẮC I. VÁN CỜ!
        </div>
        <a href="${EVENT_INFO.facebookUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%); color: #FFFFFF !important; font-size: 14px; font-weight: 800; text-decoration: none; padding: 11px 34px; border-radius: 25px; box-shadow: 0 4px 14px rgba(184, 134, 11, 0.35);">
          Liên hệ Fanpage DTU Acoustic
        </a>
      </div>
    `

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thư Mời Tham Dự - SẮC I. VÁN CỜ</title>
</head>
<body style="margin: 0; padding: 0; background-color: #EEE5D8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
  <div style="max-width: 590px; margin: 20px auto; background-color: #FAF7F2; border: 1px solid rgba(180, 150, 100, 0.35); border-radius: 24px; overflow: hidden; box-shadow: 0 10px 35px rgba(60, 45, 20, 0.08);">
    
    <!-- BANNER ĐẦU EMAIL -->
    <div style="width: 100%; text-align: center; background-color: #0A0A0A; line-height: 0;">
      <img src="cid:ticketbanner" alt="Banner SẮC I. VÁN CỜ" style="width: 100%; max-width: 590px; height: auto; display: block; margin: 0 auto;" />
    </div>

    <!-- NỘI DUNG CHÍNH -->
    <div style="padding: 24px 26px;">
      
      <!-- LỜI CHÀO & TÊN KHÁCH MỜI -->
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 12px; font-weight: 800; letter-spacing: 2px; color: #B45309; text-transform: uppercase; margin-bottom: 6px;">
          ${targetType.toUpperCase()} THAM DỰ LIVESHOW
        </div>
        <div style="font-size: 22px; font-weight: 900; color: #111827; margin: 0 0 8px 0; line-height: 1.3;">
          Kính gửi: ${guestName}
        </div>
        <div style="font-size: 15px; line-height: 1.6; color: #4B5563; max-width: 500px; margin: 0 auto;">
          ${bodyText}
        </div>
      </div>

      <!-- ẢNH THIỆP THƯ MỜI / THƯ NGỎ (TRUNG TÂM) -->
      ${
        cardImageSrc
          ? `
      <div style="text-align: center; margin: 20px 0;">
        <img src="${cardImageSrc}" alt="Thiệp Mời" style="width: 100%; max-width: 500px; height: auto; border-radius: 18px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); display: block; margin: 0 auto; border: 1px solid rgba(180, 150, 100, 0.25);" />
      </div>
      `
          : ''
      }

      <!-- DRESSCODE (4 Ô MÀU CHUẨN ĐÚNG MẪU) -->
      <div style="text-align: center; font-size: 16px; font-weight: 900; letter-spacing: 2px; color: #111827; margin: 30px 0 14px 0; text-transform: uppercase;">
        DRESSCODE
      </div>
      <table style="width: 100%; max-width: 480px; margin: 0 auto 16px auto; border-spacing: 8px;">
        <tr>
          <!-- ĐEN -->
          <td style="width: 25%; text-align: center; padding: 12px 6px; border-radius: 16px; background-color: #F5EFE6; border: 1px solid rgba(180, 150, 100, 0.28);">
            <div style="width: 52px; height: 52px; border-radius: 12px; margin: 0 auto 8px auto; background-color: #0A0A0A; border: 2px solid #27272A; box-shadow: 0 2px 6px rgba(0,0,0,0.15);"></div>
            <div style="font-size: 13px; font-weight: 900; letter-spacing: 1px; color: #111827; margin-bottom: 4px;">ĐEN</div>
            <span style="display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; background-color: #E5DCCE; color: #4B5563;">Chủ đạo</span>
          </td>
          <!-- TRẮNG -->
          <td style="width: 25%; text-align: center; padding: 12px 6px; border-radius: 16px; background-color: #F5EFE6; border: 1px solid rgba(180, 150, 100, 0.28);">
            <div style="width: 52px; height: 52px; border-radius: 12px; margin: 0 auto 8px auto; background-color: #FFFFFF; border: 2px solid #CBD5E1; box-shadow: 0 2px 6px rgba(0,0,0,0.08);"></div>
            <div style="font-size: 13px; font-weight: 900; letter-spacing: 1px; color: #111827; margin-bottom: 4px;">TRẮNG</div>
            <span style="display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; background-color: #E5DCCE; color: #4B5563;">Chủ đạo</span>
          </td>
          <!-- ĐỎ -->
          <td style="width: 25%; text-align: center; padding: 12px 6px; border-radius: 16px; background-color: #F5EFE6; border: 1px solid rgba(180, 150, 100, 0.28);">
            <div style="width: 52px; height: 52px; border-radius: 12px; margin: 0 auto 8px auto; background-color: #DC2626; border: 2px solid #EF4444; box-shadow: 0 2px 6px rgba(220,38,38,0.25);"></div>
            <div style="font-size: 13px; font-weight: 900; letter-spacing: 1px; color: #111827; margin-bottom: 4px;">ĐỎ</div>
            <span style="display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; background-color: #E5DCCE; color: #4B5563;">Chủ đạo</span>
          </td>
          <!-- VÀNG GOLD -->
          <td style="width: 25%; text-align: center; padding: 12px 6px; border-radius: 16px; background-color: #F5EFE6; border: 1px solid rgba(180, 150, 100, 0.28);">
            <div style="width: 52px; height: 52px; border-radius: 12px; margin: 0 auto 8px auto; background: linear-gradient(135deg, #F3D063 0%, #E2B83E 100%); border: 2px solid #F0DA85; box-shadow: 0 2px 8px rgba(226,184,62,0.35);"></div>
            <div style="font-size: 13px; font-weight: 900; letter-spacing: 0.5px; color: #111827; margin-bottom: 4px; line-height: 1.2;">VÀNG<br>GOLD</div>
            <span style="display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; background-color: #FEF3C7; color: #92400E; border: 1px solid #FCD34D;">Điểm nhấn</span>
          </td>
        </tr>
      </table>

      <!-- PHẦN VÉ TẶNG: SỐ MAY MẮN & MÃ CHECK IN QR (NẾU CÓ) -->
      ${ticketsHtml}

    </div>

    <!-- FOOTER -->
    <div style="text-align: center; padding: 20px 24px; background-color: #E8DFC8; border-top: 1px solid rgba(180, 150, 100, 0.28); font-size: 13px; color: #4B5563; line-height: 1.7;">
      <div style="font-weight: 800; color: #111827; margin-bottom: 4px;">CLB DTU ACOUSTIC - ĐẠI HỌC DUY TÂN</div>
      <div>Hotline: <strong style="color: #111827;">${EVENT_INFO.hotline} (${EVENT_INFO.hotlineName})</strong></div>
      <div>Địa điểm: <strong style="color: #111827;">${EVENT_INFO.eventVenue}</strong></div>
      <div style="margin-top: 6px; font-size: 12px; color: #6B7280;">
        Email này được gửi tự động từ Ban Tổ Chức Liveshow SẮC I. VÁN CỜ
      </div>
    </div>

  </div>
</body>
</html>`
}
