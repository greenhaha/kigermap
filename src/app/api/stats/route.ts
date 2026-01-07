import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: 获取地区统计
export async function GET() {
  try {
    // 按国家和省份分组统计
    const stats = await prisma.kigurumiProfile.groupBy({
      by: ['country', 'province'],
      _count: { id: true },
    })

    const result = stats.map(s => ({
      country: s.country,
      province: s.province,
      count: s._count.id,
    }))

    return NextResponse.json({ stats: result })
  } catch (error) {
    console.error('获取统计失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
