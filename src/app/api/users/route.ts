import { NextRequest, NextResponse } from 'next/server'
import { prisma, toKigurumiUser } from '@/lib/db'

// GET: 获取用户列表（公开）
// 支持分页：?page=1&limit=20
// 不传分页参数则返回全部（用于地图显示）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')
    const province = searchParams.get('province')
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')

    const where: any = {}
    if (country) where.country = country
    if (province) where.province = province

    // 如果有分页参数，返回分页数据
    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page) || 1)
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20))
      const skip = (pageNum - 1) * limitNum

      const [profiles, total] = await Promise.all([
        prisma.kigurumiProfile.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.kigurumiProfile.count({ where })
      ])

      return NextResponse.json({
        users: profiles.map(toKigurumiUser),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasMore: skip + profiles.length < total
        }
      })
    }

    // 不分页，返回全部数据（用于地图）
    const profiles = await prisma.kigurumiProfile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ 
      users: profiles.map(toKigurumiUser),
      total: profiles.length
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
