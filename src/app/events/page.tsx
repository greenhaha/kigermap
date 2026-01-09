'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useI18n } from '@/components/I18nProvider'
import { Locale, locales, localeNames } from '@/lib/i18n'

// 聚会状态类型
type EventStatus = 'upcoming' | 'ongoing' | 'ended'

// 聚会数据（多语言）
const eventsData = [
  {
    id: 'okr-1',
    title: { zh: '偶壳 OKR 1.0', en: 'OKR 1.0', ja: '偶壳 OKR 1.0' },
    subtitle: { zh: 'Kigurumi Gathering', en: 'Kigurumi Gathering', ja: 'Kigurumi Gathering' },
    startDate: '2026-05-02',
    endDate: '2026-05-03',
    displayDate: '2026.05.02 - 05.03',
    location: { zh: '沈阳', en: 'Shenyang', ja: '瀋陽' },
    description: {
      zh: '一场以交流、氛围与体验为核心的 Kigurumi 聚会',
      en: 'A Kigurumi gathering focused on connection, atmosphere, and experience',
      ja: '交流、雰囲気、体験を重視した着ぐるみの集い',
    },
  },
]

// 获取活动状态
function getEventStatus(startDate: string, endDate: string): EventStatus {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  if (now < start) return 'upcoming'
  if (now > end) return 'ended'
  return 'ongoing'
}

const INITIAL_COUNT = 3

