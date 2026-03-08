# 主题系统结构说明

## 目录结构

```
src/styles/themes/
├── index.css          # 主题系统入口文件
├── common.css          # 通用组件样式
├── diamond/           # 钻石手主题
│   └── index.css
├── hodl-blue/         # HODL蓝主题
│   └── index.css
├── strawberry/        # 草莓熊主题
│   └── index.css
├── cyber-orange/      # 赛博橙主题
│   └── index.css
├── leek-green/        # 韭菜绿主题
│   └── index.css
├── latte-brown/       # 拿铁棕主题
│   └── index.css
├── mystery-purple/     # 神秘紫主题
│   └── index.css
└── web3/             # Web3主题
    └── index.css
```

## 文件说明

### `index.css` - 主题系统入口
- 导入通用组件样式
- 导入所有主题样式
- 作为主CSS文件的统一入口

### `common.css` - 通用组件样式
- `.theme-module` - 通用模块样式
- `.theme-button` - 按钮样式变体
- `.theme-link` - 链接样式
- `.theme-input` - 输入框样式
- `.theme-card` - 卡片样式
- `.theme-tag` - 标签样式
- 通用动画和交互效果

### 主题文件夹结构
每个主题文件夹包含：
- `index.css` - 主题的完整样式定义
- CSS变量定义（颜色、间距、阴影等）
- 主题特定的背景设置
- 主题特殊样式（如钻石主题的边框效果）

## 使用方式

### 在主CSS中导入
```css
@import './styles/themes/index.css';
```

### 在React组件中使用
```jsx
<div className={`blog-container theme-${themeName}`}>
  {/* 内容 */}
</div>
```

## 添加新主题

1. 在 `themes/` 目录下创建新文件夹
2. 添加 `index.css` 文件
3. 定义主题CSS变量和样式
4. 在 `themes/index.css` 中添加导入

## 主题命名规范

- 使用小写字母和连字符：`theme-name`
- 文件夹名称与主题类名一致
- CSS类名格式：`.theme-{name}`

## CSS变量规范

每个主题必须定义：
- `--theme-primary` - 主色调
- `--theme-secondary` - 次要色调
- `--theme-text-primary` - 主要文本颜色
- `--theme-text-secondary` - 次要文本颜色
- `--theme-bg` - 背景色（通常为transparent）
- `--theme-surface` - 表面颜色
- 其他必要的变量...
