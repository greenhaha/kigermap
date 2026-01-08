import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 提交反馈
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { type, title, content, contact } = await req.json()

    // 验证必填字段
    if (!type || !title || !content) {
      return NextResponse.json(
        { error: '请填写完整信息' },
        { status: 400 }
      )
    }

    // 验证类型
    const validTypes = ['bug', 'feature', 'question', 'other']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: '无效的反馈类型' },
        { status: 400 }
      )
    }

    // 限制长度
    if (title.length > 100) {
      return NextResponse.json(
        { error: '标题不能超过100字' },
        { status: 400 }
      )
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: '内容不能超过2000字' },
        { status: 400 }
      )
    }

    // 创建反馈
    const feedback = await prisma.feedback.create({
      data: {
        type,
        title: title.trim(),
        content: content.trim(),
        contact: contact?.trim() || null,
        accountId: (session?.user as any)?.id || null,
      },
    })

    return NextResponse.json({
      success: true,
      feedbackId: feedback.id,
    })
  } catch (error) {
    console.error('提交反馈失败:', error)
    return NextResponse.json(
      { error: '提交失败，请稍后重试' },
      { status: 500 }
    )
  }
}

// 获取反馈列表（管理员用）
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // 简单的管理员检查（可以根据需要扩展）
    // 这里暂时允许任何登录用户查看自己的反馈
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const userId = (session.user as any)?.id

    const feedbacks = await prisma.feedback.findMany({
      where: {
        accountId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    return NextResponse.json({ feedbacks })
  } catch (error) {
    console.error('获取反馈失败:', error)
    return NextResponse.json(
      { error: '获取失败' },
      { status: 500 }
    )
  }
}
