# Docker 部署指南

## 前置要求
- Docker 和 Docker Compose 已安装
- 服务器有公网 IP 或域名

## 部署步骤

### 1. 配置环境变量

复制并编辑环境变量文件：

```bash
cd kigurumi-map
cp .env.example .env
```

编辑 `.env` 文件，填入你的配置：

```env
DB_PASSWORD=your-secure-password
NEXTAUTH_SECRET=随机字符串
NEXTAUTH_URL=http://你的域名:3000
NEXT_PUBLIC_TURNSTILE_SITE_KEY=xxx
TURNSTILE_SECRET_KEY=xxx
OSS_REGION=oss-cn-beijing
OSS_BUCKET=greenhaha
OSS_ACCESS_KEY_ID=xxx
OSS_ACCESS_KEY_SECRET=xxx
QQ_CLIENT_ID=xxx
QQ_CLIENT_SECRET=xxx
```

### 2. 构建并启动

```bash
# 构建镜像并启动
docker-compose up -d --build

# 首次运行需要初始化数据库
docker-compose run --rm migrate
```

### 3. 查看状态

```bash
# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f app
```

### 4. 访问网站

打开浏览器访问 `http://你的服务器IP:3000`

## 常用命令

```bash
# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 重新构建并启动
docker-compose up -d --build

# 查看数据库
docker-compose exec postgres psql -U kigurumi -d kigurumi_map

# 清理所有数据（危险！）
docker-compose down -v
```

## 使用 Nginx 反向代理（可选）

如果需要使用 80/443 端口或配置 HTTPS：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

## 备份数据库

```bash
# 备份
docker-compose exec postgres pg_dump -U kigurumi kigurumi_map > backup.sql

# 恢复
cat backup.sql | docker-compose exec -T postgres psql -U kigurumi -d kigurumi_map
```
