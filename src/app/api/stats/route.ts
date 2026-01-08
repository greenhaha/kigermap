import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { normalizeCountry, normalizeProvince, isChineseProvince } from '@/lib/location'

// GET: 获取地区统计
export async function GET() {
  try {
    // 按国家和省份分组统计
    const stats = await prisma.kigurumiProfile.groupBy({
      by: ['country', 'province'],
      _count: { id: true },
    })

    // 标准化国家和省份名称，合并相同地区
    const mergedStats = new Map<string, { country: string; province: string; count: number }>()
    
    stats.forEach(s => {
      let country = normalizeCountry(s.country)
      let province = normalizeProvince(s.province || '')
      
      // 如果省份是中国省份但国家不是中国，修正国家为中国
      if (isChineseProvince(province) && country !== '中国') {
        country = '中国'
      }
      
      const key = `${country}|${province}`
      const existing = mergedStats.get(key)
      
      if (existing) {
        existing.count += s._count.id
      } else {
        mergedStats.set(key, {
          country,
          province,
          count: s._count.id,
        })
      }
    })

    const result = Array.from(mergedStats.values())

    return NextResponse.json({ stats: result })
  } catch (error) {
    console.error('获取统计失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
