import { NextRequest, NextResponse } from 'next/server'
import { prisma, toKigurumiUser } from '@/lib/db'

// GET: 根据分享码获取用户（公开）
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params

    const profile = await prisma.kigurumiProfile.findUnique({
      where: { shareCode: code },
    })

    if (!profile) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    return NextResponse.json({ user: toKigurumiUser(profile) })
  } catch (error) {
    console.error('获取用户失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
