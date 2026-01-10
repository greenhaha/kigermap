'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UserMenu() {
  const { data: session, status, update } = useSession()
  const [showMenu, setShowMenu] = useState(false)
  const [profileData, setProfileData] = useState<{ hasProfile: boolean; shareCode: string | null }>({ hasProfile: false, shareCode: null })
  const router = useRouter()

  const user = session?.user as any

  // 获取最新的 profile 信息
  useEffect(() => {
    if (session?.user) {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data.profile) {
            setProfileData({ hasProfile: true, shareCode: data.profile.shareCode })
          } else {
            setProfileData({ hasProfile: false, shareCode: null })
          }
        })
        .catch(console.error)
    }
  }, [session?.user])

  if (status === 'loading') {
    return (
      <div className="w-10 h-10 rounded-full glass animate-pulse" />
    )
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 glass hover:bg-white/10 rounded-xl text-sm font-medium transition"
      >
        登录
      </Link>
    )
  }

  const handleProfileClick = () => {
    setShowMenu(false)
    if (profileData.shareCode) {
      router.push(`/profile/${profileData.shareCode}`)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 glass hover:bg-white/10 rounded-xl transition"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm">
          {user.email?.[0]?.toUpperCase() || '?'}
        </div>
        <svg className={`w-4 h-4 transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 glass-dark rounded-xl overflow-hidden z-50 animate-fade-in">
            <div className="p-3 border-b border-white/10">
              <p className="text-sm text-white/50">登录账户</p>
              <p className="text-sm text-white truncate">{user.email}</p>
            </div>
            
            <div className="p-2">
              {/* 移动端导航链接 */}
              <div className="sm:hidden border-b border-white/10 pb-2 mb-2">
                <Link
                  href="/events"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  onClick={() => setShowMenu(false)}
                >
                  <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>聚会活动</span>
                </Link>
                <Link
                  href="/feedback"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition"
                  onClick={() => setShowMenu(false)}
                >
                  <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span>问题反馈</span>
                </Link>
              </div>

              {profileData.hasProfile && profileData.shareCode ? (
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition text-left"
                >
                  <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>我的主页</span>
                </button>
              ) : null}
              
              <Link
                href="/edit-profile"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition"
                onClick={() => setShowMenu(false)}
              >
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>{profileData.hasProfile ? '编辑资料' : '创建资料'}</span>
              </Link>
              
              <button
                onClick={() => {
                  signOut({ callbackUrl: '/' })
                  setShowMenu(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition text-left text-red-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
