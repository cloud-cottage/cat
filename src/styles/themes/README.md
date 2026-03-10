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

## ⚠️ 重要注意事项

### dquote字数控制
**在使用CSS自定义属性存储JSON数据时，必须严格控制总字数，否则容易导致系统卡顿：**

1. **模块布局JSON** (`--theme-modules`)
   - 建议最大长度：**500字符**
   - 包含必要的模块配置即可
   - 避免冗余数据

2. **其他JSON字符串**
   - 保持简洁，只包含核心配置
   - 避免深层嵌套结构
   - 使用缩写和简短命名

3. **性能优化建议**
   ```css
   /* ✅ 推荐：简洁的JSON */
   --theme-modules: '{"1":{"area":"1","order":1},"2":{"area":"2","order":2}}';
   
   /* ❌ 避免：冗长的JSON */
   --theme-modules: '{"module-1":{"grid-area":"1","display-order":1,"component-type":"profile","metadata":{"description":"用户资料模块"}}}';
   ```

4. **监控建议**
   - 定期检查CSS文件大小
   - 监控页面加载性能
   - 如发现卡顿，优先检查JSON字符串长度

### 为什么需要控制字数？
- CSS自定义属性的解析在浏览器主线程进行
- 过长的JSON字符串会增加解析时间
- 可能导致页面渲染卡顿，特别是在低端设备上
- 影响用户体验和页面性能
