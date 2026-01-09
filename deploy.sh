#!/bin/bash

# Kigurumi Map 部署脚本
# 支持维护模式、自动检测数据库变更、清除缓存并重新构建

set -e

echo "🎭 Kigurumi Map 部署脚本"
echo "========================"

# 配置
MAINTENANCE_PORT=3000
APP_PORT=3001
NGINX_CONF="/etc/nginx/sites-available/kigermap"

# 加载环境变量
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# 启用维护模式
enable_maintenance() {
  echo "🔧 启用维护模式..."
  
  # 方式1: 如果使用 nginx，切换到维护页面
  if [ -f "$NGINX_CONF" ]; then
    # 备份当前配置
    sudo cp "$NGINX_CONF" "${NGINX_CONF}.bak"
    
    # 创建维护模式 nginx 配置
    sudo tee "$NGINX_CONF" > /dev/null << 'NGINX_MAINTENANCE'
server {
    listen 80;
    server_name kigermap.com www.kigermap.com;
    
    location / {
        root /var/www/kigermap;
        try_files /maintenance.html =503;
    }
}

server {
    listen 443 ssl;
    server_name kigermap.com www.kigermap.com;
    
    ssl_certificate /etc/letsencrypt/live/kigermap.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kigermap.com/privkey.pem;
    
    location / {
        root /var/www/kigermap;
        try_files /maintenance.html =503;
    }
}
NGINX_MAINTENANCE
    
    # 复制维护页面
    sudo mkdir -p /var/www/kigermap
    sudo cp maintenance.html /var/www/kigermap/
    
    # 重载 nginx
    sudo nginx -t && sudo systemctl reload nginx
    echo "✅ Nginx 已切换到维护模式"
  else
    # 方式2: 使用简单的 Python HTTP 服务器
    echo "📄 启动维护页面服务..."
    python3 -m http.server $MAINTENANCE_PORT --bind 0.0.0.0 -d . &
    MAINTENANCE_PID=$!
    echo $MAINTENANCE_PID > /tmp/maintenance.pid
    echo "✅ 维护页面已启动 (PID: $MAINTENANCE_PID)"
  fi
}

# 禁用维护模式
disable_maintenance() {
  echo "🔄 禁用维护模式..."
  
  if [ -f "$NGINX_CONF.bak" ]; then
    # 恢复 nginx 配置
    sudo mv "${NGINX_CONF}.bak" "$NGINX_CONF"
    sudo nginx -t && sudo systemctl reload nginx
    echo "✅ Nginx 已恢复正常模式"
  fi
  
  # 停止 Python 服务器
  if [ -f /tmp/maintenance.pid ]; then
    kill $(cat /tmp/maintenance.pid) 2>/dev/null || true
    rm -f /tmp/maintenance.pid
    echo "✅ 维护页面服务已停止"
  fi
}

# 清理函数
cleanup() {
  echo "⚠️  部署中断，正在清理..."
  disable_maintenance
  exit 1
}

# 捕获中断信号
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

# 启用维护模式
enable_maintenance

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
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health | grep -q "200"; then
    echo "✅ 应用服务已就绪"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "   等待服务启动... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "⚠️  服务启动超时，请检查日志"
  docker compose logs --tail=50 app
fi

# 禁用维护模式
disable_maintenance

# 检查服务状态
echo "📊 服务状态："
docker compose ps

echo ""
echo "✅ 部署完成！"
echo "🌐 访问地址: https://kigermap.com"
