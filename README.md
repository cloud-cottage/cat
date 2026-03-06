# 猫猫之家 - Web3 个人博客平台

一个基于 React + TypeScript 的去中心化个人博客平台，支持用户通过 Web3 钱包创建独立的子域名博客页面。

## 🌟 特性

- **Web3 钱包登录** - 支持 MetaMask、WalletConnect 等主流钱包
- **独立子域名** - 每个用户拥有 `username.catcat.meme` 独立博客
- **去中心化存储** - 使用 Upstash Redis 持久化用户数据
- **IPFS 前端托管** - 使用星际文件系统进行去中心化前端托管
- **隐私保护** - 不记录访客 IP 地址
- **链上签名验证** - 引入 Web3 签名机制确保数据安全
- **响应式设计** - 支持桌面和移动端访问
- **模块化布局** - 支持拖拽自定义页面模块布局
- **主题模板** - 提供 8 套主题模板供选择

## 🚀 快速开始

### 用户使用流程

1. **连接钱包**: 访问 `https://i.catcat.meme` 连接 Web3 钱包
2. **创建用户**: 进入设置页面 `https://i.catcat.meme/setup`
3. **设置用户名**: 输入用户名（如 `aaaa`）
4. **自动跳转**: 创建成功后自动跳转到 `https://aaaa.catcat.meme/`

### 开发环境设置

```bash
# 克隆项目
git clone https://github.com/cloud-cottage/cat.git
cd cat

# 安装依赖
npm install

# 配置环境变量
cp .env.local.example .env.local

# 启动开发服务器
npm run dev
```

## 🏗️ 技术架构

### 前端技术栈

- **React 18** - 用户界面框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速构建工具
- **Wagmi** - Web3 钱包集成
- **React Router** - 客户端路由

### 后端服务

- **Vercel Functions** - 无服务器 API
- **Upstash Redis** - 数据持久化
- **WalletConnect** - 移动端钱包支持

### 路由架构

```
https://catcat.meme          # 首页
https://i.catcat.meme        # 用户入口
https://i.catcat.meme/setup  # 用户设置
https://i.catcat.meme/dashboard # 管理面板
https://username.catcat.meme # 个人博客
```

## 🔒 隐私与安全

### 去中心化特性

- **IPFS 前端托管**: 使用星际文件系统进行去中心化前端托管，确保内容抗审查
- **隐私保护**: 本项目不记录访客 IP 地址，保护用户隐私
- **链上签名验证**: 引入 Web3 签名机制，确保数据来源可信和完整性

### 安全机制

- **Web3 签名**: 所有重要操作都需要钱包签名验证
- **去中心化存储**: 用户数据存储在分布式网络中
- **无中心化日志**: 不收集用户行为数据和访问日志
- **隐式自动保存**: 采用 Implicit Autosave 技术，用户无需手动保存，系统在页面切换、标签页关闭、浏览器退出时自动保存所有更改

## 🔧 技术特性

### 隐式自动保存 (Implicit Autosave)

本项目采用先进的**隐式自动保存**技术，为用户提供无缝的编辑体验：

- **无感保存**: 用户无需手动点击保存按钮，系统自动检测并保存更改
- **智能触发**: 监听页面生命周期事件，在适当时机自动保存
- **数据保护**: 防止用户因意外操作丢失编辑内容
- **性能优化**: 后台静默保存，不打断用户操作流程

**触发场景**：
- 页面切换或刷新
- 标签页关闭
- 浏览器退出
- 页面失去焦点
- 导航离开

**技术实现**：
```javascript
// 监听多种页面生命周期事件
window.addEventListener('beforeunload', handleAutoSave)
window.addEventListener('visibilitychange', handleAutoSave)
window.addEventListener('pagehide', handleAutoSave)
```

## ⚙️ 环境配置

### 必需的环境变量

```env
# WalletConnect 项目 ID
VITE_WALLETCONNECT_PROJECT_ID=your-project-id

# Upstash Redis 配置
UPSTASH_REDIS_REST_URL=https://your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# 或者使用自定义变量名
cat_KV_REST_API_URL=https://your-redis-url
cat_KV_REST_API_TOKEN=your-redis-token
```

### Vercel 部署配置

1. **域名设置**: 添加 `*.catcat.meme` 通配符域名
2. **环境变量**: 在项目设置中添加上述环境变量
3. **构建配置**: 使用 `npm run build` 和 `dist` 输出目录

## 📱 子域名系统

### 用户创建流程

用户在 `https://i.catcat.meme/setup` 创建用户后：

1. 系统验证用户名唯一性
2. 使用钱包地址创建用户记录
3. 自动跳转到用户子域名：`https://username.catcat.meme/`

### 技术实现

**路由检测** (`src/App.tsx`):
```typescript
// 检测用户子域名
if (hostname.endsWith('.catcat.meme')) {
  const username = hostname.replace('.catcat.meme', '')
  setPage('user')
}
```

**用户跳转** (`src/blog/pages/Setup.tsx`):
```typescript
// 创建用户后跳转到子域名
window.location.href = `https://${username}.catcat.meme/`
```

## 🔧 开发指南

### 本地开发

本地开发时子域名路由自动适配：

- `localhost` → 显示博客页面
- `username.localhost` → 显示用户页面

### 调试

启用调试日志查看路由信息：

```typescript
console.log('SubdomainRouter:', { hostname, pathname })
```

### API 接口

- `GET /api/user-kv.js?username={username}` - 获取用户信息
- `POST /api/user-kv.js` - 创建新用户
- `PUT /api/user-kv.js` - 更新用户数据

## 🚨 故障排除

### 子域名无法访问

1. **检查 DNS**: 确认 `*.catcat.meme` 已正确解析到 Vercel
2. **检查 Vercel**: 确认通配符域名已配置
3. **检查部署**: 确认最新版本已部署

### 钱包连接问题

1. **检查环境变量**: 确认 `VITE_WALLETCONNECT_PROJECT_ID` 已设置
2. **检查钱包**: 确认钱包插件已安装并解锁
3. **检查网络**: 确认钱包网络配置正确

### Redis 连接问题

1. **检查环境变量**: 确认 Redis URL 和 Token 正确
2. **检查 Upstash**: 确认 Redis 数据库正常运行
3. **检查 API**: 确认 API 端点可正常访问

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Pull Request 和 Issue！

---

**注意**: 真正的子域名访问需要在生产环境中配置通配符域名才能正常工作。
