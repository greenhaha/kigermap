import { NextRequest, NextResponse } from 'next/server'

// 使用 Web服务 Key（不是 Web端 Key）
const AMAP_SERVER_KEY = process.env.AMAP_SERVER_KEY || ''

// 省份名称标准化
function normalizeProvince(province: string): string {
  if (!province) return ''
  return province.replace(/省|市|自治区|特别行政区|壮族|回族|维吾尔/g, '').trim()
}

// 城市名称标准化
function normalizeCity(city: string): string {
  if (!city) return ''
  return city.replace(/市|区|县|自治州|地区/g, '').trim()
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lng = searchParams.get('lng')
  const lat = searchParams.get('lat')
  const address = searchParams.get('address')

  try {
    // 反向地理编码（坐标转地址）
    if (lng && lat) {
      // 优先使用高德地图 API
      if (AMAP_SERVER_KEY) {
        try {
          const res = await fetch(
            `https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_SERVER_KEY}&location=${lng},${lat}&extensions=base`,
            { next: { revalidate: 3600 } } // 缓存1小时
          )
          const data = await res.json()
          console.log('Amap response:', JSON.stringify(data))
          
          if (data.status === '1' && data.regeocode) {
            const addr = data.regeocode.addressComponent || {}
            // 高德返回的省份可能是数组或字符串
            let province = Array.isArray(addr.province) ? addr.province[0] : (addr.province || '')
            let city = Array.isArray(addr.city) ? addr.city[0] : (addr.city || '')
            let district = Array.isArray(addr.district) ? addr.district[0] : (addr.district || '')
            
            // 直辖市特殊处理：省份就是城市
            if (!city && province) {
              const directCities = ['北京', '上海', '天津', '重庆']
              if (directCities.some(d => province.includes(d))) {
                city = district || province
              }
            }
            
            return NextResponse.json({
              status: '1',
              regeocode: {
                addressComponent: {
                  country: addr.country || '中国',
                  province: normalizeProvince(province),
                  city: normalizeCity(city || district),
                  district: normalizeCity(district)
                }
              }
            })
          }
        } catch (e) {
          console.error('Amap API error:', e)
        }
      }
      
      // 备用：使用 Nominatim
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=zh-CN&addressdetails=1&zoom=10`,
          { 
            headers: { 'User-Agent': 'KigurumiMap/1.0' },
            next: { revalidate: 3600 }
          }
        )
        if (res.ok) {
          const data = await res.json()
          console.log('Nominatim response:', JSON.stringify(data))
          const addr = data.address || {}
          
          let province = addr.state || addr.province || addr.region || ''
          let city = addr.city || addr.town || addr.municipality || addr.county || ''
          let country = addr.country || '中国'
          
          // 标准化国家名称
          if (country.includes('China') || country.includes('中国') || country === '中华人民共和国') {
            country = '中国'
          }
          
          return NextResponse.json({
            status: '1',
            regeocode: {
              addressComponent: { 
                country, 
                province: normalizeProvince(province), 
                city: normalizeCity(city), 
                district: addr.county || '' 
              }
            }
          })
        }
      } catch (e) {
        console.error('Nominatim API error:', e)
      }
      
      return NextResponse.json({ status: '0', error: '地理编码失败' })
    }

    // 正向地理编码（地址转坐标）
    if (address) {
      if (AMAP_SERVER_KEY) {
        try {
          const res = await fetch(
            `https://restapi.amap.com/v3/geocode/geo?key=${AMAP_SERVER_KEY}&address=${encodeURIComponent(address)}`
          )
          const data = await res.json()
          if (data.status === '1') {
            return NextResponse.json(data)
          }
        } catch (e) {
          console.error('Amap geocode error:', e)
        }
      }
      
      // 备用：使用 Nominatim
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&accept-language=zh-CN&limit=1`,
          { headers: { 'User-Agent': 'KigurumiMap/1.0' } }
        )
        if (res.ok) {
          const data = await res.json()
          if (data.length > 0) {
            return NextResponse.json({
              status: '1',
              geocodes: [{ location: `${data[0].lon},${data[0].lat}` }]
            })
          }
        }
      } catch (e) {
        console.error('Nominatim geocode error:', e)
      }
      
      return NextResponse.json({ status: '0', error: '地理编码失败' })
    }

    return NextResponse.json({ error: '缺少参数' }, { status: 400 })
  } catch (error) {
    console.error('Geocode API error:', error)
    return NextResponse.json({ error: '地理编码服务错误' }, { status: 500 })
  }
}
