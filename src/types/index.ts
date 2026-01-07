export interface SocialLinks {
  x?: string        // X (Twitter)
  douyin?: string   // 抖音
  xiaohongshu?: string  // 小红书
  bilibili?: string // B站
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
