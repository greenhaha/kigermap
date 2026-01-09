'use client'

import Link from 'next/link'
import { useI18n } from '@/components/I18nProvider'
import { Locale, locales, localeNames } from '@/lib/i18n'

type LocaleText = Record<Locale, string>

interface EventData {
  title: LocaleText
  subtitle: LocaleText
  tagline: LocaleText
  date: string
  dateRange: LocaleText
  venue: LocaleText
  area: string
  tickets: { type: LocaleText; price: string; desc?: LocaleText }[]
  hotel: { name: LocaleText; price: string; rooms: LocaleText; note: LocaleText }
  concept: { text: LocaleText }
  faq: { q: LocaleText; a: LocaleText }[]
}

const eventsData: Record<string, EventData> = {
  'okr-1': {
    title: { zh: '偶壳 OKR 1.0', en: 'OKR 1.0', ja: '偶壳 OKR 1.0' },
    subtitle: { zh: 'Kigurumi Gathering', en: 'Kigurumi Gathering', ja: 'Kigurumi Gathering' },
    tagline: {
      zh: '一场以交流、氛围与体验为核心的 Kigurumi 聚会',
      en: 'A Kigurumi gathering focused on connection, atmosphere, and experience',
      ja: '交流、雰囲気、体験を重視した着ぐるみの集い',
    },
    date: '5.2 – 5.3',
    dateRange: { zh: '2026年5月2日 – 5月3日', en: 'May 2–3, 2026', ja: '2026年5月2日〜3日' },
    venue: { zh: '沈阳绿地铂瑞酒店', en: 'Shenyang Greenland Primus Hotel', ja: '瀋陽グリーンランドプリムスホテル' },
    area: '1500㎡',
    tickets: [
      { type: { zh: '单日票', en: 'Day Pass', ja: '1日券' }, price: '¥138', desc: { zh: '单日入场', en: 'Single day entry', ja: '1日入場' } },
      { type: { zh: '双日票', en: '2-Day Pass', ja: '2日券' }, price: '¥198', desc: { zh: '两日通票', en: 'Full event access', ja: '2日間通し券' } },
    ],
    hotel: {
      name: { zh: '沈阳绿地铂瑞酒店', en: 'Greenland Primus Hotel', ja: 'グリーンランドプリムスホテル' },
      price: '¥398',
      rooms: { zh: '大床 / 双床 同价', en: 'King / Twin - Same price', ja: 'キング/ツイン 同価格' },
      note: { zh: '为活动参与者提供便捷、舒适的官方入住选择', en: 'Official accommodation for event participants', ja: '参加者のための公式宿泊施設' },
    },
    concept: {
      text: {
        zh: '偶壳 OKR 1.0 是一场参考国际 Doll Event 氛围打造的 Kigurumi 聚会，注重交流体验、空间氛围与参与者之间的连接。',
        en: 'OKR 1.0 is a Kigurumi gathering inspired by international Doll Events, emphasizing connection and atmosphere.',
        ja: '偶壳 OKR 1.0は、国際的なドールイベントの雰囲気を参考にした着ぐるみの集いです。',
      },
    },
    faq: [
      { q: { zh: '是否欢迎第一次参加的用户？', en: 'Are first-time attendees welcome?', ja: '初めての参加者も歓迎ですか？' }, a: { zh: '欢迎新手与有经验的参与者一同参与。', en: 'Both newcomers and experienced participants are welcome.', ja: '初心者も経験者も歓迎です。' } },
      { q: { zh: '是否允许摄影？', en: 'Is photography allowed?', ja: '撮影は可能ですか？' }, a: { zh: '指定区域内可进行摄影。', en: 'Photography is allowed in designated areas.', ja: '指定エリア内での撮影が可能です。' } },
      { q: { zh: '是否有着装要求？', en: 'Is there a dress code?', ja: 'ドレスコードはありますか？' }, a: { zh: 'Kigurumi 或日常服装均可。', en: 'Kigurumi or casual attire is acceptable.', ja: '着ぐるみまたはカジュアルな服装でお越しください。' } },
    ],
  },
}

const defaultEvent = eventsData['okr-1']

