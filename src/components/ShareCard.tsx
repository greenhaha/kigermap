'use client'

import { useState } from 'react'
import type { KigurumiUser } from '@/types'
import { generateShareImage, downloadShareImage, shareToQQ } from '@/lib/share'

interface ShareCardProps {
  user: KigurumiUser
}

export default function ShareCard({ user }: ShareCardProps) {
  const [generating, setGenerating] = useState(false)

  const handleDownload = async () => {
    setGenerating(true)
    try {
      const dataUrl = await generateShareImage('share-card-content')
      downloadShareImage(dataUrl, `${user.cnName}-kigurumi.png`)
    } catch (err) {
      console.error('生成图片失败', err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      {/* 可导出的卡片内容 */}
      <div
        id="share-card-content"
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)' }}
      >
        {/* 头部 */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
            🎭
          </div>
          <div>
            <p className="font-bold text-white">Kigurumi Map</p>
            <p className="text-white/70 text-xs">发现全球Kigurumi爱好者</p>
          </div>
        </div>

        {/* 照片 */}
        <div className="bg-white mx-3 rounded-xl overflow-hidden">
          <div className="grid grid-cols-3 gap-1 p-1">
            {user.photos.slice(0, 3).map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt=""
                className="aspect-square object-cover rounded-lg"
              />
            ))}
            {user.photos.length < 3 && Array(3 - user.photos.length).fill(0).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square bg-gray-100 rounded-lg" />
            ))}
          </div>
          
          {/* 信息 */}
          <div className="p-4">
            <h3 className="text-xl font-bold text-gray-800">{user.cnName}</h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <span>📍</span>
              {user.location.city || user.location.province || ''} {user.location.country}
            </p>
            <p className="text-gray-600 mt-3 text-sm line-clamp-2">
              {user.introduction}
            </p>
          </div>
        </div>

        {/* 底部 */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs">扫码查看更多</p>
            <p className="text-white font-medium text-sm mt-0.5">kigurumi-map.com</p>
          </div>
          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13 0h-2v2h2v-2zm0 4h-2v2h2v-2zm-4-4h-2v2h2v-2zm4 0h2v2h-2v-2zm0-4h2v2h-2v-2zm-4 4h-2v2h2v-2zm4 4h2v2h-2v-2z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3 mt-5">
        <button
          onClick={handleDownload}
          disabled={generating}
          className="flex-1 py-3.5 btn-gradient rounded-xl font-medium text-white touch-target flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              保存图片
            </>
          )}
        </button>
        <button
          onClick={() => shareToQQ(user)}
          className="flex-1 py-3.5 bg-[#12B7F5] hover:bg-[#0EA5E9] text-white rounded-xl font-medium touch-target flex items-center justify-center gap-2 transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
          分享到QQ
        </button>
      </div>
    </div>
  )
}
