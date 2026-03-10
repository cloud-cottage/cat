# CatCat.meme 优化目录结构

## 架构原则
- **按功能模块组织**：每个页面独立目录
- **关注点分离**：组件、样式、逻辑分离
- **可扩展性**：便于添加新页面和功能

## 优化后的目录结构

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

## 页面映射

### 1. catcat.meme → `src/pages/home/`
- **入口**: `HomePage.tsx`
- **路由**: 主域名 `/`
- **功能**: 网站首页展示

### 2. i.catcat.meme → `src/pages/member/`
- **入口**: `BlogHome.tsx`
- **路由**: 子域名 `i.catcat.meme`
- **功能**: 个人页面申请

### 3. k.catcat.meme → `src/pages/paw/`
- **入口**: `UserProfile.tsx`
- **路由**: 用户子域名 `{user}.catcat.meme`
- **功能**: 个人页面展示

### 4. i.catcat.meme/admin → `src/pages/admin/`
- **入口**: `Dashboard.tsx`
- **路由**: `/admin` 路径
- **功能**: 管理员面板

## 迁移计划

1. 创建新的 `src/pages/` 目录结构
2. 迁移现有页面到对应目录
3. 更新导入路径
4. 测试所有路由功能

## 当前结构对比

### 现状问题
- 页面分散在多个目录 (`App.tsx`, `paw/`, `admin/`)
- 组件职责不清晰 (全局 vs 页面专用)
- 缺少统一的页面组织结构

### 优化优势
- **统一入口**: 所有页面在 `src/pages/` 下
- **模块化**: 每个页面独立管理组件和样式
- **可维护**: 清晰的功能边界和依赖关系
- **可扩展**: 新增页面只需添加对应目录