export default function EventsPage() {
  const { locale, setLocale, t } = useI18n()

  // 状态配置
  const statusConfig: Record<EventStatus, { label: string; className: string }> = {
    upcoming: { label: t('events.status.upcoming'), className: 'status-upcoming' },
    ongoing: { label: t('events.status.ongoing'), className: 'status-ongoing' },
    ended: { label: t('events.status.ended'), className: 'status-ended' },
  }

  // 按时间排序并添加状态
  const sortedEvents = useMemo(() => {
    return [...eventsData]
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .map(event => ({
        ...event,
        status: getEventStatus(event.startDate, event.endDate),
      }))
  }, [])

  return (
    <div className="events-page">
      {/* 导航 */}
      <nav className="events-nav">
        <Link href="/" className="nav-logo">Kigurumi Map</Link>
        <div className="nav-right">
          <div className="nav-links">
            <Link href="/events" className="nav-link active">{t('events.nav.events')}</Link>
            <Link href="/" className="nav-link">{t('events.nav.map')}</Link>
          </div>
          {/* 语言切换 */}
          <div className="lang-switcher">
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={`lang-btn ${locale === l ? 'active' : ''}`}
              >
                {localeNames[l]}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="events-main">
        <div className="events-container">
          {/* 标题区 */}
          <header className="events-header">
            <span className="header-label">{t('events.label')}</span>
            <h1 className="header-title">{t('events.title')}</h1>
            <p className="header-subtitle">{t('events.subtitle')}</p>
          </header>

          {/* 活动列表 */}
          <div className="events-grid">
            {sortedEvents.map((event, index) => (
              <Link 
                href={`/events/${event.id}`} 
                key={event.id}
                className="event-card"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="card-image">
                  <div className="image-placeholder">
                    <span>{event.title[locale].charAt(0)}</span>
                  </div>
                  <span className={`card-status ${statusConfig[event.status].className}`}>
                    {statusConfig[event.status].label}
                  </span>
                </div>
                <div className="card-content">
                  <div className="card-meta">
                    <span className="card-date">{event.displayDate}</span>
                    <span className="card-dot">·</span>
                    <span className="card-location">{event.location[locale]}</span>
                  </div>
                  <h2 className="card-title">{event.title[locale]}</h2>
                  <p className="card-subtitle">{event.subtitle[locale]}</p>
                  <p className="card-desc">{event.description[locale]}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="events-footer">
        <p>{t('events.copyright')}</p>
      </footer>

      <style jsx>{`
        .events-page {
          min-height: 100vh;
          background: #FAFAF9;
          color: #1C1917;
          font-family: 'Inter', -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* 导航 */
        .events-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          z-index: 100;
          background: rgba(250, 250, 249, 0.85);
          backdrop-filter: blur(20px);
        }

        .nav-logo {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #44403C;
          text-decoration: none;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-links {
          display: flex;
          gap: 28px;
        }

        .nav-link {
          font-size: 12px;
          color: #78716C;
          text-decoration: none;
          transition: color 0.3s;
        }

        .nav-link:hover,
        .nav-link.active {
          color: #1C1917;
        }

        /* 语言切换 */
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

        .lang-btn:hover {
          color: #44403C;
        }

        .lang-btn.active {
          background: #FFFFFF;
          color: #1C1917;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        /* 主内容 */
        .events-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 100px 40px 40px;
        }

        .events-container {
          width: 100%;
          max-width: 1200px;
        }

        /* 标题区 */
        .events-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .header-label {
          display: inline-block;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #A8A29E;
          margin-bottom: 16px;
        }

        .header-title {
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 300;
          letter-spacing: -0.02em;
          color: #1C1917;
          margin: 0 0 12px;
          font-family: 'Playfair Display', Georgia, serif;
        }

        .header-subtitle {
          font-size: 14px;
          color: #78716C;
          font-weight: 300;
          margin: 0;
        }

        /* 活动网格 */
        .events-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        /* 卡片 */
        .event-card {
          display: block;
          text-decoration: none;
          color: inherit;
          background: #FFFFFF;
          border-radius: 2px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .event-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.08);
        }

        .card-image {
          position: relative;
          aspect-ratio: 16/9;
          overflow: hidden;
          background: #F5F5F4;
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #E7E5E4 0%, #D6D3D1 100%);
        }

        .image-placeholder span {
          font-size: 36px;
          font-weight: 200;
          color: #A8A29E;
          font-family: 'Playfair Display', Georgia, serif;
        }

        /* 状态标签 */
        .card-status {
          position: absolute;
          top: 12px;
          left: 12px;
          font-size: 10px;
          letter-spacing: 0.08em;
          padding: 5px 10px;
          border-radius: 2px;
          font-weight: 500;
        }

        .status-upcoming {
          background: rgba(255, 255, 255, 0.95);
          color: #44403C;
        }

        .status-ongoing {
          background: #1C1917;
          color: #FAFAF9;
        }

        .status-ended {
          background: rgba(168, 162, 158, 0.9);
          color: #FAFAF9;
        }

        .card-content {
          padding: 20px;
        }

        .card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .card-date,
        .card-location {
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #A8A29E;
        }

        .card-dot {
          color: #D6D3D1;
          font-size: 10px;
        }

        .card-title {
          font-size: 18px;
          font-weight: 400;
          margin: 0 0 2px;
          color: #1C1917;
          font-family: 'Playfair Display', Georgia, serif;
        }

        .card-subtitle {
          font-size: 11px;
          color: #78716C;
          margin: 0 0 10px;
          font-weight: 300;
        }

        .card-desc {
          font-size: 13px;
          color: #57534E;
          line-height: 1.6;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* 加载更多 */
        .load-more-wrapper {
          display: flex;
          justify-content: center;
          margin-top: 40px;
        }

        .load-more-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #44403C;
          background: transparent;
          border: 1px solid #D6D3D1;
          cursor: pointer;
          transition: all 0.3s;
        }

        .load-more-btn:hover {
          background: #1C1917;
          border-color: #1C1917;
          color: #FFFFFF;
        }

        /* Footer */
        .events-footer {
          padding: 24px 40px;
          text-align: center;
          border-top: 1px solid #E7E5E4;
        }

        .events-footer p {
          font-size: 11px;
          color: #A8A29E;
          margin: 0;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 响应式 */
        @media (max-width: 1024px) {
          .events-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .events-nav {
            padding: 16px 20px;
          }

          .nav-right {
            gap: 16px;
          }

          .nav-links {
            display: none;
          }

          .lang-switcher {
            padding: 3px;
          }

          .lang-btn {
            padding: 5px 8px;
            font-size: 10px;
          }

          .events-main {
            padding: 80px 20px 24px;
            align-items: flex-start;
          }

          .events-header {
            margin-bottom: 32px;
          }

          .events-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .card-content {
            padding: 16px;
          }

          .load-more-wrapper {
            margin-top: 24px;
          }

          .events-footer {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  )
}
