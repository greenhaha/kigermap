export interface LocationInfo {
  lat: number
  lng: number
  country: string
  province?: string
  city?: string
  district?: string  // 区/县
}

// 获取用户位置（低精度，保护隐私）
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持定位'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,  // 不需要高精度
      timeout: 10000,
      maximumAge: 300000,
    })
  })
}

// IP 定位（不需要 HTTPS，精度较低但可作为备选）
export async function getLocationByIP(): Promise<LocationInfo | null> {
  try {
    // 使用免费的 IP 定位服务
    const res = await fetch('https://ipapi.co/json/')
    if (!res.ok) return null
    
    const data = await res.json()
    
    return {
      lat: data.latitude,
      lng: data.longitude,
      country: data.country_name || '未知',
      province: data.region || '',
      city: data.city || '',
    }
  } catch {
    return null
  }
}

// 智能获取位置：优先 GPS，失败则用 IP 定位
export async function getSmartLocation(): Promise<LocationInfo | null> {
  // 检查是否支持 GPS 且是安全上下文（HTTPS）
  const isSecureContext = typeof window !== 'undefined' && 
    (window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost')
  
  if (isSecureContext && navigator.geolocation) {
    try {
      const pos = await getCurrentPosition()
      const location = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
      return location
    } catch (e) {
      console.log('GPS 定位失败，尝试 IP 定位')
    }
  }
  
  // 降级到 IP 定位
  return getLocationByIP()
}

// 将坐标模糊化到县市级别（约 0.01 度 ≈ 1km）
export function fuzzyCoordinates(lat: number, lng: number): { lat: number; lng: number } {
  // 保留2位小数，大约精确到1公里范围
  // 并添加随机偏移，进一步保护隐私
  const offset = () => (Math.random() - 0.5) * 0.02  // ±1km 随机偏移
  return {
    lat: Math.round((lat + offset()) * 100) / 100,
    lng: Math.round((lng + offset()) * 100) / 100,
  }
}

// 反向地理编码 - 使用 Nominatim (免费，支持国内外)
export async function reverseGeocode(lat: number, lng: number): Promise<LocationInfo> {
  // 使用 zoom=10 获取城市级别信息
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=zh-CN&addressdetails=1&zoom=10`,
    { headers: { 'User-Agent': 'KigurumiMap/1.0' } }
  )
  
  if (!res.ok) throw new Error('地理编码失败')
  
  const data = await res.json()
  const addr = data.address || {}
  
  // 模糊化坐标
  const fuzzy = fuzzyCoordinates(lat, lng)
  
  // 解析城市 - Nominatim 对中国地址的字段映射
  // city: 地级市 (如 大连市)
  // county: 区/县 (如 甘井子区) 
  // state/province: 省份
  let city = addr.city || addr.municipality || addr.town || ''
  let district = addr.county || addr.district || addr.suburb || ''
  const province = addr.state || addr.province || ''
  
  // 对于直辖市特殊处理
  const isDirectCity = ['北京', '上海', '天津', '重庆'].some(d => province.includes(d))
  if (isDirectCity) {
    if (!city) city = province.replace('市', '')
  }
  
  // 如果 city 还是空的，再请求一次更高级别的信息
  if (!city && district) {
    try {
      const cityRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=zh-CN&addressdetails=1&zoom=8`,
        { headers: { 'User-Agent': 'KigurumiMap/1.0' } }
      )
      if (cityRes.ok) {
        const cityData = await cityRes.json()
        const cityAddr = cityData.address || {}
        city = cityAddr.city || cityAddr.municipality || cityAddr.town || ''
      }
    } catch {
      // 忽略错误
    }
  }

  return {
    lat: fuzzy.lat,
    lng: fuzzy.lng,
    country: addr.country || '未知',
    province: province,
    city: city,
    district: district,
  }
}

