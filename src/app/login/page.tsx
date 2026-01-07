'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn, getProviders, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useI18n, LanguageSwitcher } from '@/components/I18nProvider'

// 第三方登录图标
const OAuthIcons: Record<string, React.ReactNode> = {
  qq: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M12.003 2c-5.523 0-9.997 4.477-9.997 10 0 2.386.832 4.577 2.222 6.298-.176.91-.65 2.702-1.228 3.702 0 0 2.877-.63 4.447-1.58.89.25 1.83.38 2.803.38h.003c5.523 0 9.997-4.477 9.997-10s-4.474-10-9.997-10h-.25z"/>
    </svg>
  ),
  wechat: (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
    </svg>
  ),
}

const OAuthStyles: Record<string, { bg: string; hover: string; text: string }> = {
  qq: { bg: 'bg-[#12B7F5]', hover: 'hover:bg-[#0ea5e9]', text: 'text-white' },
  wechat: { bg: 'bg-[#07C160]', hover: 'hover:bg-[#06ae56]', text: 'text-white' },
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const { t, locale } = useI18n()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [providers, setProviders] = useState<Record<string, any>>({})
  const [sendingCode, setSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [codeExpiresIn, setCodeExpiresIn] = useState(0)

  // 如果已登录，跳转到首页
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.replace('/')
    }
  }, [session, status, router])

  useEffect(() => {
    getProviders().then((p) => {
      if (p) setProviders(p)
    })
  }, [])

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      if (errorParam === 'OAuthAccountNotLinked') {
        setError(t('login.error.oauthLinked'))
      } else if (errorParam === 'OAuthCallback') {
        setError(t('login.error.oauthFailed'))
      } else {
        setError(t('login.error.failed'))
      }
    }
  }, [searchParams, t])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  useEffect(() => {
    if (codeExpiresIn > 0) {
      const timer = setTimeout(() => setCodeExpiresIn(codeExpiresIn - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [codeExpiresIn])

  const handleSendCode = async () => {
    if (!email) {
      setError(t('login.error.emailRequired'))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(t('login.error.emailInvalid'))
      return
    }

    setSendingCode(true)
    setError('')

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      })

      const data = await res.json()
      
      if (!res.ok) {
        if (data.retryAfter) {
          setCountdown(data.retryAfter)
        }
        setError(data.error || t('login.error.sendFailed'))
        return
      }

      setCountdown(data.retryAfter || 60)
      setCodeExpiresIn(data.expiresIn || 600)
    } catch (err) {
      setError(t('login.error.sendFailed'))
    } finally {
      setSendingCode(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          setError(t('login.error.passwordMismatch'))
          setLoading(false)
          return
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, verificationCode }),
        })

        const data = await res.json()
        if (!res.ok) {
          setError(data.error || t('login.error.failed'))
          setLoading(false)
          return
        }

        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError(result.error)
        } else {
          // 使用 window.location 强制刷新，确保 session 正确加载
          window.location.href = '/'
        }
      } else {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError(result.error)
        } else {
          window.location.href = '/'
        }
      }
    } catch (err) {
      setError(t('login.error.failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (providerId: string) => {
    setOauthLoading(providerId)
    setError('')
    try {
      await signIn(providerId, { callbackUrl: '/' })
    } catch (err) {
      setError(t('login.error.failed'))
      setOauthLoading(null)
    }
  }

  const oauthProviders = Object.values(providers).filter(
    (p: any) => p.id !== 'credentials'
  )

  return (
    <div className="glass-dark rounded-3xl p-8 w-full max-w-md">
      {/* Header with Language Switcher */}
      <div className="flex justify-end mb-4">
        <LanguageSwitcher />
      </div>

      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl">
            🎭
          </div>
          <span className="text-2xl font-bold text-gradient">{t('app.name')}</span>
        </Link>
        <p className="text-white/50 mt-2">
          {isRegister ? t('login.register.title') : t('login.title')}
        </p>
      </div>

      {/* OAuth Buttons */}
      {oauthProviders.length > 0 && (
        <>
          <div className="space-y-3 mb-6">
            {oauthProviders.map((provider: any) => {
              const style = OAuthStyles[provider.id] || { bg: 'bg-white/10', hover: 'hover:bg-white/20', text: 'text-white' }
              const icon = OAuthIcons[provider.id]
              const name = provider.id === 'qq' ? t('login.qqLogin') : provider.id === 'wechat' ? t('login.wechatLogin') : provider.name
              
              return (
                <button
                  key={provider.id}
                  onClick={() => handleOAuthLogin(provider.id)}
                  disabled={oauthLoading !== null}
                  className={`w-full py-3.5 ${style.bg} ${style.hover} ${style.text} rounded-xl font-medium transition flex items-center justify-center gap-3 disabled:opacity-50`}
                >
                  {oauthLoading === provider.id ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    icon
                  )}
                  <span>{name}</span>
                </button>
              )
            })}
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-dark text-white/40">{t('login.orUseEmail')}</span>
            </div>
          </div>
        </>
      )}

      {/* Email Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">{t('login.email')}</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t('login.email.placeholder')}
            required
            className="w-full px-4 py-3.5 input-modern rounded-xl text-white placeholder-white/30 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">{t('login.password')}</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t('login.password.placeholder')}
            required
            minLength={6}
            className="w-full px-4 py-3.5 input-modern rounded-xl text-white placeholder-white/30 outline-none"
          />
        </div>

        {isRegister && (
          <>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">{t('login.confirmPassword')}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder={t('login.confirmPassword.placeholder')}
                required
                minLength={6}
                className="w-full px-4 py-3.5 input-modern rounded-xl text-white placeholder-white/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                {t('login.verificationCode')}
                {codeExpiresIn > 0 && (
                  <span className="ml-2 text-xs text-primary">
                    {t('login.verificationCode.expires')} {Math.floor(codeExpiresIn / 60)}:{(codeExpiresIn % 60).toString().padStart(2, '0')}
                  </span>
                )}
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder={t('login.verificationCode.placeholder')}
                  required
                  maxLength={6}
                  className="flex-1 px-4 py-3.5 input-modern rounded-xl text-white placeholder-white/30 outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sendingCode || countdown > 0}
                  className="px-4 py-3.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl font-medium transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingCode ? t('login.sending') : countdown > 0 ? `${countdown}s` : t('login.sendCode')}
                </button>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 btn-gradient rounded-xl font-medium text-white transition touch-target disabled:opacity-50"
        >
          <span>{loading ? t('login.submitting') : isRegister ? t('login.register.submit') : t('login.submit')}</span>
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsRegister(!isRegister)
            setError('')
            setVerificationCode('')
            setCountdown(0)
            setCodeExpiresIn(0)
          }}
          className="text-white/60 hover:text-white transition text-sm"
        >
          {isRegister ? t('login.switchToLogin') : t('login.switchToRegister')}
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10 text-center">
        <Link href="/" className="text-white/50 hover:text-white transition text-sm">
          {t('login.backHome')}
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="bg-animated" />
      <Suspense fallback={
        <div className="glass-dark rounded-3xl p-8 w-full max-w-md flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
