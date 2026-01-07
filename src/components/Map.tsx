'use client'

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import type { KigurumiUser } from '@/types'

interface MapProps {
  users: KigurumiUser[]
  onUserClick?: (user: KigurumiUser) => void
  selectedUser?: KigurumiUser | null
  center?: [number, number]
  zoom?: number
}

export interface MapRef {
  flyToUser: (user: KigurumiUser) => void
  closePopup: () => void
}

const Map = forwardRef<MapRef, MapProps>(({ 
  users, 
  onUserClick, 
  selectedUser,
  center = [35, 105], 
  zoom = 4 
}, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new globalThis.Map())
  const leafletRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)

  useImperativeHandle(ref, () => ({
    flyToUser: (user: KigurumiUser) => {
      if (mapInstanceRef.current && user) {
        mapInstanceRef.current.flyTo([user.location.lat, user.location.lng], 12, {
          duration: 1.5,
          easeLinearity: 0.25
        })
        const marker = markersRef.current.get(user.id)
        if (marker) {
          setTimeout(() => marker.openPopup(), 800)
        }
      }
    },
    closePopup: () => {
      mapInstanceRef.current?.closePopup()
    }
  }))

  // 初始化地图
  useEffect(() => {
    if (!mapContainerRef.current) return
    
    // 如果已经有地图实例，跳过
    if (mapInstanceRef.current) return
    
    // 检查 DOM 是否已被 Leaflet 初始化
    const container = mapContainerRef.current
    if ((container as any)._leaflet_id) {
      // 清除旧的 leaflet id
      delete (container as any)._leaflet_id
    }

    // 注册全局轮播函数
    ;(window as any).popupSlider = (popupId: string, direction: number) => {
      const popup = document.getElementById(popupId)
      if (!popup) return
      const slider = popup.querySelector('.popup-slider') as HTMLElement
      if (!slider) return
      const current = parseInt(slider.dataset.current || '0')
      const total = parseInt(slider.dataset.total || '1')
      let next = current + direction
      if (next < 0) next = total - 1
      if (next >= total) next = 0
      const slides = slider.querySelectorAll('.popup-slide')
      slides.forEach((slide, i) => slide.classList.toggle('active', i === next))
      const dots = popup.querySelectorAll('.popup-dot')
      dots.forEach((dot, i) => dot.classList.toggle('active', i === next))
      slider.dataset.current = next.toString()
    }

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default
        
        // 修复 Leaflet 默认图标路径问题
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })
        
        leafletRef.current = L

        const map = L.map(container, {
          center,
          zoom,
          zoomControl: false,
          attributionControl: false,
        })

        L.control.zoom({ position: 'bottomright' }).addTo(map)

        const lang = navigator.language || 'en'
        const isChinese = lang.startsWith('zh')

        if (isChinese) {
          L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}', {
            maxZoom: 18,
            subdomains: '1234',
          }).addTo(map)
        } else {
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
            maxZoom: 18,
            subdomains: 'abcd',
          }).addTo(map)
        }

        mapInstanceRef.current = map
        setIsReady(true)
      } catch (err) {
        console.error('Map init error:', err)
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      setIsReady(false)
    }
  }, [])

  // 更新标记
  useEffect(() => {
    if (!isReady || !mapInstanceRef.current || !leafletRef.current) return

    const L = leafletRef.current
    const map = mapInstanceRef.current

    // 清除旧标记
    markersRef.current.forEach(m => m.remove())
    markersRef.current.clear()

    if (users.length === 0) return

    const createIcon = (photo: string, isSelected: boolean = false) => L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: ${isSelected ? '56px' : '48px'};
          height: ${isSelected ? '56px' : '48px'};
          border-radius: 50%;
          border: 3px solid ${isSelected ? '#EC4899' : '#8B5CF6'};
          box-shadow: 0 0 ${isSelected ? '30px' : '20px'} rgba(${isSelected ? '236, 72, 153' : '139, 92, 246'}, ${isSelected ? '0.8' : '0.5'}), 0 4px 12px rgba(0,0,0,0.3);
          overflow: hidden;
          background: #1E293B;
          cursor: pointer;
          transition: all 0.3s ease;
          transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
        ">
          <img src="${photo}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%231E293B%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22white%22 font-size=%2240%22>🎭</text></svg>'" />
        </div>
      `,
      iconSize: [isSelected ? 56 : 48, isSelected ? 56 : 48],
      iconAnchor: [isSelected ? 28 : 24, isSelected ? 28 : 24],
    })

    users.forEach(user => {
      if (!user.location?.lat || !user.location?.lng) return
      
      const isSelected = selectedUser?.id === user.id
      const marker = L.marker([user.location.lat, user.location.lng], {
        icon: createIcon(user.photos[0] || '', isSelected),
        zIndexOffset: isSelected ? 1000 : 0
      }).addTo(map)

      marker.bindPopup(createPopupContent(user), {
        className: 'custom-popup',
        closeButton: false,
        offset: [0, -20],
        maxWidth: 320,
        minWidth: 280,
      })

      marker.on('click', () => onUserClick?.(user))
      markersRef.current.set(user.id, marker)
    })
  }, [isReady, users, selectedUser, onUserClick])

  // 选中用户时自动定位
  useEffect(() => {
    if (!isReady || !mapInstanceRef.current || !selectedUser) return

    mapInstanceRef.current.flyTo([selectedUser.location.lat, selectedUser.location.lng], 12, {
      duration: 1.2,
      easeLinearity: 0.25
    })

    const marker = markersRef.current.get(selectedUser.id)
    if (marker) {
      setTimeout(() => marker.openPopup(), 600)
    }
  }, [isReady, selectedUser])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-light">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-white/50 text-sm">加载地图中...</p>
          </div>
        </div>
      )}
    </div>
  )
})

Map.displayName = 'Map'

function createPopupContent(user: KigurumiUser): string {
  const location = user.location.province || user.location.country
  const uniqueId = `popup-${user.id}`
  const hasMultiplePhotos = user.photos.length > 1

  const photosHtml = user.photos.map((photo, index) => `
    <img src="${photo}" alt="${user.cnName}" class="popup-slide ${index === 0 ? 'active' : ''}" data-index="${index}" />
  `).join('')

  const dotsHtml = hasMultiplePhotos ? `
    <div class="popup-dots">
      ${user.photos.map((_, index) => `<span class="popup-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></span>`).join('')}
    </div>
  ` : ''

  const arrowsHtml = hasMultiplePhotos ? `
    <button class="popup-arrow popup-arrow-left" onclick="window.popupSlider('${uniqueId}', -1)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
    </button>
    <button class="popup-arrow popup-arrow-right" onclick="window.popupSlider('${uniqueId}', 1)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
    </button>
  ` : ''

  return `
    <div class="user-popup-card" id="${uniqueId}">
      <div class="popup-photo">
        <div class="popup-slider" data-current="0" data-total="${user.photos.length}">${photosHtml}</div>
        ${arrowsHtml}
        ${dotsHtml}
      </div>
      <div class="popup-info">
        <div class="popup-header">
          <h3 class="popup-name">${user.cnName}</h3>
          <span class="popup-location">${location}</span>
        </div>
        <p class="popup-intro">${user.introduction}</p>
        <a href="/profile/${user.shareCode}" class="popup-btn">查看主页</a>
      </div>
    </div>
  `
}

export default Map
