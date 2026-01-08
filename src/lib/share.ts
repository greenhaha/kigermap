import type { KigurumiUser } from '@/types'

// 生成分享链接
export function generateShareUrl(user: KigurumiUser): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const shareCode = user.shareCode || ''
  return `${baseUrl}/profile/${shareCode}`
}

// 获取当前网站域名（不含协议）
export function getSiteHost(): string {
  if (typeof window !== 'undefined') {
    return window.location.host
  }
  return 'cydlcs.com'
}

// 分享到 QQ
export function shareToQQ(user: KigurumiUser) {
  const url = generateShareUrl(user)
  const title = user.cnName ? `${user.cnName} - Kigurumi Map` : 'Kigurumi Map'
  const summary = user.introduction ? user.introduction.slice(0, 100) : '发现全球Kigurumi爱好者'
  const pic = user.photos?.[0] || ''
  
  const shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}&pics=${encodeURIComponent(pic)}`
  
  window.open(shareUrl, '_blank', 'width=600,height=500')
}

// 分享到 QQ 空间
export function shareToQzone(user: KigurumiUser) {
  const url = generateShareUrl(user)
  const title = user.cnName ? `${user.cnName} - Kigurumi Map` : 'Kigurumi Map'
  const summary = user.introduction ? user.introduction.slice(0, 100) : '发现全球Kigurumi爱好者'
  const pic = user.photos?.[0] || ''
  
  const shareUrl = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}&pics=${encodeURIComponent(pic)}`
  
  window.open(shareUrl, '_blank', 'width=600,height=500')
}

// 复制链接
export async function copyShareLink(user: KigurumiUser): Promise<boolean> {
  const url = generateShareUrl(user)
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    // 降级方案
    const input = document.createElement('input')
    input.value = url
    document.body.appendChild(input)
    input.select()
    try {
      document.execCommand('copy')
    } catch {
      // ignore
    }
    document.body.removeChild(input)
    return true
  }
}

// 预加载图片并转换为 base64
export async function preloadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('无法创建 canvas context'))
          return
        }
        ctx.drawImage(img, 0, 0)
        const dataUrl = canvas.toDataURL('image/png')
        resolve(dataUrl)
      } catch (err) {
        // CORS 问题，返回原始 URL
        resolve(url)
      }
    }
    
    img.onerror = () => {
      // 加载失败，返回原始 URL
      resolve(url)
    }
    
    // 添加时间戳避免缓存问题
    const separator = url.includes('?') ? '&' : '?'
    img.src = `${url}${separator}t=${Date.now()}`
  })
}

// 预加载多张图片
export async function preloadImages(urls: string[]): Promise<string[]> {
  const promises = urls.map(url => preloadImageAsBase64(url))
  return Promise.all(promises)
}

// 生成分享图片
export async function generateShareImage(elementId: string): Promise<string> {
  const html2canvas = (await import('html2canvas')).default
  const element = document.getElementById(elementId)
  if (!element) throw new Error('元素不存在')
  
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    imageTimeout: 15000,
  })
  
  return canvas.toDataURL('image/png')
}

// 下载分享图片
export function downloadShareImage(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}
