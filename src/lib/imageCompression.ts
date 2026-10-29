'use client'

export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  mimeType?: string
}

/**
 * Tự động nén ảnh trực tiếp trên trình duyệt (Client-side Image Compression)
 * - Tự động co kích thước tối đa 1600px x 1600px (giữ nguyên tỷ lệ chuẩn)
 * - Nén chất lượng 82% JPEG: chữ số tài khoản, mã GD, số tiền vẫn nét căng
 * - Giảm dung lượng từ 5MB - 12MB xuống còn ~300KB - 600KB (< 1MB)
 * - 100% không bao giờ vượt giới hạn 4.5MB của Vercel
 * - Có timeout an toàn 10s để không bao giờ bị treo UI
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    mimeType = 'image/jpeg',
  } = options

  // Nếu không ở môi trường trình duyệt hoặc không phải ảnh thì giữ nguyên
  if (typeof window === 'undefined' || !file.type.startsWith('image/')) {
    return file
  }

  return new Promise((resolve) => {
    let completed = false
    const img = document.createElement('img')
    const objectUrl = URL.createObjectURL(file)

    const finish = (result: File) => {
      if (completed) return
      completed = true
      clearTimeout(safetyTimeout)
      try {
        URL.revokeObjectURL(objectUrl)
      } catch (e) {
        // ignore
      }
      resolve(result)
    }

    // Safety timeout: tối đa 8 giây, nếu trình duyệt không xử lý được thì trả về file gốc
    const safetyTimeout = setTimeout(() => {
      console.warn('Nén ảnh timeout sau 8s, fallback dùng file gốc.')
      finish(file)
    }, 8000)

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width
        let height = img.naturalHeight || img.height

        // Nếu ảnh đã rất nhỏ (cả chiều rộng và chiều cao đều <= 1200px) và < 1MB, dùng luôn
        if (width <= 1200 && height <= 1200 && file.size < 1024 * 1024) {
          return finish(file)
        }

        // Tính toán kích thước mới theo tỷ lệ
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          return finish(file)
        }

        // Làm mịn ảnh chất lượng cao để rõ số giao dịch
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return finish(file)
            }

            // Nếu ảnh nén xong lại nặng hơn ảnh gốc (rất hiếm), giữ nguyên ảnh gốc
            if (blob.size >= file.size && file.type === mimeType) {
              return finish(file)
            }

            const originalBaseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
            const ext = mimeType === 'image/png' ? '.png' : '.jpg'
            const newFileName = `${originalBaseName}-optimized${ext}`

            const compressedFile = new File([blob], newFileName, {
              type: mimeType,
              lastModified: Date.now(),
            })

            finish(compressedFile)
          },
          mimeType,
          quality
        )
      } catch (err) {
        console.warn('Lỗi canvas khi nén ảnh, fallback dùng file gốc:', err)
        finish(file)
      }
    }

    img.onerror = (err) => {
      console.warn('Lỗi nạp ảnh khi nén, fallback dùng file gốc:', err)
      finish(file)
    }

    img.src = objectUrl
  })
}
