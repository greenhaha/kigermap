import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  generateVerificationCode,
  sendVerificationEmail,
  CODE_EXPIRY_MINUTES,
  SEND_INTERVAL_SECONDS,
} from '@/lib/email'
import { Locale } from '@/lib/i18n'

export async function POST(request: NextRequest) {
  try {
    const { email, locale = 'zh' } = await request.json()

    if (!email) {
      return NextResponse.json({ error: '请输入邮箱' }, { status: 400 })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 })
    }

    // 检查发送频率限制
    const recentCode = await prisma.emailVerification.findFirst({
      where: {
        email,
        createdAt: {
          gte: new Date(Date.now() - SEND_INTERVAL_SECONDS * 1000),
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (recentCode) {
      const waitSeconds = Math.ceil(
        (recentCode.createdAt.getTime() + SEND_INTERVAL_SECONDS * 1000 - Date.now()) / 1000
      )
      return NextResponse.json(
        { 
          error: `请等待 ${waitSeconds} 秒后再发送`,
          retryAfter: waitSeconds,
        },
        { status: 429 }
      )
    }

    // 生成验证码
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000)

    // 删除该邮箱的旧验证码
    await prisma.emailVerification.deleteMany({
      where: { email },
    })

    // 保存新验证码
    await prisma.emailVerification.create({
      data: {
        email,
        code,
        expiresAt,
      },
    })

    // 临时：打印验证码到日志
    console.log(`📧 验证码 [${email}]: ${code}`)

    // 发送邮件（传递语言参数）
    const result = await sendVerificationEmail(email, code, locale as Locale)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '发送失败，请稍后重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '验证码已发送',
      expiresIn: CODE_EXPIRY_MINUTES * 60, // 秒
      retryAfter: SEND_INTERVAL_SECONDS, // 秒
    })
  } catch (error) {
    console.error('发送验证码失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
