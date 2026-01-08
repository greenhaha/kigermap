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

  // 未登录状态
  if (!session) {
    return (
      <div className="glass-dark rounded-t-3xl sm:rounded-3xl p-6 w-full sm:max-w-md mx-auto">
        <div className="text-center py-6">
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
    <div className="glass-dark rounded-t-3xl sm:rounded-3xl overflow-hidden w-full sm:w-[90vw] sm:max-w-5xl mx-auto flex flex-col max-h-[85vh]">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg">
            🎭
          </div>
          <div>
            <h2 className="text-lg font-bold">快速加入地图</h2>
            <p className="text-xs text-white/50">填写信息，展示你的角色</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="w-8 h-8 glass rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* PC端三栏布局 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 第一栏：基本信息 */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">基本信息</h3>
              
              {/* CN名称 */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  CN名称 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={cnName}
                  onChange={e => setCnName(e.target.value)}
                  placeholder="你的CN名称"
                  className="w-full px-4 py-3 input-modern rounded-xl text-white placeholder-white/30 outline-none"
                  maxLength={30}
                />
              </div>

              {/* 自我介绍 */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  自我介绍 <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={introduction}
                  onChange={e => setIntroduction(e.target.value)}
                  placeholder="简单介绍一下你自己..."
                  rows={5}
                  className="w-full px-4 py-3 input-modern rounded-xl text-white placeholder-white/30 outline-none resize-none"
                  maxLength={200}
                />
                <p className="text-xs text-white/40 mt-1 text-right">{introduction.length}/200</p>
              </div>
            </div>

            {/* 第二栏：照片上传 */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">照片展示</h3>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  上传照片 <span className="text-red-400">*</span>
                  <span className="text-white/40 font-normal ml-2">最多3张</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="aspect-square">
                      {previews[index] ? (
                        <div className="relative group w-full h-full">
                          <img 
                            src={previews[index]} 
                            className="w-full h-full object-cover rounded-xl border-2 border-white/10" 
                            alt={`照片 ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-full border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-white/40 hover:border-primary hover:text-primary hover:bg-primary/5 transition gap-2"
                        >
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="text-xs">添加</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <p className="text-xs text-white/40 mt-2">支持 JPG、PNG、WebP 格式</p>
              </div>
            </div>

            {/* 第三栏：位置和社交 */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider">位置信息</h3>
              
              {/* 位置区块 */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  你的位置 <span className="text-red-400">*</span>
                </label>
                <LocationPicker
                  value={location}
                  onChange={setLocation}
                />
              </div>

              {/* 社交链接区块 */}
              <div className="glass rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowSocialLinks(!showSocialLinks)}
                  className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">社交账号</p>
                      <p className="text-xs text-white/40">可选</p>
                    </div>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-white/40 transition-transform ${showSocialLinks ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showSocialLinks && (
                  <div className="p-3 pt-0 border-t border-white/5">
                    <SocialLinksInput value={socialLinks} onChange={setSocialLinks} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 上传进度 */}
          {uploadProgress > 0 && (
            <div className="glass rounded-xl p-4 mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/70">正在上传照片...</span>
                <span className="text-primary font-medium">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }} 
                />
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-start gap-3 mt-6">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>
      </form>

      {/* Footer */}
      <div className="p-4 sm:p-5 border-t border-white/10 flex-shrink-0 bg-dark/50">
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 glass rounded-xl font-medium hover:bg-white/10 transition"
          >
            取消
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-10 py-3 btn-gradient rounded-xl font-medium text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>提交中...</span>
              </>
            ) : (
              <>
                <span>🎭</span>
                <span>加入地图</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
