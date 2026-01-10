'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { KigurumiUser } from '@/types'
import RegionFilter from '@/components/RegionFilter'
import UserMenu from '@/components/UserMenu'
import QuickProfileForm from '@/components/QuickProfileForm'
import type { Locale } from '@/lib/i18n'
import { getBrowserLocale } from '@/lib/i18n'

const Map = dynamic(() => import('@/components/Map'), { ssr: false })

const PAGE_SIZE = 20

// 辅助函数：获取显示用的位置文本，过滤掉"未知"
function getDisplayLocation(location: { province?: string; country?: string; city?: string }): string {
  const province = location.province && location.province !== '未知' ? location.province : ''
  const country = location.country && location.country !== '未知' ? location.country : ''
  return province || country || '中国'
}

export default function HomePage() {
  const { data: session, update: updateSession } = useSession()
  const [locale, setLocale] = useState<Locale>('zh')
  const [users, setUsers] = useState<KigurumiUser[]>([])
  
  // 客户端获取语言设置
  useEffect(() => {
    const stored = localStorage.getItem('kigurumi-map-locale') as Locale | null
    if (stored && ['zh', 'en', 'ja'].includes(stored)) {
      setLocale(stored)
    } else {
      setLocale(getBrowserLocale())
    }
  }, [])
  const [filteredUsers, setFilteredUsers] = useState<KigurumiUser[]>([])
  const [selectedUser, setSelectedUser] = useState<KigurumiUser | null>(null)
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const [showQuickForm, setShowQuickForm] = useState(false)
  const [showMemberList, setShowMemberList] = useState(false)
  const [stats, setStats] = useState<{ country: string; province?: string; count: number }[]>([])
  const [currentFilter, setCurrentFilter] = useState<{ country: string | null; province: string | null }>({ country: null, province: null })
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<KigurumiUser[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false)

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/stats'),
      ])
      if (usersRes.ok) {
        const { users: data } = await usersRes.json()
        const newUsers = data || []
        setUsers(newUsers)
        
        // 保持当前筛选状态
        if (currentFilter.country || currentFilter.province) {
          let filtered = newUsers
          if (currentFilter.country) filtered = filtered.filter((u: KigurumiUser) => u.location.country === currentFilter.country)
          if (currentFilter.province) filtered = filtered.filter((u: KigurumiUser) => u.location.province === currentFilter.province)
          setFilteredUsers(filtered)
        } else {
          setFilteredUsers(newUsers)
        }
      }
      if (statsRes.ok) {
        const { stats: data } = await statsRes.json()
        setStats(data || [])
      }
    } catch (err) {
      console.error('加载数据失败:', err)
    }
  }

  useEffect(() => {
    fetchData()
    
    // 每10秒自动刷新数据
    const interval = setInterval(() => {
      fetchData()
    }, 10000)
    
    return () => clearInterval(interval)
  }, [])

  const isNewMember = (user: KigurumiUser) => {
    if (!user.createdAt) return false
    // 加入超过1天则不再显示新人标志
    return new Date(user.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
  }

  const visibleUsers = useMemo(() => {
    return filteredUsers.slice(0, visibleCount)
  }, [filteredUsers, visibleCount])

  const hasMore = visibleCount < filteredUsers.length

  const handleFilter = (country: string | null, province: string | null, shouldClose?: boolean) => {
    let filtered = users
    // 现在只按省份/地区筛选
    if (province) {
      filtered = filtered.filter(u => u.location.province === province || u.location.country === province)
    }
    setFilteredUsers(filtered)
    setCurrentFilter({ country: null, province })
    setVisibleCount(PAGE_SIZE)
    if (shouldClose) {
      setShowMobileFilter(false)
    }
  }

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + PAGE_SIZE)
  }

  const handleClearFilter = () => {
    setFilteredUsers(users)
    setCurrentFilter({ country: null, province: null })
    setVisibleCount(PAGE_SIZE)
  }

  // 搜索功能
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = users.filter(u => 
        u.cnName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(results)
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [searchQuery, users])

  const handleSearchSelect = (user: KigurumiUser) => {
    setSelectedUser(user)
    setSearchQuery('')
    setShowSearchResults(false)
  }

  const handleProfileSuccess = async () => {
    fetchData()
    // 刷新 session 以获取最新的 shareCode
    await updateSession()
  }

  const handleUserSelect = (user: KigurumiUser) => {
    setSelectedUser(user)
    setShowMemberList(false)
  }

  const handleClearSelection = () => {
    setSelectedUser(null)
  }

  const sessionUser = session?.user as any
  const hasProfile = sessionUser?.hasProfile

  const filterText = currentFilter.province || null

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      <div className="bg-animated" />

      {/* Header */}
      <header className="glass-dark z-50 border-b border-white/5 flex-shrink-0">
        <div className="px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-base sm:text-lg">
                🎭
              </div>
              <h1 className="text-base sm:text-lg font-bold text-gradient leading-tight">Kigurumi Map</h1>
              {/* 注册人数 */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 glass rounded-lg">
                <span className="text-sm font-semibold text-gradient">{users.length}</span>
                <span className="text-xs text-white/50">位成员</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* 移动端显示人数 */}
              <div className="sm:hidden flex items-center gap-1 px-2 py-1 glass rounded-lg">
                <span className="text-xs font-semibold text-gradient">{users.length}</span>
                <span className="text-[10px] text-white/50">人</span>
              </div>
              {/* 聚会活动 */}
              <Link href="/events" className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 glass rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition text-xs">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>聚会</span>
              </Link>
              {/* 问题反馈 */}
              <Link href="/feedback" className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 glass rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition text-xs">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>反馈</span>
              </Link>
              <UserMenu />
              {session ? (
                hasProfile ? (
                  <Link href="/edit-profile" className="btn-gradient px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium text-white text-xs sm:text-sm">
                    编辑
                  </Link>
                ) : (
                  <button onClick={() => setShowQuickForm(true)} className="btn-gradient px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium text-white text-xs sm:text-sm">
                    加入
                  </button>
                )
              ) : (
                <button onClick={() => setShowQuickForm(true)} className="btn-gradient px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-medium text-white text-xs sm:text-sm">
                  加入
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
        {/* Left Sidebar */}
        <aside className={`hidden lg:flex flex-col border-r border-white/5 glass-dark flex-shrink-0 transition-all duration-300 relative z-30 ${leftSidebarCollapsed ? 'w-14' : 'w-64 xl:w-72'}`}>
          {/* 收起/展开按钮 */}
          <button
            onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-40 w-6 h-16 bg-gradient-to-r from-primary/80 to-secondary/80 hover:from-primary hover:to-secondary rounded-r-full flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-all hover:w-7"
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${leftSidebarCollapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {!leftSidebarCollapsed ? (
            <>
              <div className="p-4 border-b border-white/5">
                <div className="glass rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-gradient">{users.length}</div>
                  <div className="text-xs text-white/50">位成员</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <RegionFilter onFilter={handleFilter} stats={stats} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-4 gap-3 h-full">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-sm font-bold text-gradient">{users.length}</span>
              </div>
              <div className="flex-1 flex items-center">
                <span className="text-xs text-white/50 writing-vertical tracking-wider">筛选地区</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          )}
        </aside>

        {/* Map */}
        <div className="flex-1 relative">
          <Map users={filteredUsers} onUserClick={handleUserSelect} selectedUser={selectedUser} searchQuery={searchQuery} locale={locale} />

          {/* 搜索框 */}
          <div className="absolute top-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-72 z-[25]">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索 CN 名称..."
                className="w-full px-4 py-2.5 pl-10 glass-dark rounded-xl text-white placeholder-white/40 outline-none text-sm border border-white/10 focus:border-primary/50"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* 搜索结果下拉 */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-dark rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                {searchResults.slice(0, 10).map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSearchSelect(user)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition text-left"
                  >
                    <img src={user.photos[0]} alt={user.cnName} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.cnName}</p>
                      <p className="text-xs text-white/50 truncate">📍 {getDisplayLocation(user.location)}</p>
                    </div>
                  </button>
                ))}
                {searchResults.length > 10 && (
                  <div className="p-2 text-center text-xs text-white/40">
                    还有 {searchResults.length - 10} 个结果...
                  </div>
                )}
              </div>
            )}
            {showSearchResults && searchQuery && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-dark rounded-xl p-4 text-center text-sm text-white/50">
                未找到 "{searchQuery}"
              </div>
            )}
          </div>

          {selectedUser && (
            <div className="absolute top-16 sm:top-3 left-3 z-[25] animate-fade-in">
              <div className="glass-dark rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg max-w-[200px]">
                <img src={selectedUser.photos[0]} alt={selectedUser.cnName} className="w-8 h-8 rounded-lg object-cover border-2 border-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedUser.cnName}</p>
                  <p className="text-[10px] text-white/50 truncate">{getDisplayLocation(selectedUser.location)}</p>
                </div>
                <button onClick={handleClearSelection} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Mobile Buttons */}
          <div className="lg:hidden absolute bottom-4 left-3 right-3 flex gap-2 z-[30]">
            <button onClick={() => setShowMobileFilter(true)} className={`glass-dark px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg ${filterText ? 'ring-1 ring-primary' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {filterText || '筛选'}
            </button>
            <button onClick={() => setShowMemberList(true)} className="glass-dark px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              成员 ({filteredUsers.length})
            </button>
            {!hasProfile && (
              <button onClick={() => setShowQuickForm(true)} className="flex-1 btn-gradient py-2.5 rounded-xl text-sm font-medium shadow-lg flex items-center justify-center gap-1">
                <span>🎭</span>
                <span>加入地图</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className={`hidden lg:flex flex-col border-l border-white/5 glass-dark flex-shrink-0 transition-all duration-300 relative z-30 ${rightSidebarCollapsed ? 'w-14' : 'w-80 xl:w-96'}`}>
          {/* 收起/展开按钮 */}
          <button
            onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-40 w-6 h-16 bg-gradient-to-l from-primary/80 to-secondary/80 hover:from-primary hover:to-secondary rounded-l-full flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-all hover:w-7"
          >
            <svg className={`w-4 h-4 transition-transform duration-300 ${rightSidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {!rightSidebarCollapsed ? (
            <>
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-white/90">
                    成员<span className="text-white/40 font-normal ml-1.5 text-sm">({filteredUsers.length})</span>
                  </h2>
                  {!hasProfile && (
                    <button onClick={() => setShowQuickForm(true)} className="text-xs text-primary hover:underline">+ 加入</button>
                  )}
                </div>
                {filterText && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-lg bg-primary/20 text-primary flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {filterText}
                    </span>
                    <button onClick={handleClearFilter} className="text-xs text-white/50 hover:text-white transition">清除</button>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-3xl mb-3">🎭</div>
                    <p className="text-white/50 text-sm mb-2">{filterText ? `${filterText}暂无成员` : '暂无成员'}</p>
                    {filterText ? (
                      <button onClick={handleClearFilter} className="px-4 py-2 glass rounded-lg text-xs hover:bg-white/10 transition">查看全部</button>
                    ) : (
                      <button onClick={() => setShowQuickForm(true)} className="px-4 py-2 btn-gradient rounded-lg text-xs">成为第一个</button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-white/5">
                      {visibleUsers.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => handleUserSelect(u)}
                          className={`w-full p-3 flex items-center gap-3 transition text-left ${selectedUser?.id === u.id ? 'bg-primary/20 border-l-2 border-primary' : 'hover:bg-white/5'}`}
                        >
                          <div className="relative flex-shrink-0">
                            <img src={u.photos[0]} alt={u.cnName} className={`w-12 h-12 rounded-xl object-cover transition ${selectedUser?.id === u.id ? 'ring-2 ring-primary' : ''}`} loading="lazy" />
                            {isNewMember(u) && (
                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse">
                                <span className="text-[8px] font-bold text-white">N</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium text-sm truncate">{u.cnName}</p>
                              {isNewMember(u) && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-400 font-medium flex-shrink-0">新人</span>
                              )}
                            </div>
                            <p className="text-xs text-white/50 truncate">📍 {getDisplayLocation(u.location)}</p>
                          </div>
                          {selectedUser?.id === u.id && <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                    {hasMore && (
                      <div className="p-4">
                        <button onClick={handleLoadMore} className="w-full py-2.5 glass rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          加载更多 ({filteredUsers.length - visibleCount} 位)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-4 gap-3 h-full">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-sm font-bold text-gradient">{filteredUsers.length}</span>
              </div>
              <div className="flex-1 flex items-center">
                <span className="text-xs text-white/50 writing-vertical tracking-wider">成员列表</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          )}
        </aside>
      </main>

      {/* Quick Form Modal */}
      {showQuickForm && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowQuickForm(false)}>
          <div onClick={e => e.stopPropagation()} className="animate-fade-in w-full">
            <QuickProfileForm onClose={() => setShowQuickForm(false)} onSuccess={handleProfileSuccess} />
          </div>
        </div>
      )}

      {/* Mobile Filter Modal */}
      {showMobileFilter && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-[100] lg:hidden" onClick={() => setShowMobileFilter(false)}>
          <div className="absolute bottom-0 left-0 right-0 glass-dark rounded-t-2xl max-h-[75vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>
            <div className="px-4 pb-2 flex justify-between items-center">
              <h3 className="text-base font-bold">筛选地区</h3>
              <button onClick={() => setShowMobileFilter(false)} className="w-8 h-8 rounded-full glass flex items-center justify-center text-sm">✕</button>
            </div>
            <div className="px-4 pb-3">
              <div className="glass rounded-xl p-2.5 text-center">
                <div className="text-lg font-bold text-gradient">{users.length}</div>
                <div className="text-[10px] text-white/50">位成员</div>
              </div>
            </div>
            {filterText && (
              <div className="px-4 pb-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10">
                  <span className="text-sm text-primary flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    当前: {filterText}
                  </span>
                  <button onClick={() => { handleClearFilter(); setShowMobileFilter(false); }} className="text-xs text-white/60 hover:text-white px-2 py-1 rounded bg-white/10">清除</button>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              <RegionFilter onFilter={handleFilter} stats={stats} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Member List Modal */}
      {showMemberList && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-[100] lg:hidden" onClick={() => setShowMemberList(false)}>
          <div className="absolute bottom-0 left-0 right-0 glass-dark rounded-t-2xl max-h-[80vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>
            <div className="px-4 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold">
                  成员列表<span className="text-white/40 font-normal ml-1.5 text-sm">({filteredUsers.length})</span>
                </h3>
                {filterText && <p className="text-xs text-primary mt-0.5">📍 {filterText}</p>}
              </div>
              <button onClick={() => setShowMemberList(false)} className="w-8 h-8 rounded-full glass flex items-center justify-center text-sm">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto pb-6">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-3xl mb-3">🎭</div>
                  <p className="text-white/50 text-sm mb-4">{filterText ? `${filterText}暂无成员` : '暂无成员'}</p>
                  {filterText ? (
                    <button onClick={() => { handleClearFilter(); setShowMemberList(false); }} className="px-4 py-2 glass rounded-lg text-xs">查看全部成员</button>
                  ) : (
                    <button onClick={() => { setShowMemberList(false); setShowQuickForm(true); }} className="px-4 py-2 btn-gradient rounded-lg text-xs">成为第一个</button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-4">
                    {visibleUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleUserSelect(u)}
                        className={`glass rounded-xl overflow-hidden text-left transition ${selectedUser?.id === u.id ? 'ring-2 ring-primary' : ''}`}
                      >
                        <div className="relative aspect-[4/5]">
                          <img src={u.photos[0]} alt={u.cnName} className="w-full h-full object-cover" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-2.5">
                            <p className="font-medium text-sm leading-tight">{u.cnName}</p>
                            <p className="text-[10px] text-white/60 mt-0.5">📍 {getDisplayLocation(u.location)}</p>
                          </div>
                          {isNewMember(u) && (
                            <span className="absolute top-2 left-2 px-1.5 py-0.5 text-[9px] font-bold bg-gradient-to-r from-pink-500 to-orange-400 rounded-full text-white">NEW</span>
                          )}
                          {selectedUser?.id === u.id && <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary animate-pulse" />}
                        </div>
                      </button>
                    ))}
                  </div>
                  {hasMore && (
                    <div className="px-4 pt-4">
                      <button onClick={handleLoadMore} className="w-full py-3 glass rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        加载更多 ({filteredUsers.length - visibleCount} 位)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
