#!/bin/bash

# Kigurumi Map 部署脚本
# 自动检测数据库变更、清除缓存并重新构建，保留数据库数据

set -e

echo "🎭 Kigurumi Map 部署脚本"
echo "========================"

# 加载环境变量
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

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

# 检测并应用数据库变更（不丢失数据）
echo "🔍 检测数据库 Schema 变更..."
docker compose run --rm -T migrate npx prisma db push --accept-data-loss=false 2>&1 | tee /tmp/prisma_output.txt

if grep -q "Your database is now in sync" /tmp/prisma_output.txt; then
  echo "✅ 数据库已是最新"
elif grep -q "changes have been applied" /tmp/prisma_output.txt; then
  echo "✅ 数据库已更新"
else
  echo "ℹ️  数据库检查完成"
fi

# 停止应用容器（保留数据库运行）
echo "⏹️  停止应用容器..."
docker compose stop app 2>/dev/null || true
docker compose rm -f app migrate 2>/dev/null || true

# 删除旧镜像
echo "🗑️  清理旧镜像..."
docker rmi kigurumi-map-app kigurumi-map-migrate 2>/dev/null || true

# 清理构建缓存
echo "🧹 清理 Docker 构建缓存..."
docker builder prune -f

# 清理未使用的镜像（不影响数据卷）
echo "🧹 清理未使用的镜像..."
docker image prune -f

# 重新构建并启动
echo "🔨 重新构建镜像..."
docker compose build --no-cache app

echo "🚀 启动应用服务..."
docker compose up -d app

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
echo "📊 服务状态："
docker compose ps

echo ""
echo "✅ 部署完成！"
echo "🌐 访问地址: http://localhost:3000"
