'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  LocationInfo, 
  getSmartLocation,
  COUNTRIES,
  getProvinces,
  getCities 
} from '@/lib/location'

// 主要城市的预设坐标（用于手动选择时快速获取）
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
  '东京': { lat: 35.7, lng: 139.7 },
  '大阪': { lat: 34.7, lng: 135.5 },
  '首尔': { lat: 37.6, lng: 127.0 },
  '纽约': { lat: 40.7, lng: -74.0 },
  '洛杉矶': { lat: 34.1, lng: -118.2 },
  '伦敦': { lat: 51.5, lng: -0.1 },
  '巴黎': { lat: 48.9, lng: 2.4 },
  '悉尼': { lat: -33.9, lng: 151.2 },
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
  
  // 手动选择
  const [country, setCountry] = useState('中国')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  
  // 地图选点
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  
  const provinces = getProvinces()
  const cities = province ? getCities(province) : []

  // 自动获取位置 - 优化超时
  const handleAutoLocate = async () => {
    setLoading(true)
    setLocalError('')
    
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 10000) // 10秒超时
    })
    
    try {
      const result = await Promise.race([getSmartLocation(), timeoutPromise])
      
      if (result) {
        onChange(result)
        setCountry(result.country || '中国')
        setProvince(result.province || '')
        setCity(result.city || '')
      } else {
        setLocalError('定位超时，请使用地图选点或手动选择')
        setMode('map')
      }
    } catch {
      setLocalError('定位失败，请使用地图选点或手动选择')
      setMode('map')
    } finally {
      setLoading(false)
    }
  }

  // 手动选择 - 使用预设坐标，不调用外部API
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
    
    // 获取坐标：优先城市 > 省份 > 随机
    let coords = city ? CITY_COORDS[city] : null
    if (!coords && province) {
      coords = PROVINCE_COORDS[province]
    }
    if (!coords) {
      // 默认中国中心 + 随机偏移
      coords = { lat: 35 + (Math.random() - 0.5) * 10, lng: 105 + (Math.random() - 0.5) * 20 }
    }
    
    // 添加随机偏移保护隐私（约 ±5km）
    const offset = () => (Math.random() - 0.5) * 0.1
    
    onChange({
      lat: Math.round((coords.lat + offset()) * 100) / 100,
      lng: Math.round((coords.lng + offset()) * 100) / 100,
      country,
      province: province || undefined,
      city: city || undefined,
    })
  }

  // 初始化地图选点
  useEffect(() => {
    if (mode !== 'map' || !mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      const L = (await import('leaflet')).default
      
      const MAX_ZOOM = 10  // 最大缩放到地级市级别
      const MIN_ZOOM = 3   // 最小缩放到国家级别
      
      const map = L.map(mapRef.current!, {
        center: mapCoords ? [mapCoords.lat, mapCoords.lng] : [35, 105],
        zoom: 4,
        zoomControl: true,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
      })

      // 使用简洁地图样式，不显示乡镇、铁路等细节
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: MAX_ZOOM,
        subdomains: 'abcd',
      }).addTo(map)

      // 点击地图设置坐标
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng
        setMapCoords({ lat, lng })
        
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng], {
            icon: L.divIcon({
              className: '',
              html: `<div style="
                width: 40px; height: 40px; background: linear-gradient(135deg, #8B5CF6, #EC4899);
                border-radius: 50%; border: 3px solid white;
                box-shadow: 0 4px 15px rgba(139,92,246,0.5);
                display: flex; align-items: center; justify-content: center;
              ">📍</div>`,
              iconSize: [40, 40],
              iconAnchor: [20, 20],
            })
          }).addTo(map)
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
  }, [mode])

  // 确认地图选点
  const handleMapConfirm = () => {
    if (!mapCoords) {
      setLocalError('请在地图上点击选择位置')
      return
    }
    
    onChange({
      lat: Math.round(mapCoords.lat * 100) / 100,
      lng: Math.round(mapCoords.lng * 100) / 100,
      country: '中国',
      province: '',
      city: '',
    })
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
          className={`flex-1 py-2 px-2 rounded-lg text-xs sm:text-sm transition ${
            mode === 'auto' ? 'bg-primary/20 text-primary border border-primary/30' : 'glass text-white/60 hover:text-white'
          }`}
        >
          📍 自动
        </button>
        <button
          type="button"
          onClick={() => setMode('map')}
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
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">
              {[value.city, value.province, value.country].filter(Boolean).join(', ') || `${value.lat.toFixed(2)}, ${value.lng.toFixed(2)}`}
            </p>
          </div>
        </div>
      )}

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

      {mode === 'map' && (
        <div className="space-y-3">
          <div 
            ref={mapRef} 
            className="w-full h-48 rounded-xl overflow-hidden border border-white/10"
            style={{ background: '#1E293B' }}
          />
          <p className="text-xs text-white/50 text-center">点击地图选择你的位置</p>
          {mapCoords && (
            <button
              type="button"
              onClick={handleMapConfirm}
              className="w-full py-2.5 btn-gradient rounded-xl text-sm font-medium"
            >
              确认此位置
            </button>
          )}
        </div>
      )}

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

      {displayError && (
        <div className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-xs">
          {displayError}
        </div>
      )}
    </div>
  )
}
