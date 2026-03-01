# Vercel KV (Upstash Redis) 部署指南

## 步骤 1: 在 Vercel 中添加 Upstash Redis

1. 进入你的 Vercel 项目
2. 点击 "Storage" 选项卡
3. 点击 "Create Database"
4. 选择 "Upstash Redis"
5. 选择免费计划 (30,000 requests/month)
6. 点击 "Create"

## 步骤 2: 获取环境变量

创建数据库后，Vercel 会自动添加以下环境变量：
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## 步骤 3: 部署项目

```bash
git add .
git commit -m "Upgrade to Upstash Redis"
git push origin main
```

## 步骤 4: 验证部署

部署完成后，测试以下功能：
1. 访问用户页面创建新用户
2. 编辑用户资料和链接
3. 刷新页面验证数据持久化

## 数据结构

### 用户数据 (Hash)
```
Key: user:username
Fields:
- id: string
- walletAddress: string
- username: string
- twitterHandle: string
- themeId: number
- avatarUrl: string
- bio: string
- createdAt: string
- updatedAt: string
```

### 用户链接 (List)
```
Key: links:username
Values: [JSON.stringify(link), ...]
```

## 免费额度监控

- **请求限制**: 30,000/月
- **存储限制**: 256MB
- **监控**: 在 Vercel Dashboard 中查看使用情况

## 本地开发

如果要在本地测试，需要：

1. 安装 Upstash CLI
2. 创建本地环境变量文件
3. 复制生产环境的 Redis 配置

```bash
cp .env.local.example .env.local
# 填入你的 Redis 配置
```

## 故障排除

### 1. 环境变量未设置
确保在 Vercel 项目设置中正确配置了环境变量

### 2. 数据不持久化
检查是否使用了正确的 API 端点 (`/api/user-kv`)

### 3. CORS 错误
API 已添加 CORS 头，如果仍有问题请检查浏览器控制台

## 性能优化

- Redis 自动缓存频繁访问的数据
- 使用 Hash 结构存储用户信息
- 使用 List 结构存储链接数据
- 支持原子操作，避免数据不一致
