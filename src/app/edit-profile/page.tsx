'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LocationInfo } from '@/lib/location'
import { compressImage, getOSSConfig, uploadToOSS, generateUserFolder, validateImageFile, getPreviewUrl, revokePreviewUrl } from '@/lib/oss'
import LocationPicker from '@/components/LocationPicker'

export default function EditProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  
  const [cnName, setCnName] = useState('')
  const [introduction, setIntroduction] = useState('')
  const [photos, setPhotos] = useState<Blob[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [existingPhotos, setExistingPhotos] = useState<string[]>([])
  const [location, setLocation] = useState<LocationInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [hasExistingProfile, setHasExistingProfile] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data.profile) {
            setCnName(data.profile.cnName)
            setIntroduction(data.profile.introduction)
            setExistingPhotos(data.profile.photos || [])
            setLocation(data.profile.location)
            setHasExistingProfile(true)
          }
        })
        .catch(console.error)
    }
  }, [status])

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-animated" />
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const user = session?.user as any

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalPhotos = existingPhotos.length + photos.length + files.length
    
    if (totalPhotos > 3) {
      setError('最多只能上传3张照片')
      return
    }

    setError('')
    const newPreviews: string[] = []
    const compressedBlobs: Blob[] = []

    for (const file of files) {
      // 验证文件
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

    setPhotos(prev => [...prev, ...compressedBlobs] as any)
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeNewPhoto = (index: number) => {
    revokePreviewUrl(previews[index])
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!cnName.trim()) {
      setError('请输入CN名称')
      return
    }
    if (!introduction.trim()) {
      setError('请输入自我介绍')
      return
    }
    if (existingPhotos.length + photos.length === 0) {
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
      const photoUrls = [...existingPhotos]
      
      if (photos.length > 0) {
        const config = await getOSSConfig()
        const userFolder = generateUserFolder(user.id)
        
        for (let i = 0; i < photos.length; i++) {
          const url = await uploadToOSS(photos[i], config, userFolder, (p) => {
            setUploadProgress(Math.round((i / photos.length) * 100 + p / photos.length))
          })
          photoUrls.push(url)
        }
      }

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnName,
          introduction,
          photos: photoUrls,
          location,
        }),
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || '保存失败')
      }

      setSuccess('保存成功！')
      setPhotos([])
      setPreviews([])
      setExistingPhotos(photoUrls)
      setHasExistingProfile(true)
      
      // 更新 session
      await update()
      
      setTimeout(() => {
        router.push(`/profile/${data.profile.shareCode}`)
      }, 1500)
    } catch (err: any) {
      setError(err.message || '保存失败')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError('')

    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '删除失败')
      }

      // 更新 session
      await update()
      
      router.push('/')
    } catch (err: any) {
      setError(err.message || '删除失败')
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  const totalPhotos = existingPhotos.length + photos.length

  return (
    <div className="min-h-screen relative">
      <div className="bg-animated" />

      <header className="glass-dark sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm">
              🎭
            </div>
            <span className="font-bold text-gradient">Kigurumi Map</span>
          </Link>
          {hasExistingProfile && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition"
            >
              删除资料
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="glass-dark rounded-3xl p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gradient mb-6">
            {hasExistingProfile ? '编辑资料' : '创建你的 Kigurumi 资料'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                CN名称 <span className="text-secondary">*</span>
              </label>
              <input
                type="text"
                value={cnName}
                onChange={e => setCnName(e.target.value)}
                placeholder="你的CN名称"
                className="w-full px-4 py-3.5 input-modern rounded-xl text-white placeholder-white/30 outline-none"
                maxLength={30}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                自我介绍 <span className="text-secondary">*</span>
              </label>
              <textarea
                value={introduction}
                onChange={e => setIntroduction(e.target.value)}
                placeholder="介绍一下你自己和你的角色..."
                rows={4}
                className="w-full px-4 py-3.5 input-modern rounded-xl text-white placeholder-white/30 outline-none resize-none"
                maxLength={500}
              />
              <p className="text-xs text-white/30 mt-2 text-right">{introduction.length}/500</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                照片 <span className="text-secondary">*</span>
                <span className="text-white/40 font-normal ml-2">（最多3张）</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {existingPhotos.map((src, i) => (
                  <div key={`existing-${i}`} className="relative aspect-square group">
                    <img src={src} className="w-full h-full object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(i)}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                {previews.map((src, i) => (
                  <div key={`new-${i}`} className="relative aspect-square group">
                    <img src={src} className="w-full h-full object-cover rounded-xl" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary/80 rounded text-xs">新</div>
                    <button
                      type="button"
                      onClick={() => removeNewPhoto(i)}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                {totalPhotos < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-white/40 hover:border-primary hover:text-primary transition"
                  >
                    <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs">添加照片</span>
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

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                位置 <span className="text-secondary">*</span>
              </label>
              <LocationPicker
                value={location}
                onChange={setLocation}
              />
            </div>

            {uploadProgress > 0 && (
              <div className="glass rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">上传中...</span>
                  <span className="text-primary">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 btn-gradient rounded-xl font-medium text-white transition touch-target disabled:opacity-50"
            >
              <span>{loading ? '保存中...' : '保存资料'}</span>
            </button>
          </form>
        </div>
      </main>

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-dark rounded-2xl p-6 max-w-sm w-full animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">确认删除？</h3>
              <p className="text-white/60 text-sm">
                删除后你的资料将从地图上移除，此操作不可恢复。
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 glass hover:bg-white/10 rounded-xl font-medium transition"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition disabled:opacity-50"
              >
                {deleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
