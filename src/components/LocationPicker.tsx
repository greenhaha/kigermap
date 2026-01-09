'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  LocationInfo, 
  getSmartLocation,
  COUNTRIES,
  getProvinces,
  getCities,
  normalizeProvince,
  normalizeCountry
} from '@/lib/location'

// 主要城市的预设坐标
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  '北京': { lat: 39.9, lng: 116.4 },
  '上海': { lat: 31.2, lng: 121.5 },
  '广州': { lat: 23.1, lng: 113.3 },
  '深圳': { lat: 22.5, lng: 114.1 },
  '成都': { lat: 30.7, lng: 104.1 },
  '杭州': { lat: 30.3, lng: 120.2 },
  '武汉': { lat: 30.6, lng: 114.3 },
  '西安': { lat: 34.3, lng: 108.9 },
  '南京': { lat: 32.1, lng: 118.8 },
  '重庆': { lat: 29.6, lng: 106.5 },
  '天津': { lat: 39.1, lng: 117.2 },
  '苏州': { lat: 31.3, lng: 120.6 },
  '大连': { lat: 38.9, lng: 121.6 },
  '青岛': { lat: 36.1, lng: 120.4 },
  '厦门': { lat: 24.5, lng: 118.1 },
  '沈阳': { lat: 41.8, lng: 123.4 },
  '长沙': { lat: 28.2, lng: 113.0 },
  '郑州': { lat: 34.8, lng: 113.7 },
}

// 省份中心坐标
const PROVINCE_COORDS: Record<string, { lat: number; lng: number }> = {
  '北京': { lat: 39.9, lng: 116.4 },
  '天津': { lat: 39.1, lng: 117.2 },
  '上海': { lat: 31.2, lng: 121.5 },
  '重庆': { lat: 29.6, lng: 106.5 },
  '河北': { lat: 38.0, lng: 114.5 },
  '山西': { lat: 37.9, lng: 112.5 },
  '辽宁': { lat: 41.8, lng: 123.4 },
  '吉林': { lat: 43.9, lng: 125.3 },
  '黑龙江': { lat: 45.8, lng: 126.5 },
  '江苏': { lat: 32.1, lng: 118.8 },
  '浙江': { lat: 30.3, lng: 120.2 },
  '安徽': { lat: 31.9, lng: 117.3 },
  '福建': { lat: 26.1, lng: 119.3 },
  '江西': { lat: 28.7, lng: 115.9 },
  '山东': { lat: 36.7, lng: 117.0 },
  '河南': { lat: 34.8, lng: 113.7 },
  '湖北': { lat: 30.6, lng: 114.3 },
  '湖南': { lat: 28.2, lng: 113.0 },
  '广东': { lat: 23.1, lng: 113.3 },
  '海南': { lat: 20.0, lng: 110.3 },
  '四川': { lat: 30.7, lng: 104.1 },
  '贵州': { lat: 26.6, lng: 106.7 },
  '云南': { lat: 25.0, lng: 102.7 },
  '陕西': { lat: 34.3, lng: 108.9 },
  '甘肃': { lat: 36.1, lng: 103.8 },
  '青海': { lat: 36.6, lng: 101.8 },
  '台湾': { lat: 25.0, lng: 121.5 },
  '内蒙古': { lat: 40.8, lng: 111.7 },
  '广西': { lat: 22.8, lng: 108.3 },
  '西藏': { lat: 29.7, lng: 91.1 },
  '宁夏': { lat: 38.5, lng: 106.3 },
  '新疆': { lat: 43.8, lng: 87.6 },
  '香港': { lat: 22.3, lng: 114.2 },
  '澳门': { lat: 22.2, lng: 113.5 },
}

interface LocationPickerProps {
  value: LocationInfo | null
  onChange: (location: LocationInfo | null) => void
  error?: string
}

type Mode = 'auto' | 'manual' | 'map'

