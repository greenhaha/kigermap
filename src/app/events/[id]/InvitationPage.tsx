'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/components/I18nProvider'
import { Locale, locales, localeNames } from '@/lib/i18n'

type LocaleText = Record<Locale, string>

interface InvitationData {
  title: LocaleText
  subtitle: LocaleText
  date: string
  dateDisplay: LocaleText
  location: LocaleText
  venue: LocaleText
  audience: LocaleText
  message: LocaleText
  organizer: LocaleText
}

const invitationData: Record<string, InvitationData> = {
  'okr-1': {
    title: { zh: '偶壳 OKR 1.0', en: 'OKR 1.0', ja: '偶壳 OKR 1.0' },
    subtitle: { zh: 'Kigurumi Gathering', en: 'Kigurumi Gathering', ja: 'Kigurumi Gathering' },
    date: '2026.05.02 - 05.03',
    dateDisplay: { zh: '2026年5月2日 - 3日', en: 'May 2-3, 2026', ja: '2026年5月2日〜3日' },
    location: { zh: '沈阳', en: 'Shenyang, China', ja: '瀋陽' },
    venue: { zh: '即将公布', en: 'To Be Announced', ja: '近日公開' },
    audience: {
      zh: 'Kigurumi 爱好者 · Doller · 摄影师 · 创作者',
      en: 'Kigurumi Enthusiasts · Dollers · Photographers · Creators',
      ja: '着ぐるみ愛好家 · ドーラー · フォトグラファー · クリエイター',
    },
    message: {
      zh: '诚挚邀请您参与这场以交流、氛围与体验为核心的 Kigurumi 聚会',
      en: 'You are cordially invited to a Kigurumi gathering focused on connection, atmosphere, and experience',
      ja: '交流、雰囲気、体験を重視した着ぐるみの集いへご招待いたします',
    },
    organizer: { zh: '鼠鼠工坊', en: 'Shushu Workshop', ja: 'シュシュ工房' },
  },
}

const sharePlatforms = [
  { id: 'weibo', name: '微博', icon: 'M', color: '#E6162D' },
  { id: 'qq', name: 'QQ空间', icon: 'Q', color: '#12B7F5' },
  { id: 'bilibili', name: 'B站', icon: 'B', color: '#00A1D6' },
  { id: 'xiaohongshu', name: '小红书', icon: '红', color: '#FE2C55' },
  { id: 'douyin', name: '抖音', icon: '抖', color: '#000000' },
  { id: 'copy', name: '复制链接', icon: '🔗', color: '#78716C' },
]

