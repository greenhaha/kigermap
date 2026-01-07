import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './db'
import { QQProvider, WeChatProvider } from './oauth-providers'

export const authOptions: NextAuthOptions = {
  providers: [
    // 邮箱密码登录
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: '邮箱', type: 'email' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('请输入邮箱和密码')
        }

        const account = await prisma.account.findUnique({
          where: { email: credentials.email },
          include: { profile: true },
        })

        if (!account) {
          throw new Error('账户不存在')
        }

        if (!account.password) {
          throw new Error('该账户使用第三方登录，请使用对应方式登录')
        }

        const isValid = await bcrypt.compare(credentials.password, account.password)
        if (!isValid) {
          throw new Error('密码错误')
        }

        return {
          id: account.id,
          email: account.email,
          hasProfile: !!account.profile,
          profileId: account.profile?.id,
          shareCode: account.profile?.shareCode,
        }
      },
    }),
    
    // QQ 登录（暂时屏蔽）
    // ...(process.env.QQ_CLIENT_ID && process.env.QQ_CLIENT_SECRET
    //   ? [
    //       QQProvider({
    //         clientId: process.env.QQ_CLIENT_ID,
    //         clientSecret: process.env.QQ_CLIENT_SECRET,
    //       }),
    //     ]
    //   : []),
    
    // 微信登录（暂时屏蔽）
    // ...(process.env.WECHAT_CLIENT_ID && process.env.WECHAT_CLIENT_SECRET
    //   ? [
    //       WeChatProvider({
    //         clientId: process.env.WECHAT_CLIENT_ID,
    //         clientSecret: process.env.WECHAT_CLIENT_SECRET,
    //       }),
    //     ]
    //   : []),
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // 第三方登录处理
      if (account?.provider && account.provider !== 'credentials') {
        try {
          const providerId = user.id
          const provider = account.provider
          
          // 查找是否已有关联账户
          const existingOAuth = await prisma.oAuthAccount.findUnique({
            where: {
              provider_providerId: {
                provider,
                providerId,
              },
            },
            include: { account: { include: { profile: true } } },
          })

          if (existingOAuth) {
            // 更新 token
            await prisma.oAuthAccount.update({
              where: { id: existingOAuth.id },
              data: {
                accessToken: account.access_token,
                refreshToken: account.refresh_token,
                expiresAt: account.expires_at 
                  ? new Date(account.expires_at * 1000) 
                  : null,
                nickname: user.name,
                avatar: user.image,
              },
            })
            
            // 设置用户信息供后续回调使用
            ;(user as any).accountId = existingOAuth.accountId
            ;(user as any).hasProfile = !!existingOAuth.account.profile
            ;(user as any).profileId = existingOAuth.account.profile?.id
            ;(user as any).shareCode = existingOAuth.account.profile?.shareCode
          } else {
            // 创建新账户
            const newAccount = await prisma.account.create({
              data: {
                oauthAccounts: {
                  create: {
                    provider,
                    providerId,
                    nickname: user.name,
                    avatar: user.image,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    expiresAt: account.expires_at 
                      ? new Date(account.expires_at * 1000) 
                      : null,
                  },
                },
              },
            })
            
            ;(user as any).accountId = newAccount.id
            ;(user as any).hasProfile = false
          }
          
          return true
        } catch (error) {
          console.error('OAuth 登录错误:', error)
          return false
        }
      }
      
      return true
    },
    
    async jwt({ token, user, account, trigger }) {
      if (user) {
        if (account?.provider === 'credentials') {
          token.id = user.id
          token.hasProfile = (user as any).hasProfile
          token.profileId = (user as any).profileId
          token.shareCode = (user as any).shareCode
        } else {
          // 第三方登录
          token.id = (user as any).accountId || user.id
          token.hasProfile = (user as any).hasProfile || false
          token.profileId = (user as any).profileId
          token.shareCode = (user as any).shareCode
          token.name = user.name
          token.picture = user.image
        }
      }
      
      // 当调用 update() 时，重新获取 profile 信息
      if (trigger === 'update' && token.id) {
        try {
          const account = await prisma.account.findUnique({
            where: { id: token.id as string },
            include: { profile: true },
          })
          if (account) {
            token.hasProfile = !!account.profile
            token.profileId = account.profile?.id
            token.shareCode = account.profile?.shareCode
          }
        } catch (error) {
          console.error('更新 token 失败:', error)
        }
      }
      
      return token
    },
    
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).hasProfile = token.hasProfile
        ;(session.user as any).profileId = token.profileId
        ;(session.user as any).shareCode = token.shareCode
      }
      return session
    },
  },
  
  pages: {
    signIn: '/login',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  // Cookie 配置 - 兼容 HTTP 和 HTTPS
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? false,
      },
    },
  },
}
