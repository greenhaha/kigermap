'use client'

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import type { KigurumiUser } from '@/types'
import type { Locale } from '@/lib/i18n'

interface MapProps {
  users: KigurumiUser[]
  onUserClick?: (user: KigurumiUser) => void
  selectedUser?: KigurumiUser | null
  center?: [number, number]
  zoom?: number
  searchQuery?: string
  locale?: Locale
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
  searchQuery = '',
  locale = 'zh'
}, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new globalThis.Map())
  const markerClusterRef = useRef<any>(null)
  const selectedMarkerRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)

  const MAX_ZOOM = 10  // 最大缩放到地级市级别
  const MIN_ZOOM = 3   // 最小缩放到国家级别

  useImperativeHandle(ref, () => ({
    flyToUser: (user: KigurumiUser) => {
      if (mapInstanceRef.current && user) {
        mapInstanceRef.current.flyTo([user.location.lat, user.location.lng], MAX_ZOOM, {
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

        // 根据语言选择地图图层
        // 使用简洁样式地图，只显示国家、省份、地级市标签，不显示乡镇、铁路等细节
        if (locale === 'zh') {
          // 高德地图简洁版 - style=7 是简洁样式，不显示POI和细节
          L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}', {
            maxZoom: MAX_ZOOM,
            subdomains: '1234',
          }).addTo(map)
        } else if (locale === 'ja') {
          // 日语使用 CartoDB Positron（简洁样式）
          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: MAX_ZOOM,
            subdomains: 'abcd',
          }).addTo(map)
        } else {
          // 英文及其他语言使用 CartoDB Positron（简洁样式，无铁路等细节）
          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: MAX_ZOOM,
            subdomains: 'abcd',
          }).addTo(map)
        }

        // 创建聚合图层 - 使用默认样式但自定义颜色
        markerClusterRef.current = (L as any).markerClusterGroup({
          maxClusterRadius: 50,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          disableClusteringAtZoom: MAX_ZOOM,  // 使用统一的最大缩放级别
          iconCreateFunction: (cluster: any) => {
            const count = cluster.getChildCount()
            let size = 36
            let fontSize = 12
            
            if (count >= 100) {
              size = 50
              fontSize = 14
            } else if (count >= 10) {
              size = 42
              fontSize = 13
            }
            
            return L.divIcon({
              html: `<div style="
                width: ${size}px;
                height: ${size}px;
                background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: ${fontSize}px;
                box-shadow: 0 4px 15px rgba(139, 92, 246, 0.5);
                border: 3px solid rgba(255,255,255,0.3);
              ">${count}</div>`,
              className: '',
              iconSize: [size, size],
              iconAnchor: [size / 2, size / 2],
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
  }, [locale])  // 当语言变化时重新初始化地图

  // 更新标记
  useEffect(() => {
    if (!isReady || !mapInstanceRef.current || !leafletRef.current || !markerClusterRef.current) return

    const L = leafletRef.current
    const map = mapInstanceRef.current
    const clusterGroup = markerClusterRef.current

    // 清除旧的选中标记
    if (selectedMarkerRef.current) {
      map.removeLayer(selectedMarkerRef.current)
      selectedMarkerRef.current = null
    }

    // 清除聚合图层
    clusterGroup.clearLayers()
    markersRef.current.clear()

    if (users.length === 0) return

    const createIcon = (photo: string, isSelected: boolean = false) => {
      const size = isSelected ? 56 : 44
      return L.divIcon({
        className: '',
        html: `<div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid ${isSelected ? '#EC4899' : '#8B5CF6'};
          box-shadow: 0 0 ${isSelected ? '25px' : '15px'} rgba(${isSelected ? '236, 72, 153' : '139, 92, 246'}, 0.6);
          overflow: hidden;
          background: #1E293B;
        ">
          <img src="${photo}" style="width: 100%; height: 100%; object-fit: cover;" 
            onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:20px\\'>🎭</div>'" />
        </div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      })
    }

    // 基于用户ID生成稳定的随机偏移（同一用户每次偏移相同）
    // 使用螺旋分布算法，让用户均匀分散在区域内
    const getStableOffset = (userId: string, index: number, totalInGroup: number) => {
      // 使用简单的哈希算法生成稳定的伪随机数
      let hash = 0
      for (let i = 0; i < userId.length; i++) {
        hash = ((hash << 5) - hash) + userId.charCodeAt(i)
        hash = hash & hash
      }
      
      // 使用螺旋分布 + 随机偏移，让分布更均匀
      const angle = (Math.abs(hash) % 360) * (Math.PI / 180)  // 基于hash的角度
      const radiusBase = 0.3  // 基础半径约 30km
      
      // 根据组内人数动态调整半径，人越多分布越广
      const radiusMultiplier = Math.min(1 + totalInGroup * 0.1, 2.5)
      const radius = radiusBase * radiusMultiplier * (0.5 + Math.abs(Math.sin(hash)) * 0.5)
      
      return {
        latOffset: Math.sin(angle) * radius,
        lngOffset: Math.cos(angle) * radius,
      }
    }

    // 按位置分组用户（使用较低精度的坐标作为分组键）
    const locationGroups = new globalThis.Map<string, typeof users>()
    users.forEach(user => {
      if (!user.location?.lat || !user.location?.lng) return
      // 使用 0.2 度精度分组（约 20km 范围）
      const groupKey = `${Math.round(user.location.lat * 5) / 5},${Math.round(user.location.lng * 5) / 5}`
      if (!locationGroups.has(groupKey)) {
        locationGroups.set(groupKey, [])
      }
      locationGroups.get(groupKey)!.push(user)
    })

    // 为每个分组中的用户添加随机偏移
    locationGroups.forEach((groupUsers) => {
      const needsSpread = groupUsers.length > 1  // 同一区域多于1人时需要分散
      const totalInGroup = groupUsers.length

      groupUsers.forEach((user, index) => {
        const isSelected = selectedUser?.id === user.id
        
        let lat = user.location.lat
        let lng = user.location.lng
        
        // 如果同一区域有多个用户，添加随机偏移分散显示
        if (needsSpread && !isSelected) {
          const offset = getStableOffset(user.id, index, totalInGroup)
          lat += offset.latOffset
          lng += offset.lngOffset
        }
        
        const marker = L.marker([lat, lng], {
          icon: createIcon(user.photos[0] || '', isSelected),
        })

        marker.bindPopup(createPopupContent(user), {
          className: 'custom-popup',
          closeButton: false,
          offset: [0, -20],
          maxWidth: 320,
          minWidth: 280,
        })

        marker.on('click', () => onUserClick?.(user))
        
        if (isSelected) {
          // 选中的用户单独显示在地图上，不加入聚合，使用原始位置
          const selectedMarker = L.marker([user.location.lat, user.location.lng], {
            icon: createIcon(user.photos[0] || '', true),
          })
          selectedMarker.bindPopup(createPopupContent(user), {
            className: 'custom-popup',
            closeButton: false,
            offset: [0, -20],
            maxWidth: 320,
            minWidth: 280,
          })
          selectedMarker.on('click', () => onUserClick?.(user))
          selectedMarker.addTo(map)
          selectedMarkerRef.current = selectedMarker
          markersRef.current.set(user.id, selectedMarker)
        } else {
          clusterGroup.addLayer(marker)
          markersRef.current.set(user.id, marker)
        }
      })
    })
  }, [isReady, users, selectedUser, onUserClick])

  // 选中用户时自动定位
  useEffect(() => {
    if (!isReady || !mapInstanceRef.current || !selectedUser) return

    mapInstanceRef.current.flyTo([selectedUser.location.lat, selectedUser.location.lng], MAX_ZOOM, {
      duration: 1,
    })

    const marker = markersRef.current.get(selectedUser.id)
    if (marker) {
      setTimeout(() => marker.openPopup(), 500)
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
    <img src="${photo}" alt="${user.cnName}" class="popup-slide ${index === 0 ? 'active' : ''}" />
  `).join('')

  const dotsHtml = hasMultiplePhotos ? `
    <div class="popup-dots">
      ${user.photos.map((_, index) => `<span class="popup-dot ${index === 0 ? 'active' : ''}"></span>`).join('')}
    </div>
  ` : ''

  const arrowsHtml = hasMultiplePhotos ? `
    <button class="popup-arrow popup-arrow-left" onclick="window.popupSlider('${uniqueId}', -1)">‹</button>
    <button class="popup-arrow popup-arrow-right" onclick="window.popupSlider('${uniqueId}', 1)">›</button>
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
          <span class="popup-location">📍 ${location}</span>
        </div>
        <p class="popup-intro">${user.introduction}</p>
        <a href="/profile/${user.shareCode}" class="popup-btn">查看主页</a>
      </div>
    </div>
  `
}

export default Map
