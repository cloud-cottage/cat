# 子域名测试指南

## 本地开发测试

由于本地开发环境无法直接测试子域名，可以通过以下方式模拟：

### 1. 修改 hosts 文件
```bash
# macOS/Linux
sudo vim /etc/hosts

# 添加以下行
127.0.0.1 catcat.meme
127.0.0.1 i.catcat.meme
127.0.0.1 test.catcat.meme
127.0.0.1 username.catcat.meme
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 访问测试
- 首页: http://catcat.meme:5173
- 博客: http://i.catcat.meme:5173  
- 用户页面: http://test.catcat.meme:5173

## 生产环境部署

### Vercel 部署步骤
1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置域名:
   - 主域名: catcat.meme
   - 子域名: *.catcat.meme (通配符)

### DNS 配置
确保你的 DNS 提供商支持通配符子域名：
```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

## 功能测试清单

- [ ] 首页正常加载 (catcat.meme)
- [ ] 博客页面正常加载 (i.catcat.meme)
- [ ] 用户子域名页面正常加载 (username.catcat.meme)
- [ ] 用户可以创建和编辑个人资料
- [ ] 用户可以添加和管理外部链接
- [ ] 钱包连接功能正常
- [ ] 主题切换功能正常
- [ ] 数据持久化存储正常

## 已知问题

1. **WalletConnect Project ID**: 需要在 [WalletConnect Cloud](https://cloud.walletconnect.com/) 注册并获取 Project ID
2. **数据存储**: 当前使用内存存储，生产环境建议使用 Vercel KV 或外部数据库
3. **子域名 HTTPS**: 确保所有子域名都有有效的 SSL 证书

## 部署后测试

部署完成后，访问以下 URL 进行测试：
- https://catcat.meme
- https://i.catcat.meme
- https://yourusername.catcat.meme
