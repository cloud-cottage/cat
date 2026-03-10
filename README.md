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
- **主题模板** - 提供 9 套主题模板供选择
- **日间/夜间模式** - 支持主题的明暗模式切换

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

## 🏗️ 项目架构

### 优化后的目录结构

```
src/
├── pages/                    # 页面组件 (按路由组织)
│   ├── home/                 # catcat.meme 首页
│   │   ├── HomePage.tsx
│   │   ├── components/      # 首页专用组件
│   │   └── styles/          # 首页样式
│   ├── member/              # i.catcat.meme 申请页
│   │   ├── BlogHome.tsx
│   │   ├── Setup.tsx
│   │   ├── components/
│   │   └── styles/
│   ├── paw/                 # k.catcat.meme 个人页
│   │   ├── UserProfile.tsx
│   │   ├── components/
│   │   └── styles/
│   └── admin/               # i.catcat.meme/admin 管理页
│       ├── Dashboard.tsx
│       ├── components/
│       └── styles/
├── components/              # 全局共用组件
├── themes/                  # 主题系统 (9个主题)
├── hooks/                   # 自定义 hooks
├── lib/                     # 工具函数
├── contexts/                # React contexts
└── styles/                  # 全局样式
```

### 页面映射

#### 1. catcat.meme → `src/pages/home/`
- **入口**: `HomePage.tsx`
- **路由**: 主域名 `/`
- **功能**: 网站首页展示

#### 2. i.catcat.meme → `src/pages/member/`
- **入口**: `BlogHome.tsx`
- **路由**: 子域名 `i.catcat.meme`
- **功能**: 个人页面申请

#### 3. k.catcat.meme → `src/pages/paw/`
- **入口**: `UserProfile.tsx`
- **路由**: 用户子域名 `{user}.catcat.meme`
- **功能**: 个人页面展示

#### 4. i.catcat.meme/admin → `src/pages/admin/`
- **入口**: `Dashboard.tsx`
- **路由**: `/admin` 路径
- **功能**: 管理员面板

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

### 主题系统

项目提供 9 套精心设计的主题：

1. **赛博橙** - 科技橙色主题
2. **钻石手** - 简洁白色主题
3. **HODL蓝** - 深蓝坚定主题
4. **草莓熊** - 粉色可爱主题
5. **韭菜帝国** - 自嘲绿色主题
6. **拿铁棕** - 温暖棕色主题
7. **神秘紫** - 高级紫色主题
8. **卫兵** - 自然绿色主题
9. **极光** - 梦幻蓝粉主题

每套主题都包含日间和夜间两种配色方案。

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

## � 部署指南

### Vercel KV (Upstash Redis) 部署

#### 步骤 1: 在 Vercel 中添加 Upstash Redis

1. 进入你的 Vercel 项目
2. 点击 "Storage" 选项卡
3. 点击 "Create Database"
4. 选择 "Upstash Redis"
5. 选择免费计划 (30,000 requests/month)
6. 点击 "Create"

#### 步骤 2: 获取环境变量

创建数据库后，Vercel 会自动添加以下环境变量：
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

#### 步骤 3: 部署项目

```bash
git add .
git commit -m "Upgrade to Upstash Redis"
git push origin main
```

#### 步骤 4: 验证部署

部署完成后，测试以下功能：
1. 访问用户页面创建新用户
2. 编辑用户资料和链接
3. 刷新页面验证数据持久化

### 数据结构

#### 用户数据 (Hash)
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

#### 用户链接 (List)
```
Key: links:username
Values: [JSON.stringify(link), ...]
```

### 免费额度监控

- **请求限制**: 30,000/月
- **存储限制**: 256MB
- **监控**: 在 Vercel Dashboard 中查看使用情况

### 本地开发

如果要在本地测试，需要：

1. 安装 Upstash CLI
2. 创建本地环境变量文件
3. 复制生产环境的 Redis 配置

```bash
cp .env.local.example .env.local
# 填入你的 Redis 配置
```

## 🧪 测试指南

### 本地开发测试

由于本地开发环境无法直接测试子域名，可以通过以下方式模拟：

#### 1. 修改 hosts 文件
```bash
# macOS/Linux
sudo vim /etc/hosts

# 添加以下行
127.0.0.1 catcat.meme
127.0.0.1 i.catcat.meme
127.0.0.1 test.catcat.meme
127.0.0.1 username.catcat.meme
```

#### 2. 启动开发服务器
```bash
npm run dev
```

#### 3. 访问测试
- 首页: http://catcat.meme:5173
- 博客: http://i.catcat.meme:5173  
- 用户页面: http://test.catcat.meme:5173

### 生产环境部署

#### Vercel 部署步骤
1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置域名:
   - 主域名: catcat.meme
   - 子域名: *.catcat.meme (通配符)

#### DNS 配置
确保你的 DNS 提供商支持通配符子域名：
```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

### 功能测试清单

- [ ] 首页正常加载 (catcat.meme)
- [ ] 博客页面正常加载 (i.catcat.meme)
- [ ] 用户子域名页面正常加载 (username.catcat.meme)
- [ ] 用户可以创建和编辑个人资料
- [ ] 用户可以添加和管理外部链接
- [ ] 钱包连接功能正常
- [ ] 主题切换功能正常
- [ ] 数据持久化存储正常

### 已知问题

1. **WalletConnect Project ID**: 需要在 [WalletConnect Cloud](https://cloud.walletconnect.com/) 注册并获取 Project ID
2. **数据存储**: 当前使用内存存储，生产环境建议使用 Vercel KV 或外部数据库
3. **子域名 HTTPS**: 确保所有子域名都有有效的 SSL 证书

### 部署后测试

部署完成后，访问以下 URL 进行测试：
- https://catcat.meme
- https://i.catcat.meme
- https://yourusername.catcat.meme

## 🧭 开发指南

### 本地开发

本地开发时子域名路由自动适配：

- `localhost` → 显示博客页面
- `username.localhost` → 显示用户页面

### 调试

启用调试日志查看路由信息：

```typescript
console.log('SubdomainRouter:', { hostname, pathname })
```

### 📝 Git 提交规范

**重要规则**：
- Git commit 信息要简洁
- 设定字数上限：不超过 100 字符
- 避免详细描述，用代码注释说明

**示例**：
```
✅ 好的：Add username validation and resize handles
❌ 不好的：Implement comprehensive username filtering system with forbidden words and add interactive resize functionality to dashboard modules with edge and corner handles
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

## 📋 历史记录

### 用户名迁移记录

**迁移信息**:
- **日期**: 2026-03-05
- **操作**: 用户名从 'aa' 迁移到 'k'
- **状态**: ✅ 完成

**迁移的链接 (4个)**:
1. **百度** - https://baidu.com
2. **新链接** - https://accounts.binance.com/en/register?ref=ID421J3O
3. **OKX** - https://www.okx.com/join/value
4. **Bitget** - https://share.bitget.com/u/8B78KZPB

**验证结果**:
✅ 用户数据迁移成功
✅ 链接数据迁移成功 (4个链接)
✅ 所有链接的 userId 已更新为 'k'
✅ 用户名字段已更新
✅ 时间戳已更新

**注意事项**:
- 旧数据 `user:aa` 和 `links:aa` 仍保留在 Redis 中
- 如需清理旧数据，可手动删除
- 建议保留一段时间作为备份

**访问方式**:
现在用户可以通过以下方式访问：
- 前端: `https://k.catcat.meme`
- API: `https://www.catcat.meme/api/user-kv?username=k`

---

**注意**: 真正的子域名访问需要在生产环境中配置通配符域名才能正常工作。
