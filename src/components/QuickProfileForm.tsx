'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LocationInfo } from '@/lib/location'
import { compressImage, getOSSConfig, uploadToOSS, generateUserFolder, validateImageFile, getPreviewUrl, revokePreviewUrl } from '@/lib/oss'
import LocationPicker from '@/components/LocationPicker'
import { SocialLinksInput } from '@/components/SocialLinks'
import type { SocialLinks } from '@/types'

interface QuickProfileFormProps {
  onClose: () => void
  onSuccess: () => void
}

export default function QuickProfileForm({ onClose, onSuccess }: QuickProfileFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user as any
  
  const [cnName, setCnName] = useState('')
  const [introduction, setIntroduction] = useState('')
  const [photos, setPhotos] = useState<Blob[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [location, setLocation] = useState<LocationInfo | null>(null)
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({})
  const [showSocialLinks, setShowSocialLinks] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + photos.length > 3) {
      setError('最多只能上传3张照片')
      return
    }

    setError('')
    const newPreviews: string[] = []
    const compressedBlobs: Blob[] = []

    for (const file of files) {
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setError(validation.error || '图片格式不支持')
        continue
      }

      try {
        const compressed = await compressImage(file)
        compressedBlobs.push(compressed)
        newPreviews.push(getPreviewUrl(new File([compressed], file.name, { type: 'image/webp' })))
      } catch {
        setError('图片处理失败')
      }
    }

    setPhotos(prev => [...prev, ...compressedBlobs])
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removePhoto = (index: number) => {
    revokePreviewUrl(previews[index])
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!cnName.trim()) {
      setError('请输入CN名称')
      return
    }
    if (!introduction.trim()) {
      setError('请输入自我介绍')
      return
    }
    if (photos.length === 0) {
      setError('请至少上传一张照片')
      return
    }
    if (!location) {
      setError('请获取位置信息')
      return
    }

    setLoading(true)
    setUploadProgress(0)

    try {
      const config = await getOSSConfig()
      const userFolder = generateUserFolder(user.id)
      const photoUrls: string[] = []
      
      for (let i = 0; i < photos.length; i++) {
        const url = await uploadToOSS(photos[i], config, userFolder, (p) => {
          setUploadProgress(Math.round((i / photos.length) * 100 + p / photos.length))
        })
        photoUrls.push(url)
      }

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnName,
          introduction,
          photos: photoUrls,
          location,
          socialLinks: Object.values(socialLinks).some(v => v) ? socialLinks : null,
        }),
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || '保存失败')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || '保存失败')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  if (!session) {
    return (
      <div className="glass-dark rounded-3xl p-6 max-w-md w-full mx-auto">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-3xl">🎭</span>
          </div>
          <h3 className="text-xl font-bold mb-2">加入 Kigurumi Map</h3>
          <p className="text-white/60 mb-6">登录后即可在地图上展示你的信息</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/login')}
              className="flex-1 py-3 btn-gradient rounded-xl font-medium text-white"
            >
              登录 / 注册
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 glass rounded-xl font-medium"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-dark rounded-3xl overflow-hidden max-w-md w-full mx-auto max-h-[90vh] flex flex-col">
      <div className="p-5 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gradient">快速加入地图</h2>
        <button onClick={onClose} className="w-8 h-8 glass rounded-full flex items-center justify-center text-white/60 hover:text-white">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
        {/* CN名称 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">CN名称</label>
          <input
            type="text"
            value={cnName}
            onChange={e => setCnName(e.target.value)}
            placeholder="你的CN名称"
            className="w-full px-4 py-3 input-modern rounded-xl text-white placeholder-white/30 outline-none text-sm"
            maxLength={30}
          />
        </div>

        {/* 自我介绍 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">自我介绍</label>
          <textarea
            value={introduction}
            onChange={e => setIntroduction(e.target.value)}
            placeholder="简单介绍一下你自己..."
            rows={2}
            className="w-full px-4 py-3 input-modern rounded-xl text-white placeholder-white/30 outline-none resize-none text-sm"
            maxLength={200}
          />
        </div>

        {/* 照片 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">照片（最多3张）</label>
          <div className="flex gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 group">
                <img src={src} className="w-full h-full object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
            {previews.length < 3 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center text-white/40 hover:border-primary hover:text-primary transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>

        {/* 位置 */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">位置</label>
          <LocationPicker
            value={location}
            onChange={setLocation}
          />
        </div>

        {/* 社交链接 */}
        <div>
          <button
            type="button"
            onClick={() => setShowSocialLinks(!showSocialLinks)}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
          >
            <svg className={`w-4 h-4 transition-transform ${showSocialLinks ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            添加社交账号（可选）
          </button>
          {showSocialLinks && (
            <div className="mt-3">
              <SocialLinksInput value={socialLinks} onChange={setSocialLinks} />
            </div>
          )}
        </div>

        {/* 上传进度 */}
        {uploadProgress > 0 && (
          <div className="glass rounded-xl p-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/70">上传中...</span>
              <span className="text-primary">{uploadProgress}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}
      </form>

      {/* 提交按钮 */}
      <div className="p-5 border-t border-white/10">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 btn-gradient rounded-xl font-medium text-white transition touch-target disabled:opacity-50"
        >
          {loading ? '提交中...' : '加入地图'}
        </button>
      </div>
    </div>
  )
}