export default function LocationPicker({ value, onChange, error }: LocationPickerProps) {
  const [mode, setMode] = useState<Mode>('auto')
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState('')
  const [showMapModal, setShowMapModal] = useState(false)
  
  // 手动选择
  const [country, setCountry] = useState(value?.country || '中国')
  const [province, setProvince] = useState(value?.province || '')
  const [city, setCity] = useState(value?.city || '')
  
  // 地图选点临时数据
  const [tempLocation, setTempLocation] = useState<LocationInfo | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  
  const provinces = getProvinces()
  const cities = province ? getCities(province) : []

  // 当 value 变化时同步到本地状态
  useEffect(() => {
    if (value) {
      setCountry(value.country || '中国')
      setProvince(value.province || '')
      setCity(value.city || '')
    }
  }, [value])

  // 自动获取位置
  const handleAutoLocate = async () => {
    setLoading(true)
    setLocalError('')
    
    try {
      const result = await Promise.race([
        getSmartLocation(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000))
      ])
      
      if (result) {
        // 标准化并只保留到地级市
        const normalized: LocationInfo = {
          lat: result.lat,
          lng: result.lng,
          country: normalizeCountry(result.country),
          province: normalizeProvince(result.province || ''),
          city: result.city || '',
        }
        onChange(normalized)
        setCountry(normalized.country)
        setProvince(normalized.province || '')
        setCity(normalized.city || '')
      } else {
        setLocalError('定位超时，请使用地图选点或手动选择')
      }
    } catch {
      setLocalError('定位失败，请使用地图选点或手动选择')
    } finally {
      setLoading(false)
    }
  }

  // 手动选择确认
  const handleManualSelect = () => {
    if (!country) {
      setLocalError('请选择国家')
      return
    }
    if (country === '中国' && !province) {
      setLocalError('请选择省份')
      return
    }

    setLocalError('')
    
    let coords = city ? CITY_COORDS[city] : null
    if (!coords && province) coords = PROVINCE_COORDS[province]
    if (!coords) coords = { lat: 35, lng: 105 }
    
    const offset = () => (Math.random() - 0.5) * 0.1
    
    onChange({
      lat: Math.round((coords.lat + offset()) * 100) / 100,
      lng: Math.round((coords.lng + offset()) * 100) / 100,
      country,
      province: province || undefined,
      city: city || undefined,
    })
  }

  // 打开地图弹窗
  const openMapModal = () => {
    setTempLocation(null)
    setShowMapModal(true)
  }

  // 初始化地图弹窗中的地图
  useEffect(() => {
    if (!showMapModal || !mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      const L = (await import('leaflet')).default
      
      const map = L.map(mapRef.current!, {
        center: value ? [value.lat, value.lng] : [35, 105],
        zoom: value ? 8 : 4,
        zoomControl: true,
        minZoom: 3,
        maxZoom: 10,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 10,
        subdomains: 'abcd',
      }).addTo(map)

      // 点击地图获取位置
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng
        
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng], {
            icon: L.divIcon({
              className: '',
              html: `<div style="width:40px;height:40px;background:linear-gradient(135deg,#8B5CF6,#EC4899);border-radius:50%;border:3px solid white;box-shadow:0 4px 15px rgba(139,92,246,0.5);display:flex;align-items:center;justify-content:center;">📍</div>`,
              iconSize: [40, 40],
              iconAnchor: [20, 20],
            })
          }).addTo(map)
        }

        // 反向地理编码获取地址（只到地级市）
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=zh-CN&addressdetails=1&zoom=8`,
            { headers: { 'User-Agent': 'KigurumiMap/1.0' } }
          )
          if (res.ok) {
            const data = await res.json()
            const addr = data.address || {}
            setTempLocation({
              lat: Math.round(lat * 100) / 100,
              lng: Math.round(lng * 100) / 100,
              country: normalizeCountry(addr.country || '未知'),
              province: normalizeProvince(addr.state || addr.province || ''),
              city: addr.city || addr.municipality || '',
            })
          } else {
            setTempLocation({
              lat: Math.round(lat * 100) / 100,
              lng: Math.round(lng * 100) / 100,
              country: '未知',
              province: '',
              city: '',
            })
          }
        } catch {
          setTempLocation({
            lat: Math.round(lat * 100) / 100,
            lng: Math.round(lng * 100) / 100,
            country: '未知',
            province: '',
            city: '',
          })
        }
      })

      mapInstanceRef.current = map
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [showMapModal])

  // 确认地图选点
  const handleMapConfirm = () => {
    if (!tempLocation) {
      setLocalError('请在地图上点击选择位置')
      return
    }
    onChange(tempLocation)
    setCountry(tempLocation.country)
    setProvince(tempLocation.province || '')
    setCity(tempLocation.city || '')
    setShowMapModal(false)
  }

  // 省份变化时清空城市
  useEffect(() => { setCity('') }, [province])
  
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
          className={`flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm transition ${
            mode === 'auto' ? 'bg-primary/20 text-primary border border-primary/30' : 'glass text-white/60 hover:text-white'
          }`}
        >
          📍 自动
        </button>
        <button
          type="button"
          onClick={() => { setMode('map'); openMapModal() }}
          className={`flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm transition ${
            mode === 'map' ? 'bg-primary/20 text-primary border border-primary/30' : 'glass text-white/60 hover:text-white'
          }`}
        >
          🗺️ 地图选点
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={`flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm transition ${
            mode === 'manual' ? 'bg-primary/20 text-primary border border-primary/30' : 'glass text-white/60 hover:text-white'
          }`}
        >
          ✏️ 手动
        </button>
      </div>

      {/* 已选择的位置显示 */}
      {value && (
        <div className="glass rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">
              {[value.city, value.province, value.country].filter(Boolean).join(', ')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-white/40 hover:text-white/70 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 自动定位 */}
      {mode === 'auto' && !value && (
        <button
          type="button"
          onClick={handleAutoLocate}
          disabled={loading}
          className="w-full py-4 glass hover:bg-white/10 rounded-xl transition flex flex-col items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-white/70 text-sm">正在获取位置...</span>
            </>
          ) : (
            <>
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="text-white font-medium">点击自动获取位置</span>
            </>
          )}
        </button>
      )}

      {/* 手动选择 */}
      {mode === 'manual' && (
        <div className="space-y-3">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-4 py-2.5 input-modern rounded-xl text-white text-sm outline-none appearance-none cursor-pointer"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c} className="bg-dark">{c}</option>
            ))}
          </select>

          {country === '中国' && (
            <div className="grid grid-cols-2 gap-2">
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="px-3 py-2.5 input-modern rounded-xl text-white text-sm outline-none appearance-none cursor-pointer"
              >
                <option value="" className="bg-dark">选择省份</option>
                {provinces.map((p) => (
                  <option key={p} value={p} className="bg-dark">{p}</option>
                ))}
              </select>

              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!province || cities.length === 0}
                className="px-3 py-2.5 input-modern rounded-xl text-white text-sm outline-none appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="" className="bg-dark">选择城市</option>
                {cities.map((c) => (
                  <option key={c} value={c} className="bg-dark">{c}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={handleManualSelect}
            disabled={!country || (country === '中国' && !province)}
            className="w-full py-2.5 btn-gradient rounded-xl text-sm font-medium disabled:opacity-50"
          >
            确认位置
          </button>
        </div>
      )}

      {/* 地图选点提示 */}
      {mode === 'map' && !value && (
        <button
          type="button"
          onClick={openMapModal}
          className="w-full py-4 glass hover:bg-white/10 rounded-xl transition flex flex-col items-center justify-center gap-2"
        >
          <span className="text-2xl">🗺️</span>
          <span className="text-white font-medium">点击打开地图选点</span>
        </button>
      )}

      {displayError && (
        <div className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-xs">
          {displayError}
        </div>
      )}

      {/* 地图弹窗 */}
      {showMapModal && (
        <div className="fixed inset-0 bg-dark/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setShowMapModal(false)}>
          <div className="w-full max-w-2xl glass-dark rounded-2xl overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold text-white">选择位置</h3>
              <button onClick={() => setShowMapModal(false)} className="w-8 h-8 rounded-full glass flex items-center justify-center text-white/60 hover:text-white">
                ✕
              </button>
            </div>
            <div ref={mapRef} className="w-full h-80 sm:h-96" style={{ background: '#1E293B' }} />
            <div className="p-4 space-y-3">
              {tempLocation ? (
                <div className="glass rounded-xl p-3 flex items-center gap-3">
                  <span className="text-lg">📍</span>
                  <span className="text-sm text-white">
                    {[tempLocation.city, tempLocation.province, tempLocation.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              ) : (
                <p className="text-center text-white/50 text-sm">点击地图选择位置</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMapModal(false)}
                  className="flex-1 py-2.5 glass rounded-xl text-sm text-white/70 hover:text-white"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleMapConfirm}
                  disabled={!tempLocation}
                  className="flex-1 py-2.5 btn-gradient rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  确认选择
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
