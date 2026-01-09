'use client'

import { useState, useEffect } from 'react'
import type { KigurumiUser } from '@/types'
import { shareToQQ, shareToQzone, copyShareLink } from '@/lib/share'
import AIChatModal from './AIChatModal'

interface UserCardProps {
  user: KigurumiUser
  onClose?: () => void
}

export default function UserCard({ user, onClose }: UserCardProps) {
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const [copied, setCopied] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    // 触发入场动画
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(), 200)
  }

  const handleCopy = async () => {
    await copyShareLink(user)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const nextPhoto = () => {
    setImgLoaded(false)
    setCurrentPhoto(i => (i + 1) % user.photos.length)
  }
  const prevPhoto = () => {
    setImgLoaded(false)
    setCurrentPhoto(i => (i - 1 + user.photos.length) % user.photos.length)
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isVisible ? 'bg-black/70 backdrop-blur-md' : 'bg-transparent'
      }`}
      onClick={handleClose}
    >
      {/* 主卡片容器 */}
      <div 
        className={`relative w-full max-w-4xl mx-4 transition-all duration-300 ease-out ${
          isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* 关闭按钮 - 悬浮在卡片外 */}
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 sm:right-0 sm:-top-14 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:rotate-90 duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 卡片主体 - 横向布局 */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/10 border border-white/10">
          <div className="flex flex-col sm:flex-row">
            {/* 左侧 - 照片画廊 */}
            <div className="relative sm:w-1/2 aspect-[3/4] sm:aspect-auto sm:min-h-[500px] bg-black/30">
              {/* 加载骨架 */}
              {!imgLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 animate-pulse" />
              )}
              
              {/* 主图 */}
              <img
                src={user.photos[currentPhoto]}
                alt={user.cnName}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
                onLoad={() => setImgLoaded(true)}
              />

              {/* 照片切换 - 左右箭头 */}
              {user.photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white/80 hover:text-white transition-all hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* 照片缩略图导航 */}
              {user.photos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-full bg-black/40 backdrop-blur-sm">
                  {user.photos.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setImgLoaded(false)
                        setCurrentPhoto(i)
                      }}
                      className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${
                        i === currentPhoto 
                          ? 'border-white scale-110' 
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* 照片计数 */}
              {user.photos.length > 1 && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white/80 text-xs">
                  {currentPhoto + 1} / {user.photos.length}
                </div>
              )}
            </div>

            {/* 右侧 - 信息区 */}
            <div className="sm:w-1/2 p-6 sm:p-8 flex flex-col">
              {/* 头部信息 */}
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {user.cnName}
                </h2>
                <div className="flex items-center gap-2 text-white/60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="text-sm">
                    {[user.location.city, user.location.province, user.location.country]
                      .filter(v => v && v !== '未知')
                      .join(' · ') || '中国'}
                  </span>
                </div>
              </div>

              {/* 自我介绍 */}
              <div className="flex-1 mb-6">
                <h3 className="text-xs uppercase tracking-wider text-white/40 mb-3">关于</h3>
                <p className="text-white/80 leading-relaxed">
                  {user.introduction}
                </p>
              </div>

              {/* 分享区域 */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-white/40">分享</h3>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => shareToQQ(user)}
                    className="flex-1 py-3 rounded-xl bg-[#12B7F5] hover:bg-[#0ea5e9] text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-[#12B7F5]/20 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.003 2c-5.523 0-9.997 4.477-9.997 10 0 2.386.832 4.577 2.222 6.298-.176.91-.65 2.702-1.228 3.702 0 0 2.877-.63 4.447-1.58.89.25 1.83.38 2.803.38h.003c5.523 0 9.997-4.477 9.997-10s-4.474-10-9.997-10h-.25z"/>
                    </svg>
                    QQ
                  </button>
                  <button
                    onClick={() => shareToQzone(user)}
                    className="flex-1 py-3 rounded-xl bg-[#FECE00] hover:bg-[#eab308] text-slate-900 text-sm font-medium transition-all hover:shadow-lg hover:shadow-[#FECE00]/20 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    空间
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        已复制
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        复制
                      </>
                    )}
                  </button>
                </div>

                {/* 查看主页按钮 */}
                <a
                  href={`/profile/${user.shareCode}`}
                  target="_blank"
                  className="block w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-purple-500/30 text-center"
                >
                  查看完整主页 →
                </a>

                {/* AI聊天按钮 */}
                <button
                  onClick={() => setShowChat(true)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-cyan-500/30 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  和 TA 聊天 ✨
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 装饰元素 */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
      </div>

      {/* AI聊天模态框 */}
      {showChat && (
        <AIChatModal user={user} onClose={() => setShowChat(false)} />
      )}
    </div>
  )
}
