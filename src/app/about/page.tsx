'use client'

import Link from 'next/link'

export default function AboutPage() {
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-6">关于 Kigurumi Map</h1>
          
          <div className="space-y-6 text-white/80">
            <section className="glass rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span>🎭</span> 我们是谁
              </h2>
              <p className="leading-relaxed">
                Kigurumi Map 是一个公益性质的全球 Kigurumi 文化社区平台。在这里，你可以找到身边的同好，了解各地区的 Kigurumi 活动，与志同道合的朋友建立联系。我们致力于为全球 Kiger 们打造一个温暖、友好的交流空间。
              </p>
            </section>

            <section className="glass rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span>🔒</span> 隐私保护
              </h2>
              <p className="leading-relaxed">
                为了保护用户隐私，防止个人信息暴露和开盒行为，网站对用户的具体地理位置进行了混淆和偏移处理。在保证地级市位置准确的前提下，对街道、市区等详细位置做了随机偏移。如果你发现地图上的位置不太精确，这是正常现象，是我们保护隐私的措施。
              </p>
            </section>

            <section className="glass rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span>👨‍💻</span> 关于开发者
              </h2>
              <p className="leading-relaxed mb-4">
                目前网站的开发和运维均由我一个人完成。我会尽最大努力解决大家在使用过程中遇到的问题和 Bug。如果有任何建议或发现问题，欢迎随时联系我。
              </p>
              <div className="glass rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-primary">CN：</span>
                  <span className="text-white">阿尔泰尔</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary">粉丝群：</span>
                  <span className="text-white font-mono">1061303437</span>
                </div>
                <p className="text-sm text-white/60 pt-2">
                  日常晚上会在 B站 和 抖音 上进行变娃双推直播，欢迎来玩~
                </p>
              </div>
            </section>

            <section className="glass rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span>💝</span> 支持我们
              </h2>
              <p className="leading-relaxed mb-4">
                目前网站暂不接受赞助，等服务器有压力需要升级时再考虑。现阶段最大的支持就是：
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">✓</span>
                  <span>多多使用和宣传这个网站</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">✓</span>
                  <span>关注我的 抖音、B站、小红书</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs">✓</span>
                  <span>把网站推荐给身边的 Kiger 们</span>
                </li>
              </ul>
            </section>

            <section className="glass rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span>💬</span> 问题反馈
              </h2>
              <p className="leading-relaxed mb-3">
                使用过程中遇到任何问题、Bug 或有好的建议，都可以通过反馈页面告诉我：
              </p>
              <Link href="/feedback" className="inline-flex items-center gap-2 btn-gradient px-4 py-2 rounded-xl text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                提交反馈
              </Link>
            </section>
          </div>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/faq" className="text-white/50 hover:text-white transition">常见问题</Link>
            <Link href="/feedback" className="text-white/50 hover:text-white transition">问题反馈</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
