export interface SocialLinks {
  x?: string        // X (Twitter)
  douyin?: string   // 抖音
  xiaohongshu?: string  // 小红书
  bilibili?: string // B站
}

export interface AIPersonality {
  enabled: boolean      // 是否启用AI聊天
  personality: string   // 性格描述
  tone: string          // 说话语气
  interests: string[]   // 兴趣爱好
  customPrompt?: string // 自定义提示词
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface KigurumiUser {
  id: string
  cnName: string
  introduction: string
  photos: string[]
  location: {
    lat: number
    lng: number
    country: string
    province?: string
    city?: string
  }
  socialLinks?: SocialLinks
  aiPersonality?: AIPersonality
  createdAt: string
  shareCode: string
}

export interface UploadFormData {
  cnName: string
  introduction: string
  photos: File[]
  location: {
    lat: number
    lng: number
    country: string
    province?: string
    city?: string
  } | null
  socialLinks?: SocialLinks
}

export interface RegionStats {
  country: string
  province?: string
  count: number
}
