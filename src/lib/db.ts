import { PrismaClient } from '@prisma/client'

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
  
  return {
    id: profile.id,
    cnName: profile.cnName || '',
    introduction: profile.introduction || '',
    photos: typeof profile.photos === 'string' ? JSON.parse(profile.photos) : (profile.photos || []),
    location: {
      lat: profile.lat,
      lng: profile.lng,
      country: profile.country || '',
      province: profile.province || '',
      city: profile.city || '',
    },
    socialLinks,
    createdAt: profile.createdAt?.toISOString?.() || profile.createdAt,
    shareCode: profile.shareCode || '',
  }
}
