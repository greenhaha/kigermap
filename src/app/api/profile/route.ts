import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

function generateShareCode(): string {
  return Math.random().toString(36).slice(2, 10)
}

// GET: 获取当前用户的资料
export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const profile = await prisma.kigurumiProfile.findUnique({
    where: { accountId: (session.user as any).id },
  })

  if (!profile) {
    return NextResponse.json({ profile: null })
  }

  return NextResponse.json({
    profile: {
      id: profile.id,
      cnName: profile.cnName,
      introduction: profile.introduction,
      photos: JSON.parse(profile.photos),
      location: {
        lat: profile.lat,
        lng: profile.lng,
        country: profile.country,
        province: profile.province,
        city: profile.city,
      },
      socialLinks: profile.socialLinks ? JSON.parse(profile.socialLinks) : null,
      shareCode: profile.shareCode,
      createdAt: profile.createdAt.toISOString(),
    },
  })
}

// POST: 创建或更新资料
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { cnName, introduction, photos, location, socialLinks } = body
    const accountId = (session.user as any).id

    // 验证账户是否存在
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    })

    if (!account) {
      return NextResponse.json({ error: '账户不存在，请重新登录' }, { status: 401 })
    }

    // 检查是否已有资料
    const existing = await prisma.kigurumiProfile.findUnique({
      where: { accountId },
    })

    if (!cnName?.trim()) {
      return NextResponse.json({ error: '请输入CN名称' }, { status: 400 })
    }
    if (!introduction?.trim()) {
      return NextResponse.json({ error: '请输入自我介绍' }, { status: 400 })
    }
    if (!photos?.length) {
      return NextResponse.json({ error: '请上传至少一张照片' }, { status: 400 })
    }
    if (!location?.lat || !location?.lng) {
      return NextResponse.json({ error: '请获取位置信息' }, { status: 400 })
    }

    const ossFolder = `user_${accountId}`
    const socialLinksJson = socialLinks ? JSON.stringify(socialLinks) : null

    if (existing) {
      const profile = await prisma.kigurumiProfile.update({
        where: { accountId },
        data: {
          cnName: cnName.trim(),
          introduction: introduction.trim(),
          photos: JSON.stringify(photos),
          lat: location.lat,
          lng: location.lng,
          country: location.country || '未知',
          province: location.province,
          city: location.city,
          socialLinks: socialLinksJson,
        },
      })

      return NextResponse.json({
        profile: {
          ...profile,
          photos: JSON.parse(profile.photos),
          location: {
            lat: profile.lat,
            lng: profile.lng,
            country: profile.country,
            province: profile.province,
            city: profile.city,
          },
          socialLinks: profile.socialLinks ? JSON.parse(profile.socialLinks) : null,
        },
        message: '资料已更新',
      })
    } else {
      const profile = await prisma.kigurumiProfile.create({
        data: {
          accountId,
          cnName: cnName.trim(),
          introduction: introduction.trim(),
          photos: JSON.stringify(photos),
          lat: location.lat,
          lng: location.lng,
          country: location.country || '未知',
          province: location.province,
          city: location.city,
          socialLinks: socialLinksJson,
          shareCode: generateShareCode(),
          ossFolder,
        },
      })

      return NextResponse.json({
        profile: {
          ...profile,
          photos: JSON.parse(profile.photos),
          location: {
            lat: profile.lat,
            lng: profile.lng,
            country: profile.country,
            province: profile.province,
            city: profile.city,
          },
          socialLinks: profile.socialLinks ? JSON.parse(profile.socialLinks) : null,
        },
        message: '资料已创建',
      })
    }
  } catch (error) {
    console.error('保存资料失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// DELETE: 删除资料
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const accountId = (session.user as any).id

    await prisma.kigurumiProfile.delete({
      where: { accountId },
    })

    return NextResponse.json({ success: true, message: '资料已删除' })
  } catch (error) {
    console.error('删除资料失败:', error)
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
