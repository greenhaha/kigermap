'use client'

import { useState, useMemo } from 'react'

interface RegionFilterProps {
  onFilter: (country: string | null, province: string | null, shouldClose?: boolean) => void
  stats: { country: string; province?: string; count: number }[]
}

// 国旗映射
const FLAGS: Record<string, string> = {
  '中国': '🇨🇳',
  '日本': '🇯🇵',
  '韩国': '🇰🇷',
  '美国': '🇺🇸',
  '英国': '🇬🇧',
  '德国': '🇩🇪',
  '法国': '🇫🇷',
  '加拿大': '🇨🇦',
  '澳大利亚': '🇦🇺',
  '新加坡': '🇸🇬',
  '马来西亚': '🇲🇾',
  '泰国': '🇹🇭',
  '俄罗斯': '🇷🇺',
}

export default function RegionFilter({ onFilter, stats }: RegionFilterProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)

  const { countries, provincesByCountry, totalCount } = useMemo(() => {
    const countryMap = new Map<string, number>()
    const provinceMap = new Map<string, Map<string, number>>()
    let total = 0

    stats.forEach(s => {
      countryMap.set(s.country, (countryMap.get(s.country) || 0) + s.count)
      total += s.count

      if (s.province) {
        if (!provinceMap.has(s.country)) {
          provinceMap.set(s.country, new Map())
        }
        provinceMap.get(s.country)!.set(s.province, s.count)
      }
    })

    const countriesArr = Array.from(countryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    const provincesByCountryObj: Record<string, { name: string; count: number }[]> = {}
    provinceMap.forEach((provinces, country) => {
      provincesByCountryObj[country] = Array.from(provinces.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    })

    return { countries: countriesArr, provincesByCountry: provincesByCountryObj, totalCount: total }
  }, [stats])

  const handleCountryChange = (country: string | null) => {
    setSelectedCountry(country)
    setSelectedProvince(null)
    // 如果选择"全部"或该国家没有省份数据，则关闭弹窗
    const hasProvinces = country ? (provincesByCountry[country]?.length || 0) > 0 : false
    const shouldClose = !country || !hasProvinces
    onFilter(country, null, shouldClose)
  }

  const handleProvinceChange = (province: string | null) => {
    setSelectedProvince(province)
    onFilter(selectedCountry, province, true)
  }

  const getFlag = (country: string) => FLAGS[country] || '🌐'
  const currentProvinces = selectedCountry ? provincesByCountry[selectedCountry] || [] : []

  return (
    <div className="space-y-4">
      {/* 标题 - 仅桌面端显示 */}
      <h3 className="hidden lg:flex font-semibold text-white/90 text-sm items-center gap-2">
        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        按地区筛选
      </h3>

      {/* 移动端：国家横向滚动标签 */}
      <div className="lg:hidden">
        <p className="text-xs text-white/40 mb-2">选择国家/地区</p>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleCountryChange(null) }}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
              !selectedCountry 
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' 
                : 'glass text-white/70'
            }`}
          >
            🌍 全部 ({totalCount})
          </button>
          {countries.map(({ name, count }) => (
            <button
              type="button"
              key={name}
              onClick={(e) => { e.stopPropagation(); handleCountryChange(name) }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
                selectedCountry === name 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' 
                  : 'glass text-white/70'
              }`}
            >
              {getFlag(name)} {name} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* 移动端：省份网格布局 */}
      {selectedCountry && currentProvinces.length > 0 && (
        <div className="lg:hidden mt-4">
          <p className="text-xs text-white/40 mb-2">
            选择{selectedCountry === '中国' ? '省份' : '地区'}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleProvinceChange(null) }}
              className={`px-3 py-2 rounded-lg text-sm transition-all active:scale-95 ${
                !selectedProvince
                  ? 'bg-secondary/30 text-white border border-secondary/50'
                  : 'bg-white/5 text-white/60 border border-white/10'
              }`}
            >
              全部
            </button>
            {currentProvinces.map(({ name, count }) => (
              <button
                type="button"
                key={name}
                onClick={(e) => { e.stopPropagation(); handleProvinceChange(name) }}
                className={`px-3 py-2 rounded-lg text-sm transition-all active:scale-95 ${
                  selectedProvince === name
                    ? 'bg-secondary/30 text-white border border-secondary/50'
                    : 'bg-white/5 text-white/60 border border-white/10'
                }`}
              >
                {name} <span className="text-xs opacity-60">({count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 桌面端：原有列表布局 */}
      <div className="hidden lg:block space-y-3">
        {/* 全部地区 */}
        <button
          onClick={() => handleCountryChange(null)}
          className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between ${
            !selectedCountry 
              ? 'bg-primary/20 border border-primary/30' 
              : 'glass hover:bg-white/10'
          }`}
        >
          <span className="flex items-center gap-2">
            <span>🌍</span>
            <span className={`text-sm ${!selectedCountry ? 'text-white font-medium' : 'text-white/70'}`}>
              全部地区
            </span>
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            !selectedCountry ? 'bg-primary/30 text-white' : 'bg-white/10 text-white/50'
          }`}>
            {totalCount}
          </span>
        </button>

        {/* 国家列表 */}
        {countries.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-white/40 px-1 mb-2">国家/地区</p>
            {countries.map(({ name, count }) => (
              <button
                key={name}
                onClick={() => handleCountryChange(name)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between ${
                  selectedCountry === name 
                    ? 'bg-primary/20 border border-primary/30' 
                    : 'hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{getFlag(name)}</span>
                  <span className={`text-sm ${selectedCountry === name ? 'text-white font-medium' : 'text-white/70'}`}>
                    {name}
                  </span>
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedCountry === name ? 'bg-primary/30 text-white' : 'bg-white/10 text-white/50'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* 省份列表 */}
        {selectedCountry && currentProvinces.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-white/10">
            <p className="text-xs text-white/40 px-1 mb-2">
              {selectedCountry === '中国' ? '省份' : '地区'}
            </p>
            
            <button
              onClick={() => handleProvinceChange(null)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between text-sm ${
                !selectedProvince
                  ? 'bg-secondary/20 text-white'
                  : 'text-white/60 hover:bg-white/5'
              }`}
            >
              <span>全部{selectedCountry === '中国' ? '省份' : '地区'}</span>
              <span className="text-xs opacity-60">
                {countries.find(c => c.name === selectedCountry)?.count || 0}
              </span>
            </button>
            
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {currentProvinces.map(({ name, count }) => (
                <button
                  key={name}
                  onClick={() => handleProvinceChange(name)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between text-sm ${
                    selectedProvince === name
                      ? 'bg-secondary/20 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{name}</span>
                  <span className="text-xs opacity-60">{count}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 无数据提示 */}
      {countries.length === 0 && (
        <div className="text-center py-6 text-white/40 text-sm">
          <p>暂无成员数据</p>
        </div>
      )}
    </div>
  )
}