// 正向地理编码 - 根据地址获取坐标
export async function geocode(address: string): Promise<LocationInfo | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&accept-language=zh-CN&limit=1`,
    { headers: { 'User-Agent': 'KigurumiMap/1.0' } }
  )
  
  if (!res.ok) return null
  
  const data = await res.json()
  if (!data.length) return null
  
  const result = data[0]
  const lat = parseFloat(result.lat)
  const lng = parseFloat(result.lon)
  
  // 获取详细地址信息
  return reverseGeocode(lat, lng)
}

// 中国省份及其城市数据
export const CHINA_REGIONS: Record<string, string[]> = {
  '北京': ['北京市'],
  '天津': ['天津市'],
  '上海': ['上海市'],
  '重庆': ['重庆市'],
  '河北': ['石家庄', '唐山', '秦皇岛', '邯郸', '邢台', '保定', '张家口', '承德', '沧州', '廊坊', '衡水'],
  '山西': ['太原', '大同', '阳泉', '长治', '晋城', '朔州', '晋中', '运城', '忻州', '临汾', '吕梁'],
  '辽宁': ['沈阳', '大连', '鞍山', '抚顺', '本溪', '丹东', '锦州', '营口', '阜新', '辽阳', '盘锦', '铁岭', '朝阳', '葫芦岛'],
  '吉林': ['长春', '吉林', '四平', '辽源', '通化', '白山', '松原', '白城', '延边'],
  '黑龙江': ['哈尔滨', '齐齐哈尔', '鸡西', '鹤岗', '双鸭山', '大庆', '伊春', '佳木斯', '七台河', '牡丹江', '黑河', '绥化', '大兴安岭'],
  '江苏': ['南京', '无锡', '徐州', '常州', '苏州', '南通', '连云港', '淮安', '盐城', '扬州', '镇江', '泰州', '宿迁'],
  '浙江': ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '衢州', '舟山', '台州', '丽水'],
  '安徽': ['合肥', '芜湖', '蚌埠', '淮南', '马鞍山', '淮北', '铜陵', '安庆', '黄山', '滁州', '阜阳', '宿州', '六安', '亳州', '池州', '宣城'],
  '福建': ['福州', '厦门', '莆田', '三明', '泉州', '漳州', '南平', '龙岩', '宁德'],
  '江西': ['南昌', '景德镇', '萍乡', '九江', '新余', '鹰潭', '赣州', '吉安', '宜春', '抚州', '上饶'],
  '山东': ['济南', '青岛', '淄博', '枣庄', '东营', '烟台', '潍坊', '济宁', '泰安', '威海', '日照', '临沂', '德州', '聊城', '滨州', '菏泽'],
  '河南': ['郑州', '开封', '洛阳', '平顶山', '安阳', '鹤壁', '新乡', '焦作', '濮阳', '许昌', '漯河', '三门峡', '南阳', '商丘', '信阳', '周口', '驻马店'],
  '湖北': ['武汉', '黄石', '十堰', '宜昌', '襄阳', '鄂州', '荆门', '孝感', '荆州', '黄冈', '咸宁', '随州', '恩施', '仙桃', '潜江', '天门', '神农架'],
  '湖南': ['长沙', '株洲', '湘潭', '衡阳', '邵阳', '岳阳', '常德', '张家界', '益阳', '郴州', '永州', '怀化', '娄底', '湘西'],
  '广东': ['广州', '韶关', '深圳', '珠海', '汕头', '佛山', '江门', '湛江', '茂名', '肇庆', '惠州', '梅州', '汕尾', '河源', '阳江', '清远', '东莞', '中山', '潮州', '揭阳', '云浮'],
  '海南': ['海口', '三亚', '三沙', '儋州'],
  '四川': ['成都', '自贡', '攀枝花', '泸州', '德阳', '绵阳', '广元', '遂宁', '内江', '乐山', '南充', '眉山', '宜宾', '广安', '达州', '雅安', '巴中', '资阳', '阿坝', '甘孜', '凉山'],
  '贵州': ['贵阳', '六盘水', '遵义', '安顺', '毕节', '铜仁', '黔西南', '黔东南', '黔南'],
  '云南': ['昆明', '曲靖', '玉溪', '保山', '昭通', '丽江', '普洱', '临沧', '楚雄', '红河', '文山', '西双版纳', '大理', '德宏', '怒江', '迪庆'],
  '陕西': ['西安', '铜川', '宝鸡', '咸阳', '渭南', '延安', '汉中', '榆林', '安康', '商洛'],
  '甘肃': ['兰州', '嘉峪关', '金昌', '白银', '天水', '武威', '张掖', '平凉', '酒泉', '庆阳', '定西', '陇南', '临夏', '甘南'],
  '青海': ['西宁', '海东', '海北', '黄南', '海南', '果洛', '玉树', '海西'],
  '台湾': ['台北', '高雄', '台中', '台南', '新北', '桃园'],
  '内蒙古': ['呼和浩特', '包头', '乌海', '赤峰', '通辽', '鄂尔多斯', '呼伦贝尔', '巴彦淖尔', '乌兰察布', '兴安', '锡林郭勒', '阿拉善'],
  '广西': ['南宁', '柳州', '桂林', '梧州', '北海', '防城港', '钦州', '贵港', '玉林', '百色', '贺州', '河池', '来宾', '崇左'],
  '西藏': ['拉萨', '日喀则', '昌都', '林芝', '山南', '那曲', '阿里'],
  '宁夏': ['银川', '石嘴山', '吴忠', '固原', '中卫'],
  '新疆': ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博尔塔拉', '巴音郭楞', '阿克苏', '克孜勒苏', '喀什', '和田', '伊犁', '塔城', '阿勒泰'],
  '香港': ['香港'],
  '澳门': ['澳门'],
}

// 常用国家列表
export const COUNTRIES = [
  '中国',
  '日本',
  '韩国',
  '美国',
  '加拿大',
  '英国',
  '法国',
  '德国',
  '澳大利亚',
  '新西兰',
  '新加坡',
  '马来西亚',
  '泰国',
  '越南',
  '菲律宾',
  '印度尼西亚',
  '俄罗斯',
  '其他',
]

// 获取省份列表
export function getProvinces(): string[] {
  return Object.keys(CHINA_REGIONS)
}

// 获取城市列表
export function getCities(province: string): string[] {
  return CHINA_REGIONS[province] || []
}

// 根据省市获取大致坐标（用于手动选择时）
export async function getLocationByRegion(
  country: string,
  province?: string,
  city?: string
): Promise<LocationInfo | null> {
  let address = country
  if (province) address = province + (city ? city : '')
  if (country === '中国' && province) {
    address = `中国${province}${city || ''}`
  }
  
  return geocode(address)
}
