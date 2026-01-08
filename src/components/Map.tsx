'use client'

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import type { KigurumiUser } from '@/types'

interface MapProps {
  users: KigurumiUser[]
  onUserClick?: (user: KigurumiUser) => void
  selectedUser?: KigurumiUser | null
  center?: [number, number]
  zoom?: number
  searchQuery?: string
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
  zoom = 4,
  searchQuery = ''
}, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new globalThis.Map())
  const markerClusterRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)

  // 最大缩放级别（县级市约为 12-13）
  const MAX_ZOOM = 13
  const MIN_ZOOM = 2

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
    if (mapInstanceRef.current) return
    
    const container = mapContainerRef.current
    if ((container as any)._leaflet_id) {
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
        await import('leaflet.markercluster')
        
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
          minZoom: MIN_ZOOM,
          maxZoom: MAX_ZOOM,
        })

        L.control.zoom({ position: 'bottomright' }).addTo(map)

        const lang = navigator.language || 'en'
        const isChinese = lang.startsWith('zh')

        if (isChinese) {
          L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}', {
            maxZoom: MAX_ZOOM,
            subdomains: '1234',
          }).addTo(map)
        } else {
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
            maxZoom: MAX_ZOOM,
            subdomains: 'abcd',
          }).addTo(map)
        }

        // 创建聚合图层
        markerClusterRef.current = (L as any).markerClusterGroup({
          maxClusterRadius: 60,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          disableClusteringAtZoom: 11,
          iconCreateFunction: (cluster: any) => {
            const count = cluster.getChildCount()
            let size = 'small'
            let sizeClass = 40
            
            if (count >= 100) {
              size = 'large'
              sizeClass = 56
            } else if (count >= 10) {
              size = 'medium'
              sizeClass = 48
            }
            
            return L.divIcon({
              html: `
                <div class="cluster-marker cluster-${size}">
                  <span>${count}</span>
                </div>
              `,
              className: 'custom-cluster-icon',
              iconSize: [sizeClass, sizeClass],
              iconAnchor: [sizeClass / 2, sizeClass / 2],
            })
          }
        })

        map.addLayer(markerClusterRef.current)
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
      markerClusterRef.current = null
      setIsReady(false)
    }
  }, [])

  // 更新标记
  useEffect(() => {
    if (!isReady || !mapInstanceRef.current || !leafletRef.current || !markerClusterRef.current) return

    const L = leafletRef.current
    const clusterGroup = markerClusterRef.current

    // 清除旧标记
    clusterGroup.clearLayers()
    markersRef.current.clear()

    if (users.length === 0) return

    const createIcon = (photo: string, isSelected: boolean = false, isHighlighted: boolean = false) => L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: ${isSelected ? '56px' : '48px'};
          height: ${isSelected ? '56px' : '48px'};
          border-radius: 50%;
          border: 3px solid ${isHighlighted ? '#10B981' : isSelected ? '#EC4899' : '#8B5CF6'};
          box-shadow: 0 0 ${isSelected || isHighlighted ? '30px' : '20px'} rgba(${isHighlighted ? '16, 185, 129' : isSelected ? '236, 72, 153' : '139, 92, 246'}, ${isSelected || isHighlighted ? '0.8' : '0.5'}), 0 4px 12px rgba(0,0,0,0.3);
          overflow: hidden;
          background: #1E293B;
          cursor: pointer;
          transition: all 0.3s ease;
          transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
          ${isHighlighted ? 'animation: pulse 2s infinite;' : ''}
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
      const isHighlighted = !!(searchQuery && user.cnName.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const marker = L.marker([user.location.lat, user.location.lng], {
        icon: createIcon(user.photos[0] || '', isSelected, isHighlighted),
        zIndexOffset: isSelected ? 1000 : isHighlighted ? 500 : 0
      })

      marker.bindPopup(createPopupContent(user), {
        className: 'custom-popup',
        closeButton: false,
        offset: [0, -20],
        maxWidth: 320,
        minWidth: 280,
      })

      marker.on('click', () => onUserClick?.(user))
      
      // 选中的用户不加入聚合，直接显示
      if (isSelected) {
        marker.addTo(mapInstanceRef.current)
      } else {
        clusterGroup.addLayer(marker)
      }
      
      markersRef.current.set(user.id, marker)
    })
  }, [isReady, users, selectedUser, searchQuery, onUserClick])

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
      
      {/* 聚合图例 */}
      <div className="absolute bottom-20 left-3 glass-dark rounded-lg px-3 py-2 text-xs text-white/60 hidden sm:block">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <span>单个成员</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[8px] text-white font-bold">N</div>
          <span>聚合显示</span>
        </div>
      </div>
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
