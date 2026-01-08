'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

type FeedbackType = 'bug' | 'feature' | 'question' | 'other'

const feedbackTypes: { value: FeedbackType; label: string; icon: string }[] = [
  { value: 'bug', label: '问题报告', icon: '🐛' },
  { value: 'feature', label: '功能建议', icon: '💡' },
  { value: 'question', label: '使用疑问', icon: '❓' },
  { value: 'other', label: '其他反馈', icon: '📝' },
]

export default function FeedbackPage() {
  const { data: session } = useSession()
  const [type, setType] = useState<FeedbackType>('bug')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('请输入标题')
      return
    }
    if (!content.trim()) {
      setError('请输入详细描述')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: title.trim(),
          content: content.trim(),
          contact: contact.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '提交失败')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || '提交失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-animated" />
        <div className="glass-dark rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">感谢您的反馈！</h2>
          <p className="text-white/60 mb-6">我们已收到您的反馈，会尽快处理。</p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="px-6 py-3 btn-gradient rounded-xl font-medium">
              返回首页
            </Link>
            <button
              onClick={() => {
                setSuccess(false)
                setTitle('')
                setContent('')
                setContact('')
              }}
              className="px-6 py-3 glass rounded-xl font-medium hover:bg-white/10 transition"
            >
              继续反馈
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="bg-animated" />
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>返回</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="glass-dark rounded-3xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl">
                💬
              </div>
              <div>
                <h1 className="text-2xl font-bold">问题反馈</h1>
                <p className="text-white/50 text-sm mt-1">帮助我们改进 Kigurumi Map</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* 反馈类型 */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">反馈类型</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {feedbackTypes.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setType(item.value)}
                    className={`p-3 rounded-xl text-center transition ${
                      type === item.value
                        ? 'bg-primary/20 border-2 border-primary text-white'
                        : 'glass border-2 border-transparent text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs font-medium">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                标题 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="简要描述您的问题或建议"
                className="w-full px-4 py-3 input-modern rounded-xl text-white placeholder-white/30 outline-none"
                maxLength={100}
              />
            </div>

            {/* 详细描述 */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                详细描述 <span className="text-red-400">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请详细描述您遇到的问题或建议，包括操作步骤、期望结果等..."
                rows={6}
                className="w-full px-4 py-3 input-modern rounded-xl text-white placeholder-white/30 outline-none resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-white/40 mt-1 text-right">{content.length}/2000</p>
            </div>

            {/* 联系方式 */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                联系方式 <span className="text-white/40 font-normal">（可选）</span>
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="邮箱或其他联系方式，方便我们回复您"
                className="w-full px-4 py-3 input-modern rounded-xl text-white placeholder-white/30 outline-none"
                maxLength={100}
              />
            </div>

            {/* 用户信息提示 */}
            {session && (
              <div className="flex items-center gap-2 p-3 glass rounded-xl text-sm text-white/60">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>您的账户信息将自动关联到此反馈</span>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* 提交按钮 */}
            <div className="flex gap-3 pt-2">
              <Link
                href="/"
                className="px-6 py-3 glass rounded-xl font-medium hover:bg-white/10 transition"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 btn-gradient rounded-xl font-medium text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>提交中...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>提交反馈</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 常见问题 */}
        <div className="mt-8 glass-dark rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>💡</span>
            <span>常见问题</span>
          </h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 glass rounded-xl">
              <p className="font-medium mb-1">如何修改我的位置信息？</p>
              <p className="text-white/60">登录后点击"编辑"按钮，在位置选项中重新选择或自动定位。</p>
            </div>
            <div className="p-3 glass rounded-xl">
              <p className="font-medium mb-1">为什么我的照片上传失败？</p>
              <p className="text-white/60">请确保图片格式为 JPG/PNG/WebP，单张不超过 10MB。</p>
            </div>
            <div className="p-3 glass rounded-xl">
              <p className="font-medium mb-1">如何删除我的账户？</p>
              <p className="text-white/60">请通过此页面提交删除请求，我们会在 3 个工作日内处理。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
