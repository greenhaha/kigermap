import type { KigurumiUser } from '@/types'

// 生成分享链接
export function generateShareUrl(user: KigurumiUser): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const shareCode = user.shareCode || ''
  return `${baseUrl}/profile/${shareCode}`
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
    document.execCommand('copy')
    document.body.removeChild(input)
    return true
  }
}

// 生成分享图片
export async function generateShareImage(elementId: string): Promise<string> {
  const html2canvas = (await import('html2canvas')).default
  const element = document.getElementById(elementId)
  if (!element) throw new Error('元素不存在')
  
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
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
