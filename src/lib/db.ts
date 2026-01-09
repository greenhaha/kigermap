import { PrismaClient } from '@prisma/client'
import { normalizeCountry, normalizeProvince, isChineseProvince } from './location'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 转换数据库记录为前端类型
export function toKigurumiUser(profile: any) {
  let socialLinks = null
  if (profile.socialLinks) {
    try {
      socialLinks = typeof profile.socialLinks === 'string' 
        ? JSON.parse(profile.socialLinks) 
        : profile.socialLinks
    } catch {
      socialLinks = null
    }
  }

  let aiPersonality = null
  if (profile.aiPersonality) {
    try {
      aiPersonality = typeof profile.aiPersonality === 'string'
        ? JSON.parse(profile.aiPersonality)
        : profile.aiPersonality
    } catch {
      aiPersonality = null
    }
  }
  
  // 标准化国家和省份名称
  let country = normalizeCountry(profile.country || '')
  let province = normalizeProvince(profile.province || '')
  
  // 如果省份是中国省份但国家不是中国，修正国家为中国
  if (isChineseProvince(province) && country !== '中国') {
    country = '中国'
  }
  
  return {
    id: profile.id,
    cnName: profile.cnName || '',
    introduction: profile.introduction || '',
    photos: typeof profile.photos === 'string' ? JSON.parse(profile.photos) : (profile.photos || []),
    location: {
      lat: profile.lat,
      lng: profile.lng,
      country,
      province,
      city: profile.city || '',
    },
    socialLinks,
    aiPersonality,
    createdAt: profile.createdAt?.toISOString?.() || profile.createdAt,
    shareCode: profile.shareCode || '',
  }
}
