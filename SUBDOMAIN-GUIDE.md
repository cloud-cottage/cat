# 子域名用户页面指南

## 概述

本项目支持为每个用户创建独立的子域名博客页面，用户创建后会自动跳转到真正的子域名地址。

## 用户流程

### 1. 创建用户

用户访问 `https://i.catcat.meme/setup` 页面：

1. 连接 Web3 钱包（支持 MetaMask、WalletConnect 等）
2. 输入用户名（例如：`aaaa`）
3. 点击"打开博客"按钮

### 2. 自动跳转

用户创建成功后，系统会自动跳转到用户的子域名：

```
https://aaaa.catcat.meme/
```

## 技术实现

### 路由逻辑

- **主域名**: `https://catcat.meme` - 首页
- **博客域名**: `https://i.catcat.meme` - 用户入口和设置页面
- **用户子域名**: `https://{username}.catcat.meme` - 个人博客页面

### 代码实现

在 `src/blog/pages/Setup.tsx` 中：

```typescript
// 用户创建成功后跳转到子域名
window.location.href = `https://${username}.catcat.meme/`
```

在 `src/App.tsx` 的 `SubdomainRouter` 中：

```typescript
// 检测用户子域名并渲染对应页面
if (hostname !== 'catcat.meme' && 
    hostname !== 'www.catcat.meme' &&
    hostname.endsWith('.catcat.meme')) {
  const extractedUsername = hostname.replace('.catcat.meme', '')
  setUsername(extractedUsername)
  setPage('user')
}
```

## 部署配置

### Vercel 配置

需要在 Vercel Dashboard 中配置：

1. **域名设置**: 添加 `*.catcat.meme` 通配符域名
2. **环境变量**: 配置钱包和 Redis 相关变量
3. **构建设置**: 使用 `npm run build` 和 `dist` 输出目录

### vercel.json 配置

```json
{
  "rewrites": [
    {
      "source": "/setup",
      "destination": "/setup"
    },
    {
      "source": "/i/setup", 
      "destination": "/setup"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

## 数据存储

### 用户数据

使用 Upstash Redis 存储用户信息：

- **API 端点**: `/api/user-kv.js`
- **存储内容**: 用户名、钱包地址、链接数据等
- **环境变量**: 支持 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN`

### 钱包集成

- **Wagmi**: 钱包连接管理
- **WalletConnect**: 支持移动端钱包连接
- **Project ID**: 从环境变量 `VITE_WALLETCONNECT_PROJECT_ID` 读取

## 访问示例

### 典型用户流程

1. **入口**: `https://i.catcat.meme`
2. **设置**: `https://i.catcat.meme/setup`
3. **用户页面**: `https://username.catcat.meme`

### 子域名特点

- 每个用户都有独立的子域名
- URL 简洁易记
- 支持直接分享用户页面
- SEO 友好

## 故障排除

### 子域名无法访问

1. **检查 DNS**: 确认 `*.catcat.meme` 已正确解析
2. **检查 Vercel**: 确认通配符域名已配置
3. **检查部署**: 确认最新版本已部署

### 钱包连接问题

1. **检查环境变量**: 确认 `VITE_WALLETCONNECT_PROJECT_ID` 已设置
2. **检查钱包**: 确认钱包插件已安装并解锁
3. **检查网络**: 确认钱包网络配置正确

## 开发说明

### 本地开发

本地开发时，子域名路由会自动适配：

- `localhost` → 显示博客页面
- `username.localhost` → 显示用户页面

### 调试

启用调试日志查看路由信息：

```typescript
console.log('SubdomainRouter:', { hostname, pathname })
```

---

**注意**: 真正的子域名访问需要在生产环境中配置通配符域名才能正常工作。
