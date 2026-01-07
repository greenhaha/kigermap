import { NextRequest, NextResponse } from 'next/server'
import { prisma, toKigurumiUser } from '@/lib/db'

// GET: 获取所有用户列表（公开）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')
    const province = searchParams.get('province')

    const where: any = {}
    if (country) where.country = country
    if (province) where.province = province

    const profiles = await prisma.kigurumiProfile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ 
      users: profiles.map(toKigurumiUser) 
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
