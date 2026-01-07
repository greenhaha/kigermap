import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Kigurumi Map - 探索全球Kigurumi世界',
  description: '发现全球各地的Kigurumi爱好者，展示你的角色，结识志同道合的朋友。加入我们，让世界看到你的精彩！',
  keywords: 'kigurumi, 着ぐるみ, cosplay, 地图, 社区, 面具, 角色扮演',
  authors: [{ name: 'Kigurumi Map' }],
  openGraph: {
    title: 'Kigurumi Map - 探索全球Kigurumi世界',
    description: '发现全球各地的Kigurumi爱好者，展示你的角色，结识志同道合的朋友',
    type: 'website',
    locale: 'zh_CN',
    siteName: 'Kigurumi Map',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kigurumi Map',
    description: '发现全球各地的Kigurumi爱好者',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0F172A',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="antialiased">
      <head>
        {/* 使用国内 CDN */}
        <link
          rel="stylesheet"
          href="https://cdn.bootcdn.net/ajax/libs/leaflet/1.9.4/leaflet.min.css"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://cdn.bootcdn.net/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.min.css"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://cdn.bootcdn.net/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.Default.min.css"
          crossOrigin=""
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
