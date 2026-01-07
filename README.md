# Kigurumi Map 🎭

全球 Kigurumi 爱好者地图展示平台，支持 PC 和移动端。

## 特性

- 🗺️ 交互式地图展示全球 Kigurumi 爱好者
- 📱 响应式设计，完美支持手机和平板
- 🖼️ 支持上传最多 3 张照片
- 📍 自动获取用户位置
- 🔒 Cloudflare Turnstile 人机验证
- 🔗 一键分享到 QQ / QQ空间
- 🎨 精美分享卡片生成
- ☁️ 阿里云 OSS 图片存储

## 技术栈

- **框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **地图**: Leaflet + OpenStreetMap
- **存储**: 阿里云 OSS
- **验证**: Cloudflare Turnstile

## 快速开始

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.example .env.local

# 启动开发服务器
npm run dev
```

## 环境变量配置

1. **Cloudflare Turnstile**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/) 创建 Turnstile 站点
   - 获取 Site Key 和 Secret Key

2. **阿里云 OSS**
   - 创建 OSS Bucket
   - 配置 CORS 允许你的域名
   - 创建 RAM 用户并授权 OSS 访问
   - 建议使用 STS 临时凭证

## 部署

推荐部署到 Vercel：

```bash
npm run build
```

或使用 Docker：

```bash
docker build -t kigurumi-map .
docker run -p 3000:3000 kigurumi-map
```

## 目录结构

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API 路由
│   ├── profile/        # 个人主页
│   └── page.tsx        # 首页
├── components/         # React 组件
├── lib/               # 工具函数
└── types/             # TypeScript 类型
```

## License

MIT
