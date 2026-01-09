#!/bin/bash

# Kigurumi Map 简化部署脚本
# 适用于没有 nginx 的环境，使用 Docker 内置维护模式

set -e

echo "🎭 Kigurumi Map 部署脚本 (简化版)"
echo "=================================="

# 加载环境变量
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# 清理函数
cleanup() {
  echo "⚠️  部署中断，正在清理..."
  docker stop maintenance-page 2>/dev/null || true
  docker rm maintenance-page 2>/dev/null || true
  exit 1
}

trap cleanup INT TERM

# 确保数据库容器运行
echo "🐘 确保数据库运行..."
docker compose up -d postgres
sleep 3

# 等待数据库就绪
echo "⏳ 等待数据库就绪..."
until docker compose exec -T postgres pg_isready -U kigurumi -d kigurumi_map > /dev/null 2>&1; do
  echo "   数据库启动中..."
  sleep 2
done
echo "✅ 数据库已就绪"

# 检测并应用数据库变更
echo "🔍 检测数据库 Schema 变更..."
docker compose run --rm -T migrate npx prisma db push --accept-data-loss=false 2>&1 || true

# 启动维护页面容器
echo "🔧 启动维护页面..."
docker run -d --name maintenance-page \
  -p 3000:80 \
  -v "$(pwd)/maintenance.html:/usr/share/nginx/html/index.html:ro" \
  nginx:alpine

echo "✅ 维护页面已启动"

# 停止应用容器
echo "⏹️  停止应用容器..."
docker compose stop app 2>/dev/null || true
docker compose rm -f app migrate 2>/dev/null || true

# 删除旧镜像
echo "🗑️  清理旧镜像..."
docker rmi kigurumi-map-app kigurumi-map-migrate 2>/dev/null || true

# 清理构建缓存
echo "🧹 清理 Docker 构建缓存..."
docker builder prune -f
docker image prune -f

# 重新构建
echo "🔨 重新构建镜像..."
docker compose build --no-cache app

# 停止维护页面
echo "🔄 停止维护页面..."
docker stop maintenance-page 2>/dev/null || true
docker rm maintenance-page 2>/dev/null || true

# 启动应用
echo "🚀 启动应用服务..."
docker compose up -d app

# 等待服务启动
echo "⏳ 等待服务启动..."
for i in {1..30}; do
  if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ 应用服务已就绪"
    break
  fi
  echo "   等待服务启动... ($i/30)"
  sleep 2
done

# 检查服务状态
echo "📊 服务状态："
docker compose ps

echo ""
echo "✅ 部署完成！"
echo "🌐 访问地址: http://localhost:3000"