export default function InvitationPage({ eventId }: { eventId: string }) {
  const { locale, setLocale, t } = useI18n()
  const [showShare, setShowShare] = useState(false)
  const [copied, setCopied] = useState(false)
  const data = invitationData[eventId] || invitationData['okr-1']

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = `${data.title[locale]} - ${data.subtitle[locale]}`

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(shareTitle)
    const urls: Record<string, string> = {
      weibo: `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`,
      qq: `https://connect.qq.com/widget/shareqq/index.html?url=${encodedUrl}&title=${encodedTitle}`,
      bilibili: `https://www.bilibili.com/`,
      xiaohongshu: `https://www.xiaohongshu.com/`,
      douyin: `https://www.douyin.com/`,
    }
    if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return
    }
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=500')
    }
  }

  return (
    <div className="invitation-page">
      {/* 背景装饰 */}
      <div className="bg-decor">
        {/* 渐变光晕 */}
        <div className="bg-glow g1"></div>
        <div className="bg-glow g2"></div>
        <div className="bg-glow g3"></div>
        {/* 浮动粒子 */}
        <div className="particles">
          <span className="particle p1">✦</span>
          <span className="particle p2">◇</span>
          <span className="particle p3">✦</span>
          <span className="particle p4">◆</span>
          <span className="particle p5">✦</span>
          <span className="particle p6">◇</span>
          <span className="particle p7">✦</span>
          <span className="particle p8">◆</span>
        </div>
        {/* 装饰线条 */}
        <div className="bg-lines">
          <div className="line l1"></div>
          <div className="line l2"></div>
          <div className="line l3"></div>
        </div>
        {/* 点阵图案 */}
        <div className="bg-pattern"></div>
      </div>

      {/* 导航 */}
      <nav className="inv-nav">
        <Link href="/events" className="nav-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>{locale === 'zh' ? '返回' : locale === 'ja' ? '戻る' : 'Back'}</span>
        </Link>
        <div className="lang-switcher">
          {locales.map((l) => (
            <button key={l} onClick={() => setLocale(l)} className={`lang-btn ${locale === l ? 'active' : ''}`}>
              {localeNames[l]}
            </button>
          ))}
        </div>
      </nav>

      {/* 主内容 */}
      <main className="inv-main">
        {/* 邀请函卡片 */}
        <div className="invitation-card">
          {/* 顶部装饰 */}
          <div className="card-top-decor">
            <span className="decor-line"></span>
            <span className="decor-star">✦</span>
            <span className="decor-line"></span>
          </div>

          {/* 标签 */}
          <div className="inv-badge">INVITATION</div>

          {/* 标题区 */}
          <header className="inv-header">
            <h1 className="inv-title">{data.title[locale]}</h1>
            <p className="inv-subtitle">{data.subtitle[locale]}</p>
          </header>

          {/* 装饰分隔 */}
          <div className="inv-ornament">
            <span className="orn-wing">❧</span>
            <span className="orn-diamond">◆</span>
            <span className="orn-wing flip">❧</span>
          </div>

          {/* 邀请语 */}
          <p className="inv-message">{data.message[locale]}</p>

          {/* 日期突出显示 */}
          <div className="date-highlight">
            <div className="date-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
            </div>
            <div className="date-text">
              <span className="date-label">{locale === 'zh' ? '活动日期' : locale === 'ja' ? '開催日' : 'Event Date'}</span>
              <span className="date-value">{data.dateDisplay[locale]}</span>
            </div>
          </div>

          {/* 信息网格 */}
          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <span className="info-label">{locale === 'zh' ? '城市' : locale === 'ja' ? '都市' : 'City'}</span>
              <span className="info-value">{data.location[locale]}</span>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6"/>
                </svg>
              </div>
              <span className="info-label">{locale === 'zh' ? '地点' : locale === 'ja' ? '会場' : 'Venue'}</span>
              <span className="info-value highlight">{data.venue[locale]}</span>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <span className="info-label">{locale === 'zh' ? '面向人群' : locale === 'ja' ? '対象' : 'For'}</span>
              <span className="info-value small">{data.audience[locale]}</span>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="info-label">{locale === 'zh' ? '发起人' : locale === 'ja' ? '主催' : 'Organizer'}</span>
              <span className="info-value">{data.organizer[locale]}</span>
            </div>
          </div>

          {/* 底部装饰 */}
          <div className="card-bottom-decor">
            <span className="decor-dot"></span>
            <span className="decor-dot"></span>
            <span className="decor-dot"></span>
          </div>
        </div>

        {/* 底部提示 */}
        <p className="inv-note">
          ✦ {locale === 'zh' ? '更多详情即将公布，敬请期待' : locale === 'ja' ? '詳細は近日公開予定です' : 'More details coming soon'} ✦
        </p>

        {/* 分享按钮 */}
        <button className="share-btn" onClick={() => setShowShare(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
          </svg>
          <span>{locale === 'zh' ? '分享邀请函' : locale === 'ja' ? 'シェアする' : 'Share'}</span>
        </button>
      </main>

      {/* 分享弹窗 */}
      {showShare && (
        <div className="share-overlay" onClick={() => setShowShare(false)}>
          <div className="share-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowShare(false)}>×</button>
            <h3>{locale === 'zh' ? '分享到' : locale === 'ja' ? 'シェア' : 'Share to'}</h3>
            <div className="share-grid">
              {sharePlatforms.map(p => (
                <button key={p.id} className="share-item" onClick={() => handleShare(p.id)}>
                  <span className="share-icon" style={{ background: p.color }}>{p.icon}</span>
                  <span className="share-name">{p.name}</span>
                </button>
              ))}
            </div>
            {copied && <p className="copied-tip">{locale === 'zh' ? '链接已复制！' : 'Copied!'}</p>}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="inv-footer">
        <p>{t('events.copyright')}</p>
      </footer>

      <style jsx>{`
        .invitation-page {
          min-height: 100vh;
          background: #FAFAF9;
          color: #1C1917;
          font-family: 'Inter', -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
        }

        /* 背景装饰 */
        .bg-decor {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        
        /* 渐变光晕 */
        .bg-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
        }
        .bg-glow.g1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%);
          top: -200px;
          right: -150px;
          animation: glowFloat1 15s ease-in-out infinite;
        }
        .bg-glow.g2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(168,162,158,0.1) 0%, transparent 70%);
          bottom: -150px;
          left: -150px;
          animation: glowFloat2 18s ease-in-out infinite;
        }
        .bg-glow.g3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%);
          top: 50%;
          left: 10%;
          animation: glowFloat3 20s ease-in-out infinite;
        }
        @keyframes glowFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
          50% { transform: translate(-40px, 30px) scale(1.1); opacity: 1; }
        }
        @keyframes glowFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          50% { transform: translate(30px, -25px) scale(1.05); opacity: 0.9; }
        }
        @keyframes glowFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
          50% { transform: translate(20px, -30px) scale(1.15); opacity: 0.8; }
        }

        /* 浮动粒子 */
        .particles {
          position: absolute;
          inset: 0;
        }
        .particle {
          position: absolute;
          color: rgba(212,175,55,0.3);
          font-size: 12px;
          animation: particleFloat 12s ease-in-out infinite;
        }
        .particle.p1 { top: 15%; left: 10%; animation-delay: 0s; }
        .particle.p2 { top: 25%; right: 15%; animation-delay: 1.5s; font-size: 10px; }
        .particle.p3 { top: 45%; left: 5%; animation-delay: 3s; }
        .particle.p4 { top: 60%; right: 8%; animation-delay: 4.5s; font-size: 8px; }
        .particle.p5 { top: 75%; left: 15%; animation-delay: 6s; font-size: 14px; }
        .particle.p6 { top: 20%; left: 85%; animation-delay: 7.5s; }
        .particle.p7 { top: 80%; right: 20%; animation-delay: 9s; font-size: 10px; }
        .particle.p8 { top: 35%; left: 90%; animation-delay: 10.5s; font-size: 8px; }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          25% { transform: translateY(-15px) rotate(90deg); opacity: 0.6; }
          50% { transform: translateY(-5px) rotate(180deg); opacity: 0.4; }
          75% { transform: translateY(-20px) rotate(270deg); opacity: 0.7; }
        }

        /* 装饰线条 */
        .bg-lines {
          position: absolute;
          inset: 0;
        }
        .line {
          position: absolute;
          background: linear-gradient(90deg, transparent, rgba(212,175,55,0.1), transparent);
          height: 1px;
        }
        .line.l1 {
          width: 200px;
          top: 20%;
          left: -50px;
          animation: lineSlide 8s ease-in-out infinite;
        }
        .line.l2 {
          width: 150px;
          top: 60%;
          right: -30px;
          animation: lineSlide 10s ease-in-out infinite reverse;
        }
        .line.l3 {
          width: 180px;
          bottom: 25%;
          left: 20%;
          animation: lineSlide 12s ease-in-out infinite;
          animation-delay: 2s;
        }
        @keyframes lineSlide {
          0%, 100% { transform: translateX(0); opacity: 0.3; }
          50% { transform: translateX(100px); opacity: 0.6; }
        }

        /* 点阵图案 */
        .bg-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(168,162,158,0.12) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: patternPulse 8s ease-in-out infinite;
        }
        @keyframes patternPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.6; }
        }

        /* 导航 */
        .inv-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          padding: 20px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 100;
          background: rgba(250, 250, 249, 0.85);
          backdrop-filter: blur(20px);
        }
        .nav-back {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #78716C;
          text-decoration: none;
          transition: color 0.3s;
        }
        .nav-back:hover { color: #1C1917; }
        .lang-switcher {
          display: flex;
          gap: 4px;
          padding: 4px;
          background: rgba(0, 0, 0, 0.04);
          border-radius: 6px;
        }
        .lang-btn {
          padding: 6px 12px;
          font-size: 11px;
          color: #78716C;
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .lang-btn:hover { color: #44403C; }
        .lang-btn.active {
          background: #FFFFFF;
          color: #1C1917;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        /* 主内容 */
        .inv-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 100px 24px 40px;
          position: relative;
          z-index: 1;
        }

        /* 邀请函卡片 */
        .invitation-card {
          width: 100%;
          max-width: 520px;
          background: #FFFFFF;
          border: 1px solid #E7E5E4;
          padding: 40px 36px;
          position: relative;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
          animation: cardIn 0.8s ease-out;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* 卡片顶部装饰 */
        .card-top-decor {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .decor-line {
          width: 40px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #D4AF37, transparent);
        }
        .decor-star {
          color: #D4AF37;
          font-size: 12px;
        }

        /* 标签 */
        .inv-badge {
          text-align: center;
          font-size: 10px;
          letter-spacing: 0.4em;
          color: #A8A29E;
          margin-bottom: 20px;
        }

        /* 标题 */
        .inv-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .inv-title {
          font-size: clamp(28px, 5vw, 38px);
          font-weight: 300;
          letter-spacing: 0.02em;
          margin: 0 0 6px;
          font-family: 'Playfair Display', Georgia, serif;
          color: #1C1917;
        }
        .inv-subtitle {
          font-size: 12px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #78716C;
          margin: 0;
        }

        /* 装饰分隔 */
        .inv-ornament {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 20px;
          color: #D4AF37;
          font-size: 14px;
        }
        .orn-diamond {
          font-size: 8px;
        }
        .orn-wing.flip {
          transform: scaleX(-1);
        }

        /* 邀请语 */
        .inv-message {
          text-align: center;
          font-size: 14px;
          line-height: 1.8;
          color: #57534E;
          margin: 0 0 28px;
          padding: 0 12px;
        }

        /* 日期突出 */
        .date-highlight {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 20px;
          background: linear-gradient(135deg, #FAFAF9 0%, #F5F5F4 100%);
          border: 1px solid #E7E5E4;
          margin-bottom: 24px;
        }
        .date-icon {
          color: #D4AF37;
        }
        .date-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .date-label {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #A8A29E;
        }
        .date-value {
          font-size: 18px;
          font-weight: 400;
          color: #1C1917;
          font-family: 'Playfair Display', Georgia, serif;
        }

        /* 信息网格 */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .info-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 16px 12px;
          background: #FAFAF9;
          border: 1px solid #F5F5F4;
          transition: all 0.3s;
        }
        .info-item:hover {
          border-color: #E7E5E4;
        }
        .info-icon {
          color: #A8A29E;
          margin-bottom: 8px;
        }
        .info-label {
          font-size: 9px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #A8A29E;
          margin-bottom: 4px;
        }
        .info-value {
          font-size: 14px;
          color: #1C1917;
        }
        .info-value.highlight {
          color: #D4AF37;
          font-style: italic;
        }
        .info-value.small {
          font-size: 11px;
          line-height: 1.5;
          color: #57534E;
        }

        /* 卡片底部装饰 */
        .card-bottom-decor {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }
        .decor-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #D6D3D1;
        }

        /* 底部提示 */
        .inv-note {
          margin-top: 28px;
          font-size: 12px;
          color: #A8A29E;
          letter-spacing: 0.05em;
          animation: fadeIn 0.8s ease-out 0.3s both;
        }

        /* 分享按钮 */
        .share-btn {
          margin-top: 20px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          font-size: 13px;
          letter-spacing: 0.05em;
          color: #FFFFFF;
          background: linear-gradient(135deg, #1C1917 0%, #44403C 100%);
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          animation: fadeIn 0.8s ease-out 0.4s both;
        }
        .share-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        /* 分享弹窗 */
        .share-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          animation: fadeIn 0.2s ease-out;
        }
        .share-modal {
          background: #FFFFFF;
          border: 1px solid #E7E5E4;
          padding: 32px;
          width: 90%;
          max-width: 360px;
          position: relative;
          animation: scaleIn 0.3s ease-out;
        }
        .modal-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          color: #A8A29E;
          font-size: 24px;
          cursor: pointer;
          transition: color 0.2s;
        }
        .modal-close:hover { color: #1C1917; }
        .share-modal h3 {
          font-size: 14px;
          font-weight: 400;
          color: #1C1917;
          margin: 0 0 24px;
          text-align: center;
        }
        .share-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .share-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .share-item:hover { transform: translateY(-2px); }
        .share-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 600;
          color: #FFFFFF;
        }
        .share-name {
          font-size: 11px;
          color: #78716C;
        }
        .copied-tip {
          text-align: center;
          font-size: 12px;
          color: #44403C;
          margin: 16px 0 0;
          padding: 8px;
          background: #F5F5F4;
        }

        /* Footer */
        .inv-footer {
          padding: 24px 40px;
          text-align: center;
          border-top: 1px solid #E7E5E4;
          position: relative;
          z-index: 1;
        }
        .inv-footer p {
          font-size: 11px;
          color: #A8A29E;
          margin: 0;
        }

        /* 动画 */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        /* 响应式 */
        @media (max-width: 560px) {
          .inv-nav { padding: 16px 20px; }
          .inv-main { padding: 90px 16px 32px; }
          .invitation-card { padding: 32px 20px; }
          .info-grid { grid-template-columns: 1fr; gap: 12px; }
          .date-highlight { flex-direction: column; text-align: center; }
          .lang-btn { padding: 5px 8px; font-size: 10px; }
          .inv-footer { padding: 20px; }
        }
      `}</style>
    </div>
  )
}