export default function DetailPage({ eventId }: { eventId: string }) {
  const { locale, setLocale, t } = useI18n()
  const event = eventsData[eventId] || defaultEvent

  return (
    <div className="event-detail-page">
      <nav className="detail-nav">
        <Link href="/events" className="nav-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>{t('events.backToEvents')}</span>
        </Link>
        <div className="lang-switcher">
          {locales.map((l) => (
            <button key={l} onClick={() => setLocale(l)} className={`lang-btn ${locale === l ? 'active' : ''}`}>
              {localeNames[l]}
            </button>
          ))}
        </div>
      </nav>

      <header className="detail-hero">
        <div className="hero-pattern" />
        <div className="hero-content">
          <h1 className="hero-title">{event.title[locale]}</h1>
          <p className="hero-subtitle">{event.subtitle[locale]}</p>
          <p className="hero-tagline">{event.tagline[locale]}</p>
          <div className="hero-meta">
            <div className="meta-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              <span>{event.date}</span>
            </div>
            <div className="meta-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{event.venue[locale]}</span>
            </div>
            <div className="meta-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
              <span>{event.area}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="detail-main">
        <section className="section">
          <h2 className="section-title">{t('events.section.info')}</h2>
          <div className="info-grid">
            <div className="info-card">
              <span className="info-label">{t('events.info.time')}</span>
              <span className="info-value">{event.dateRange[locale]}</span>
            </div>
            <div className="info-card">
              <span className="info-label">{t('events.info.location')}</span>
              <span className="info-value">{event.venue[locale]}</span>
            </div>
            <div className="info-card">
              <span className="info-label">{t('events.info.area')}</span>
              <span className="info-value">{event.area}</span>
            </div>
            <div className="info-card">
              <span className="info-label">{t('events.info.audience')}</span>
              <span className="info-value">{t('events.info.audienceDesc')}</span>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">{t('events.section.tickets')}</h2>
          <div className="tickets-grid">
            {event.tickets.map((ticket, i) => (
              <div key={i} className="ticket-card">
                <span className="ticket-type">{ticket.type[locale]}</span>
                <span className="ticket-price">{ticket.price}</span>
                {ticket.desc && <span className="ticket-desc">{ticket.desc[locale]}</span>}
                <button className="ticket-btn">{t('events.ticket.select')}</button>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">{t('events.section.hotel')}</h2>
          <div className="hotel-card">
            <div className="hotel-image"><span>H</span></div>
            <div className="hotel-info">
              <h3 className="hotel-name">{event.hotel.name[locale]}</h3>
              <div className="hotel-price">
                <span className="price-num">{event.hotel.price}</span>
                <span className="price-unit">{t('events.hotel.perNight')}</span>
              </div>
              <p className="hotel-rooms">{event.hotel.rooms[locale]}</p>
              <p className="hotel-note">{event.hotel.note[locale]}</p>
              <button className="hotel-btn">{t('events.hotel.book')}</button>
            </div>
          </div>
        </section>

        <section className="section concept-section">
          <div className="concept-text">
            <h2 className="section-title">{t('events.section.concept')}</h2>
            <p>{event.concept.text[locale]}</p>
          </div>
          <div className="concept-image" />
        </section>

        <section className="section">
          <h2 className="section-title">{t('events.section.faq')}</h2>
          <div className="faq-list">
            {event.faq.map((item, i) => (
              <div key={i} className="faq-item">
                <h3>{item.q[locale]}</h3>
                <p>{item.a[locale]}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="detail-footer">
        <p className="footer-title">{event.title[locale]}</p>
        <p className="footer-copy">{t('events.copyright')}</p>
      </footer>

      <style jsx>{`
        .event-detail-page {
          min-height: 100vh;
          background: #FAFAF9;
          color: #1C1917;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        .detail-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          padding: 20px 48px;
          z-index: 100;
          background: rgba(250, 250, 249, 0.9);
          backdrop-filter: blur(20px);
          display: flex;
          justify-content: space-between;
          align-items: center;
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
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .detail-hero {
          position: relative;
          padding: 160px 48px 80px;
          text-align: center;
          overflow: hidden;
        }
        .hero-pattern {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(250, 250, 249, 0) 0%, rgba(250, 250, 249, 0.8) 100%),
            repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,0,0,0.01) 20px, rgba(0,0,0,0.01) 40px);
        }
        .hero-content {
          position: relative;
          max-width: 700px;
          margin: 0 auto;
        }
        .hero-title {
          font-size: clamp(36px, 6vw, 56px);
          font-weight: 300;
          letter-spacing: -0.02em;
          margin: 0 0 8px;
          font-family: 'Playfair Display', Georgia, serif;
          color: #1C1917;
        }
        .hero-subtitle {
          font-size: 14px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #78716C;
          margin: 0 0 20px;
        }
        .hero-tagline {
          font-size: 16px;
          color: #57534E;
          margin: 0 0 36px;
          line-height: 1.6;
        }
        .hero-meta {
          display: flex;
          justify-content: center;
          gap: 36px;
          flex-wrap: wrap;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #44403C;
        }
        .meta-item svg { color: #A8A29E; }
        .detail-main {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 48px 80px;
        }
        .section { margin-bottom: 72px; }
        .section-title {
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #A8A29E;
          margin: 0 0 24px;
          font-weight: 500;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .info-card {
          padding: 24px;
          background: #FFFFFF;
          border: 1px solid #E7E5E4;
        }
        .info-label {
          display: block;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #A8A29E;
          margin-bottom: 8px;
        }
        .info-value {
          font-size: 15px;
          color: #1C1917;
          line-height: 1.5;
        }
        .tickets-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .ticket-card {
          padding: 32px 24px;
          background: #FFFFFF;
          border: 1px solid #E7E5E4;
          text-align: center;
          transition: border-color 0.3s;
        }
        .ticket-card:hover { border-color: #44403C; }
        .ticket-type {
          display: block;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #78716C;
          margin-bottom: 12px;
        }
        .ticket-price {
          display: block;
          font-size: 32px;
          font-weight: 300;
          color: #1C1917;
          margin-bottom: 4px;
          font-family: 'Playfair Display', Georgia, serif;
        }
        .ticket-desc {
          display: block;
          font-size: 12px;
          color: #A8A29E;
          margin-bottom: 20px;
        }
        .ticket-btn {
          padding: 10px 24px;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #44403C;
          background: transparent;
          border: 1px solid #D6D3D1;
          cursor: pointer;
          transition: all 0.3s;
        }
        .ticket-btn:hover {
          background: #1C1917;
          border-color: #1C1917;
          color: #FFFFFF;
        }
        .hotel-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #FFFFFF;
          border: 1px solid #E7E5E4;
          overflow: hidden;
        }
        .hotel-image {
          aspect-ratio: 4/3;
          background: linear-gradient(135deg, #E7E5E4 0%, #D6D3D1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hotel-image span {
          font-size: 48px;
          font-weight: 200;
          color: #A8A29E;
          font-family: 'Playfair Display', Georgia, serif;
        }
        .hotel-info {
          padding: 32px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .hotel-name {
          font-size: 20px;
          font-weight: 400;
          margin: 0 0 12px;
          font-family: 'Playfair Display', Georgia, serif;
        }
        .hotel-price { margin-bottom: 4px; }
        .price-num {
          font-size: 24px;
          font-weight: 300;
          color: #1C1917;
        }
        .price-unit {
          font-size: 13px;
          color: #78716C;
          margin-left: 4px;
        }
        .hotel-rooms {
          font-size: 12px;
          color: #78716C;
          margin: 0 0 12px;
        }
        .hotel-note {
          font-size: 13px;
          color: #57534E;
          line-height: 1.6;
          margin: 0 0 20px;
        }
        .hotel-btn {
          align-self: flex-start;
          padding: 10px 24px;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #44403C;
          background: transparent;
          border: 1px solid #D6D3D1;
          cursor: pointer;
          transition: all 0.3s;
        }
        .hotel-btn:hover {
          background: #1C1917;
          border-color: #1C1917;
          color: #FFFFFF;
        }
        .concept-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }
        .concept-text p {
          font-size: 17px;
          line-height: 1.8;
          color: #44403C;
          font-weight: 300;
          margin: 0;
        }
        .concept-image {
          aspect-ratio: 4/3;
          background: linear-gradient(135deg, #E7E5E4 0%, #D6D3D1 100%);
        }
        .faq-list {
          border-top: 1px solid #E7E5E4;
        }
        .faq-item {
          padding: 24px 0;
          border-bottom: 1px solid #E7E5E4;
        }
        .faq-item h3 {
          font-size: 15px;
          font-weight: 400;
          margin: 0 0 8px;
          color: #1C1917;
        }
        .faq-item p {
          font-size: 13px;
          color: #78716C;
          margin: 0;
          line-height: 1.6;
        }
        .detail-footer {
          padding: 56px 48px;
          background: #1C1917;
          color: #FAFAF9;
          text-align: center;
        }
        .footer-title {
          font-size: 13px;
          letter-spacing: 0.1em;
          margin: 0 0 16px;
        }
        .footer-copy {
          font-size: 11px;
          color: #57534E;
          margin: 0;
        }
        @media (max-width: 768px) {
          .detail-nav { padding: 16px 20px; }
          .detail-hero { padding: 120px 20px 48px; }
          .hero-meta { gap: 20px; }
          .detail-main { padding: 0 20px 48px; }
          .section { margin-bottom: 48px; }
          .info-grid { grid-template-columns: 1fr; }
          .tickets-grid { grid-template-columns: 1fr; }
          .hotel-card { grid-template-columns: 1fr; }
          .hotel-info { padding: 24px; }
          .concept-section { grid-template-columns: 1fr; gap: 24px; }
          .detail-footer { padding: 40px 20px; }
          .lang-btn { padding: 5px 8px; font-size: 10px; }
        }
      `}</style>
    </div>
  )
}
