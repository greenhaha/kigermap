'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { KigurumiUser } from '@/types'
import ShareCard from '@/components/ShareCard'
import { shareToQQ, shareToQzone, copyShareLink } from '@/lib/share'

interface ProfileClientProps {
  user: KigurumiUser
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [showShareCard, setShowShareCard] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleCopy = async () => {
    await copyShareLink(user)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 只显示省份
  const locationText = user.location.province || user.location.country

  return (
    <div className="min-h-screen relative">
      <div className="bg-animated" />

      {/* 头部导航 - 透明悬浮 */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link 
            href="/" 
            className="w-10 h-10 glass-dark rounded-full flex items-center justify-center hover:bg-white/10 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <button
            onClick={handleCopy}
            className={`px-4 py-2 glass-dark rounded-full text-sm font-medium transition ${
              copied ? 'bg-green-500/20 text-green-400' : 'hover:bg-white/10'
            }`}
          >
            {copied ? '✓ 已复制链接' : '分享'}
          </button>
        </div>
      </header>

      <main className={`max-w-2xl mx-auto pb-8 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* 照片轮播区域 */}
        <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-dark-light overflow-hidden">
          <img
            src={user.photos[currentPhoto]}
            alt={user.cnName}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          
          {/* 顶部渐变 */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-dark/60 to-transparent" />
          
          {/* 底部渐变 */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-dark via-dark/80 to-transparent" />
          
          {/* 左右切换按钮 */}
          {user.photos.length > 1 && (
            <>
              <button
                onClick={() => setCurrentPhoto(i => (i - 1 + user.photos.length) % user.photos.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/50 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPhoto(i => (i + 1) % user.photos.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/50 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* 底部用户信息 */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{user.cnName}</h1>
                <div className="flex items-center gap-2 text-white/70">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {locationText}
                  </span>
                </div>
              </div>
              
              {/* 图片指示器 */}
              {user.photos.length > 1 && (
                <div className="flex gap-1.5">
                  {user.photos.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPhoto(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentPhoto ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 缩略图预览 */}
        {user.photos.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            {user.photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setCurrentPhoto(i)}
                className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden transition-all duration-300 ${
                  i === currentPhoto 
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-dark scale-105' 
                    : 'opacity-50 hover:opacity-80'
                }`}
              >
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* 自我介绍卡片 */}
        <div className="mx-4 mt-4">
          <div className="glass rounded-2xl p-5 relative overflow-hidden">
            {/* 装饰性渐变 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
            
            <div className="relative">
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-gradient-to-b from-primary to-secondary rounded-full" />
                自我介绍
              </h2>
              <p className="text-white/90 leading-relaxed text-sm sm:text-base">{user.introduction}</p>
            </div>
          </div>
        </div>

        {/* 分享按钮组 */}
        <div className="px-4 mt-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => shareToQQ(user)}
              className="py-3 bg-[#12B7F5] hover:bg-[#0EA5E9] text-white rounded-xl font-medium transition flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
              QQ
            </button>
            <button
              onClick={() => shareToQzone(user)}
              className="py-3 bg-[#FECE00] hover:bg-[#EAB308] text-dark rounded-xl font-medium transition flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              QQ空间
            </button>
          </div>
          
          <button
            onClick={() => setShowShareCard(true)}
            className="w-full py-3.5 btn-gradient rounded-xl font-medium text-white transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            生成分享图片
          </button>
        </div>

        {/* 返回地图按钮 */}
        <div className="px-4 mt-5">
          <Link
            href="/"
            className="block w-full py-3.5 text-center glass hover:bg-white/10 rounded-xl font-medium transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            探索更多 Kigurumi
          </Link>
        </div>
      </main>

      {/* 分享卡片弹窗 */}
      {showShareCard && (
        <div 
          className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowShareCard(false)}
        >
          <div 
            className="glass-dark rounded-2xl p-5 max-w-sm w-full animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">生成分享图片</h3>
              <button 
                onClick={() => setShowShareCard(false)} 
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ShareCard user={user} />
          </div>
        </div>
      )}
    </div>
  )
}
