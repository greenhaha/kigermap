'use client'

import { useState, useMemo } from 'react'

interface RegionFilterProps {
  onFilter: (country: string | null, province: string | null, shouldClose?: boolean) => void
  stats: { country: string; province?: string; count: number }[]
}

export default function RegionFilter({ onFilter, stats }: RegionFilterProps) {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)

  // 直接按省份/地区统计，忽略国家
  const { provinces, totalCount } = useMemo(() => {
    const provinceMap = new Map<string, number>()
    let total = 0

    stats.forEach(s => {
      total += s.count
      // 使用省份作为分类，如果没有省份则使用国家名
      let region = s.province || s.country || '其他'
      // 将"未知"替换为"其他"
      if (region === '未知') region = '其他'
      provinceMap.set(region, (provinceMap.get(region) || 0) + s.count)
    })

    const provincesArr = Array.from(provinceMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    return { provinces: provincesArr, totalCount: total }
  }, [stats])

  const handleProvinceChange = (province: string | null) => {
    setSelectedProvince(province)
    // 传递 null 作为 country，province 作为筛选条件
    onFilter(null, province, true)
  }

  return (
    <div className="space-y-4">
      {/* 标题 - 仅桌面端显示 */}
      <h3 className="hidden lg:flex font-semibold text-white/90 text-sm items-center gap-2">
        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        按地区筛选
      </h3>

      {/* 移动端：地区横向滚动标签 */}
      <div className="lg:hidden">
        <p className="text-xs text-white/40 mb-2">选择地区</p>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleProvinceChange(null) }}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
              !selectedProvince 
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' 
                : 'glass text-white/70'
            }`}
          >
            全部 ({totalCount})
          </button>
          {provinces.map(({ name, count }) => (
            <button
              type="button"
              key={name}
              onClick={(e) => { e.stopPropagation(); handleProvinceChange(name) }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
                selectedProvince === name 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' 
                  : 'glass text-white/70'
              }`}
            >
              {name} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* 桌面端：列表布局 */}
      <div className="hidden lg:block space-y-1">
        {/* 全部地区 */}
        <button
          onClick={() => handleProvinceChange(null)}
          className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between ${
            !selectedProvince 
              ? 'bg-primary/20 border border-primary/30' 
              : 'glass hover:bg-white/10'
          }`}
        >
          <span className={`text-sm ${!selectedProvince ? 'text-white font-medium' : 'text-white/70'}`}>
            全部地区
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            !selectedProvince ? 'bg-primary/30 text-white' : 'bg-white/10 text-white/50'
          }`}>
            {totalCount}
          </span>
        </button>

        {/* 地区列表 */}
        {provinces.length > 0 && (
          <div className="max-h-[400px] overflow-y-auto space-y-0.5 mt-2">
            {provinces.map(({ name, count }) => (
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
        )}
      </div>

      {/* 无数据提示 */}
      {provinces.length === 0 && (
        <div className="text-center py-6 text-white/40 text-sm">
          <p>暂无成员数据</p>
        </div>
      )}
    </div>
  )
}
