import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY || ''
const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions'
const MODEL = 'Qwen/Qwen2.5-7B-Instruct'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

function buildSystemPrompt(profile: any): string {
  // 安全解析 aiPersonality（兼容旧数据）
  let aiConfig = null
  if ((profile as any).aiPersonality) {
    try {
      aiConfig = JSON.parse((profile as any).aiPersonality)
    } catch {
      aiConfig = null
    }
  }
  
  let systemPrompt = `你现在扮演一个名叫"${profile.cnName}"的Kigurumi玩家（着ぐるみ爱好者）。

## 基本信息
- 名称：${profile.cnName}
- 自我介绍：${profile.introduction}
- 所在地：${[profile.city, profile.province, profile.country].filter(Boolean).join('，')}

## 角色设定
你是一个热爱Kigurumi文化的二次元爱好者，喜欢穿着可爱的角色服装（着ぐるみ）。你性格友善、活泼，喜欢和同好交流。
`

  if (aiConfig?.enabled) {
    if (aiConfig.personality) {
      systemPrompt += `\n## 性格特点\n${aiConfig.personality}\n`
    }
    if (aiConfig.tone) {
      systemPrompt += `\n## 说话风格\n${aiConfig.tone}\n`
    }
    if (aiConfig.interests?.length > 0) {
      systemPrompt += `\n## 兴趣爱好\n${aiConfig.interests.join('、')}\n`
    }
    if (aiConfig.customPrompt) {
      systemPrompt += `\n## 额外设定\n${aiConfig.customPrompt}\n`
    }
  }

  systemPrompt += `
## 对话要求
1. 保持角色扮演，用第一人称回复
2. 回复要自然、可爱、有二次元风格
3. 可以适当使用颜文字和语气词
4. 回复长度适中，不要太长
5. 对Kigurumi文化保持热情
6. 友善地与对方交流，可以分享自己的爱好和经历
`

  return systemPrompt
}

export async function POST(request: NextRequest) {
  try {
    const { profileId, messages } = await request.json()

    if (!profileId) {
      return NextResponse.json({ error: '缺少profileId' }, { status: 400 })
    }

    const profile = await prisma.kigurumiProfile.findUnique({
      where: { id: profileId }
    })

    if (!profile) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 检查是否启用AI聊天（兼容旧数据）
    let aiConfig = null
    if ((profile as any).aiPersonality) {
      try {
        aiConfig = JSON.parse((profile as any).aiPersonality)
      } catch {}
    }
    
    // 如果明确禁用了AI聊天
    if (aiConfig && aiConfig.enabled === false) {
      return NextResponse.json({ error: '该用户未启用AI聊天' }, { status: 403 })
    }

    const systemPrompt = buildSystemPrompt(profile)
    const chatMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10)
    ]

    const response = await fetch(SILICONFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: chatMessages,
        temperature: 0.8,
        max_tokens: 500,
        top_p: 0.9
      })
    })

    if (!response.ok) {
      console.error('SiliconFlow API error:', await response.text())
      return NextResponse.json({ error: 'AI服务暂时不可用' }, { status: 500 })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || '抱歉，我现在有点迷糊...'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
