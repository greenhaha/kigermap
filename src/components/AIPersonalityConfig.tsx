'use client'

import { useState } from 'react'
import type { AIPersonality } from '@/types'

interface AIPersonalityConfigProps {
  value: AIPersonality | null
  onChange: (value: AIPersonality) => void
}

const PERSONALITY_PRESETS = [
  { label: '活泼开朗', value: '性格活泼开朗，喜欢和人聊天，说话充满活力' },
  { label: '温柔可爱', value: '性格温柔可爱，说话轻声细语，很有耐心' },
  { label: '傲娇', value: '表面傲娇但内心温柔，嘴上说不要但身体很诚实' },
  { label: '元气满满', value: '元气满满的类型，总是充满正能量，喜欢鼓励别人' },
  { label: '神秘高冷', value: '有点神秘高冷，话不多但说的都很有深度' },
]

const TONE_PRESETS = [
  { label: '可爱风', value: '说话可爱，喜欢用"呢"、"哦"、"啦"等语气词，偶尔用颜文字' },
  { label: '元气风', value: '说话充满活力，喜欢用感叹号，语气积极向上' },
  { label: '文艺风', value: '说话文艺优雅，用词讲究，偶尔引用诗句' },
  { label: '日系风', value: '带有日系二次元风格，偶尔用日语词汇和表情' },
  { label: '自然风', value: '说话自然随和，像朋友一样聊天' },
]

const INTEREST_OPTIONS = [
  'Cosplay', 'Kigurumi', '动漫', '游戏', '绘画', '摄影',
  '音乐', '舞蹈', '手工', '旅行', '美食', '二次元文化'
]

export default function AIPersonalityConfig({ value, onChange }: AIPersonalityConfigProps) {
  const [expanded, setExpanded] = useState(false)
  
  const config: AIPersonality = value || {
    enabled: false,
    personality: '',
    tone: '',
    interests: [],
    customPrompt: ''
  }

  const updateConfig = (updates: Partial<AIPersonality>) => {
    onChange({ ...config, ...updates })
  }

  const toggleInterest = (interest: string) => {
    const interests = config.interests.includes(interest)
      ? config.interests.filter(i => i !== interest)
      : [...config.interests, interest]
    updateConfig({ interests })
  }

  return (
    <div className="space-y-4">
      {/* 启用开关 */}
      <div className="flex items-center justify-between p-4 glass rounded-xl">
        <div>
          <h4 className="font-medium text-white">启用 AI 聊天</h4>
          <p className="text-sm text-white/50">让访客可以和你的 AI 分身聊天</p>
        </div>
        <button
          type="button"
          onClick={() => updateConfig({ enabled: !config.enabled })}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            config.enabled ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/20'
          }`}
        >
          <span className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
            config.enabled ? 'left-7' : 'left-1'
          }`} />
        </button>
      </div>

      {config.enabled && (
        <>
          {/* 性格设置 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">
              性格特点
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PERSONALITY_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => updateConfig({ personality: preset.value })}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    config.personality === preset.value
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <textarea
              value={config.personality}
              onChange={e => updateConfig({ personality: e.target.value })}
              placeholder="描述你的AI分身的性格特点..."
              rows={2}
              className="w-full px-4 py-3 input-modern rounded-xl text-white placeholder-white/30 outline-none resize-none"
            />
          </div>

          {/* 说话风格 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">
              说话风格
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {TONE_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => updateConfig({ tone: preset.value })}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    config.tone === preset.value
                      ? 'bg-pink-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <textarea
              value={config.tone}
              onChange={e => updateConfig({ tone: e.target.value })}
              placeholder="描述说话的语气和风格..."
              rows={2}
              className="w-full px-4 py-3 input-modern rounded-xl text-white placeholder-white/30 outline-none resize-none"
            />
          </div>

          {/* 兴趣爱好 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">
              兴趣爱好
            </label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    config.interests.includes(interest)
                      ? 'bg-cyan-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* 高级设置 */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition"
          >
            <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            高级设置
          </button>

          {expanded && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/80">
                自定义提示词
              </label>
              <textarea
                value={config.customPrompt || ''}
                onChange={e => updateConfig({ customPrompt: e.target.value })}
                placeholder="添加额外的角色设定或行为规则..."
                rows={3}
                className="w-full px-4 py-3 input-modern rounded-xl text-white placeholder-white/30 outline-none resize-none"
              />
              <p className="text-xs text-white/40">
                这里可以添加更详细的角色背景、特殊设定等
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
