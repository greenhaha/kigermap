'use client'

import { useState, useEffect } from 'react'
import { 
  LocationInfo, 
  getSmartLocation, 
  reverseGeocode, 
  getLocationByRegion,
  COUNTRIES,
  getProvinces,
  getCities 
} from '@/lib/location'

interface LocationPickerProps {
  value: LocationInfo | null
  onChange: (location: LocationInfo | null) => void
  error?: string
}

type Mode = 'auto' | 'manual'

export default function LocationPicker({ value, onChange, error }: LocationPickerProps) {
  const [mode, setMode] = useState<Mode>('auto')
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState('')
  
  // 手动选择的值
  const [country, setCountry] = useState('中国')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  
  const provinces = getProvinces()
  const cities = province ? getCities(province) : []

  // 自动获取位置
  const handleAutoLocate = async () => {
    setLoading(true)
    setLocalError('')
    try {
      const info = await getSmartLocation()
      if (info) {
        onChange(info)
        // 同步到手动选择的值
        setCountry(info.country || '中国')
        setProvince(info.province || '')
        setCity(info.city || '')
      } else {
        setLocalError('获取定位失败，请手动选择')
        setMode('manual')
      }
    } catch (err: any) {
      setLocalError(err.message || '获取定位失败，请手动选择')
      setMode('manual')
    } finally {
      setLoading(false)
    }
  }

  // 手动选择位置
  const handleManualSelect = async () => {
    if (!country) {
      setLocalError('请选择国家')
      return
    }
    
    if (country === '中国' && !province) {
      setLocalError('请选择省份')
      return
    }

    setLoading(true)
    setLocalError('')
    
    try {
      const location = await getLocationByRegion(country, province, city)
      if (location) {
        onChange(location)
      } else {
        // 如果无法获取坐标，使用默认值
        onChange({
          lat: 39.9,
          lng: 116.4,
          country,
          province: province || undefined,
          city: city || undefined,
        })
      }
    } catch (err) {
      setLocalError('获取位置信息失败')
    } finally {
      setLoading(false)
    }
  }

  // 省份变化时清空城市
  useEffect(() => {
    setCity('')
  }, [province])

  // 国家变化时清空省市
  useEffect(() => {
    if (country !== '中国') {
      setProvince('')
      setCity('')
    }
  }, [country])

  const displayError = error || localError

  return (
    <div className="space-y-3">
      {/* 模式切换 */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('auto')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm transition ${
            mode === 'auto' 
              ? 'bg-primary/20 text-primary border border-primary/30' 
              : 'glass text-white/60 hover:text-white'
          }`}
        >
          📍 自动定位
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm transition ${
            mode === 'manual' 
              ? 'bg-primary/20 text-primary border border-primary/30' 
              : 'glass text-white/60 hover:text-white'
          }`}
        >
          ✏️ 手动选择
        </button>
      </div>

      {mode === 'auto' ? (
        // 自动定位模式
        <div>
          {value ? (
            <div className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">
                  {[value.district, value.city, value.province, value.country]
                    .filter(Boolean)
                    .filter((v, i, arr) => arr.indexOf(v) === i) // 去重
                    .join(', ')}
                </p>
                <p className="text-white/40 text-xs mt-0.5">位置已模糊处理，仅显示县市级别</p>
              </div>
              <button
                type="button"
                onClick={handleAutoLocate}
                disabled={loading}
                className="text-primary text-sm hover:underline disabled:opacity-50"
              >
                {loading ? '获取中...' : '重新获取'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAutoLocate}
              disabled={loading}
              className="w-full py-4 glass hover:bg-white/10 rounded-xl transition flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-white/70">获取中...</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="text-white">点击获取当前位置</span>
                </>
              )}
            </button>
          )}
          <p className="text-white/40 text-xs mt-2 text-center">
            定位仅精确到县市级别，不会暴露具体地址
          </p>
        </div>
      ) : (
        // 手动选择模式
        <div className="space-y-3">
          {/* 国家选择 */}
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-4 py-3 input-modern rounded-xl text-white outline-none appearance-none cursor-pointer"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c} className="bg-dark">
                {c}
              </option>
            ))}
          </select>

          {/* 中国省市选择 */}
          {country === '中国' && (
            <div className="grid grid-cols-2 gap-3">
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="px-4 py-3 input-modern rounded-xl text-white outline-none appearance-none cursor-pointer"
              >
                <option value="" className="bg-dark">选择省份</option>
                {provinces.map((p) => (
                  <option key={p} value={p} className="bg-dark">
                    {p}
                  </option>
                ))}
              </select>

              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!province || cities.length === 0}
                className="px-4 py-3 input-modern rounded-xl text-white outline-none appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="" className="bg-dark">选择城市</option>
                {cities.map((c) => (
                  <option key={c} value={c} className="bg-dark">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 确认按钮 */}
          <button
            type="button"
            onClick={handleManualSelect}
            disabled={loading || !country || (country === '中国' && !province)}
            className="w-full py-3 btn-gradient rounded-xl font-medium text-white transition disabled:opacity-50"
          >
            {loading ? '确认中...' : '确认位置'}
          </button>

          {/* 已选择的位置显示 */}
          {value && (
            <div className="glass rounded-xl p-3 flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span className="text-sm text-white/80">
                已选择: {[value.district, value.city, value.province, value.country]
                  .filter(Boolean)
                  .filter((v, i, arr) => arr.indexOf(v) === i)
                  .join(', ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 错误提示 */}
      {displayError && (
        <div className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {displayError}
        </div>
      )}
    </div>
  )
}
