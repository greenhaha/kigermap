'use client'

import type { SocialLinks } from '@/types'

// 社交平台配置
export const SOCIAL_PLATFORMS = {
  x: {
    name: 'X',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    color: 'bg-black hover:bg-gray-800',
    placeholder: 'https://x.com/username',
  },
  douyin: {
    name: '抖音',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
    color: 'bg-black hover:bg-gray-800',
    placeholder: 'https://www.douyin.com/user/xxx',
  },
  xiaohongshu: {
    name: '小红书',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm-2-8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
      </svg>
    ),
    color: 'bg-[#FE2C55] hover:bg-[#E91E4D]',
    placeholder: 'https://www.xiaohongshu.com/user/profile/xxx',
  },
  bilibili: {
    name: 'B站',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z"/>
      </svg>
    ),
    color: 'bg-[#00A1D6] hover:bg-[#0091C2]',
    placeholder: 'https://space.bilibili.com/xxx',
  },
} as const

interface SocialLinksDisplayProps {
  links?: SocialLinks | null
  size?: 'sm' | 'md'
}

// 展示组件
export function SocialLinksDisplay({ links, size = 'md' }: SocialLinksDisplayProps) {
  if (!links) return null
  
  const hasLinks = Object.values(links).some(v => v)
  if (!hasLinks) return null

  const sizeClasses = size === 'sm' 
    ? 'w-7 h-7 text-xs' 
    : 'w-9 h-9 text-sm'

  return (
    <div className="flex gap-2">
      {(Object.keys(SOCIAL_PLATFORMS) as Array<keyof typeof SOCIAL_PLATFORMS>).map(key => {
        const url = links[key]
        if (!url) return null
        
        const platform = SOCIAL_PLATFORMS[key]
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${sizeClasses} ${platform.color} text-white rounded-lg flex items-center justify-center transition-transform hover:scale-110`}
            title={platform.name}
          >
            {platform.icon}
          </a>
        )
      })}
    </div>
  )
}

interface SocialLinksInputProps {
  value: SocialLinks
  onChange: (links: SocialLinks) => void
}

// 输入组件
export function SocialLinksInput({ value, onChange }: SocialLinksInputProps) {
  const handleChange = (key: keyof SocialLinks, url: string) => {
    onChange({ ...value, [key]: url || undefined })
  }

  return (
    <div className="space-y-3">
      {(Object.keys(SOCIAL_PLATFORMS) as Array<keyof typeof SOCIAL_PLATFORMS>).map(key => {
        const platform = SOCIAL_PLATFORMS[key]
        return (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-8 h-8 ${platform.color} text-white rounded-lg flex items-center justify-center flex-shrink-0`}>
              {platform.icon}
            </div>
            <input
              type="url"
              value={value[key] || ''}
              onChange={e => handleChange(key, e.target.value)}
              placeholder={platform.placeholder}
              className="flex-1 px-3 py-2 input-modern rounded-lg text-white placeholder-white/30 outline-none text-sm"
            />
          </div>
        )
      })}
    </div>
  )
}
