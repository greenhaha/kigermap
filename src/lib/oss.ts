// 阿里云 OSS 配置和上传工具

export interface OSSConfig {
  region: string
  bucket: string
  accessKeyId: string
  accessKeySecret: string
}

export async function getOSSConfig(): Promise<OSSConfig> {
  const res = await fetch('/api/oss/config')
  if (!res.ok) throw new Error('获取上传凭证失败')
  return res.json()
}

// 上传到 OSS，按用户文件夹组织
export async function uploadToOSS(
  file: File | Blob,
  config: OSSConfig,
  userFolder: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const OSS = (await import('ali-oss')).default
  
  const client = new OSS({
    region: config.region,
    bucket: config.bucket,
    accessKeyId: config.accessKeyId,
    accessKeySecret: config.accessKeySecret,
  })

  // 统一使用 webp 格式
  const filename = `kigurumi/${userFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.webp`

  const result = await client.put(filename, file, {
    progress: (p: number) => onProgress?.(Math.round(p * 100)),
    headers: {
      'Content-Type': 'image/webp',
    },
  })

  return result.url
}

// 生成用户文件夹名（基于账户ID）
export function generateUserFolder(accountId: string): string {
  return `user_${accountId}`
}

// 支持的图片格式（包括单反相机 RAW 格式会被浏览器转为 JPEG）
const SUPPORTED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'image/heic',  // iPhone
  'image/heif',  // iPhone
]

// 图片压缩配置
interface CompressOptions {
  maxWidth?: number      // 最大宽度
  maxHeight?: number     // 最大高度
  quality?: number       // 压缩质量 0-1
  maxSizeMB?: number     // 最大文件大小 MB
}

// 高级图片压缩 - 支持多种格式，输出 WebP Blob
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.85,
    maxSizeMB = 1,
  } = options

  // 检查文件类型
  const fileType = file.type.toLowerCase()
  
  // HEIC/HEIF 格式需要特殊处理（iPhone 照片）
  if (fileType === 'image/heic' || fileType === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
    return await convertHeicToWebp(file, { maxWidth, maxHeight, quality })
  }

  // 使用 Canvas 进行压缩和格式转换
  return await compressWithCanvas(file, { maxWidth, maxHeight, quality, maxSizeMB })
}

// 使用 Canvas 压缩图片并转换为 WebP
async function compressWithCanvas(
  file: File,
  options: CompressOptions
): Promise<Blob> {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.85, maxSizeMB = 1 } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      // 计算缩放尺寸
      let { width, height } = img

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      // 创建 Canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('无法创建 Canvas'))
        return
      }

      // 设置图片平滑
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height)

      // 转换为 WebP
      const tryCompress = (q: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('图片压缩失败'))
              return
            }

            // 检查文件大小，如果太大则降低质量重试
            const sizeMB = blob.size / (1024 * 1024)
            if (sizeMB > maxSizeMB && q > 0.5) {
              tryCompress(q - 0.1)
            } else {
              resolve(blob)
            }
          },
          'image/webp',
          q
        )
      }

      tryCompress(quality)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片加载失败'))
    }

    img.src = url
  })
}

// 转换 HEIC/HEIF 格式（iPhone 照片）
async function convertHeicToWebp(
  file: File,
  options: CompressOptions
): Promise<Blob> {
  try {
    // 动态导入 heic2any 库
    const heic2any = (await import('heic2any')).default
    
    // 先转换为 JPEG
    const jpegBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    })

    // 创建临时 File 对象
    const jpegFile = new File(
      [jpegBlob as Blob],
      file.name.replace(/\.heic$/i, '.jpg'),
      { type: 'image/jpeg' }
    )

    // 再用 Canvas 转换为 WebP
    return await compressWithCanvas(jpegFile, options)
  } catch (error) {
    console.error('HEIC 转换失败:', error)
    // 降级处理：尝试直接用 Canvas（某些浏览器支持）
    return await compressWithCanvas(file, options)
  }
}

// 获取图片预览 URL（用于显示）
export function getPreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

// 释放预览 URL
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url)
}

// 验证图片文件
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // 检查文件大小（原始文件最大 50MB）
  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, error: '图片文件过大，请选择小于 50MB 的图片' }
  }

  // 检查文件类型
  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()
  
  const isValidType = SUPPORTED_TYPES.includes(fileType) ||
    fileName.endsWith('.heic') ||
    fileName.endsWith('.heif') ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.png') ||
    fileName.endsWith('.webp') ||
    fileName.endsWith('.gif') ||
    fileName.endsWith('.bmp')

  if (!isValidType) {
    return { valid: false, error: '不支持的图片格式，请使用 JPG、PNG、WebP、HEIC 等格式' }
  }

  return { valid: true }
}

// 批量压缩图片
export async function compressImages(
  files: File[],
  options?: CompressOptions,
  onProgress?: (current: number, total: number) => void
): Promise<Blob[]> {
  const results: Blob[] = []
  
  for (let i = 0; i < files.length; i++) {
    const compressed = await compressImage(files[i], options)
    results.push(compressed)
    onProgress?.(i + 1, files.length)
  }
  
  return results
}
