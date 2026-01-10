'use client'

import Link from 'next/link'
import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: '如何加入 Kigurumi Map？',
    answer: '点击页面右上角的「加入」按钮，使用 Twitter 账号登录后，填写你的基本信息（CN名、位置、照片等）即可加入地图。整个过程只需要几分钟。'
  },
  {
    question: '我的位置信息会被精确显示吗？',
    answer: '不会。为了保护用户隐私、防止开盒行为，网站对用户的具体地理位置进行了混淆和偏移处理。在保证地级市位置准确的前提下，对街道、市区等详细位置做了随机偏移。同一区域的多个用户也会自动分散显示，避免重叠。'
  },
  {
    question: '为什么地图上我的位置不太准确？',
    answer: '这是正常现象，是我们保护隐私的措施。网站会对你的精确位置进行混淆和偏移，只保证地级市级别的准确性。这样做是为了防止个人信息暴露和开盒行为，请放心使用。'
  },
  {
    question: '如何修改我的个人信息？',
    answer: '登录后，点击页面右上角的「编辑」按钮，即可进入个人资料编辑页面。你可以随时修改你的 CN 名、简介、照片、社交链接等信息。'
  },
  {
    question: '如何删除我的账号？',
    answer: '进入编辑页面，滚动到页面底部，点击「删除账号」按钮即可。删除后，你的所有信息将从地图上移除。'
  },
  {
    question: '支持哪些社交媒体链接？',
    answer: '目前支持 Twitter/X、微博、QQ、Bilibili、小红书、Instagram 等主流社交平台。你可以在编辑页面添加多个社交链接。'
  },
  {
    question: '如何分享我的个人主页？',
    answer: '每个用户都有一个专属的分享链接。在你的个人主页上，可以找到分享按钮，点击即可复制链接或生成分享卡片。'
  },
  {
    question: '地图上的聚合数字是什么意思？',
    answer: '当某个区域有多个用户时，地图会自动将他们聚合显示为一个带数字的圆圈。点击这个圆圈可以放大查看该区域的所有用户。'
  },
  {
    question: '如何搜索特定用户？',
    answer: '在地图上方的搜索框中输入用户的 CN 名，即可快速找到对应的用户。点击搜索结果会自动定位到该用户在地图上的位置。'
  },
  {
    question: '如何按地区筛选用户？',
    answer: '在 PC 端，使用左侧边栏的地区筛选功能；在移动端，点击底部的「筛选」按钮。选择特定地区后，地图和成员列表都会只显示该地区的用户。'
  },

  {
    question: '遇到问题如何反馈？',
    answer: '点击页面顶部的「反馈」按钮，或访问反馈页面提交你的问题或建议。我们会尽快处理并回复。'
  },
  {
    question: '网站支持哪些语言？',
    answer: '目前主要支持中文界面。地图服务支持中文和英文显示，会根据你的浏览器语言设置自动切换。'
  },
]

function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/5 transition"
      >
        <span className="font-medium text-white pr-4">{item.question}</span>
        <svg
          className={`w-5 h-5 text-white/50 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="px-5 pb-4 text-white/70 text-sm leading-relaxed">
          {item.answer}
        </div>
      </div>
    </div>
  )
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-animated" />
      
      {/* Header */}
      <header className="glass-dark z-50 border-b border-white/5 flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg">
                🎭
              </div>
              <span className="text-lg font-bold text-gradient">Kigurumi Map</span>
            </Link>
            <Link href="/" className="glass px-3 py-1.5 rounded-lg text-sm text-white/70 hover:text-white transition">
              返回地图
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-2">常见问题</h1>
          <p className="text-white/50 mb-8">关于 Kigurumi Map 的常见问题解答</p>
          
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQAccordion
                key={index}
                item={faq}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>

          {/* Still have questions */}
          <div className="mt-10 glass rounded-2xl p-6 text-center">
            <h2 className="text-lg font-semibold text-white mb-2">还有其他问题？</h2>
            <p className="text-white/60 text-sm mb-4">如果以上内容没有解答你的疑问，欢迎直接联系我们</p>
            <Link href="/feedback" className="inline-flex items-center gap-2 btn-gradient px-5 py-2.5 rounded-xl text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              提交反馈
            </Link>
          </div>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/about" className="text-white/50 hover:text-white transition">关于我们</Link>
            <Link href="/feedback" className="text-white/50 hover:text-white transition">问题反馈</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
