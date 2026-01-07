import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password, verificationCode } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: '请输入邮箱和密码' }, { status: 400 })
    }

    if (!verificationCode) {
      return NextResponse.json({ error: '请输入验证码' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6位' }, { status: 400 })
    }

    // 验证验证码
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email,
        code: verificationCode,
        expiresAt: { gte: new Date() },
      },
    })

    if (!verification) {
      return NextResponse.json({ error: '验证码无效或已过期' }, { status: 400 })
    }

    // 检查邮箱是否已存在
    const existing = await prisma.account.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json({ error: '该邮箱已注册' }, { status: 400 })
    }

    // 创建账户
    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.account.create({
      data: {
        email,
        password: hashedPassword,
      },
    })

    // 删除已使用的验证码
    await prisma.emailVerification.deleteMany({
      where: { email },
    })

    return NextResponse.json({ 
      success: true,
      message: '注册成功',
    })
  } catch (error) {
    console.error('注册失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
