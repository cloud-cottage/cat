# 图标文件目录说明

这个目录用于存放用户链接的 ICO 格式图标文件。

## 文件命名规范

- 使用小写字母和连字符：`google.ico`, `apple.ico`, `microsoft.ico`
- 文件名应该与图标 ID 对应

## 支持的格式

- **ICO 文件**：推荐 16x16, 32x32, 48x48 像素
- **PNG 文件**：也可以使用 PNG 格式
- **SVG 文件**：矢量图标，支持缩放

## 当前可用的 ICO 图标

以下图标已经在系统中配置，只需要将对应的 ICO 文件放入此目录：

- `google.ico` - Google 搜索引擎
- `apple.ico` - Apple 公司
- `microsoft.ico` - Microsoft 公司  
- `amazon.ico` - Amazon 购物网站
- `netflix.ico` - Netflix 流媒体

## 添加新图标

1. 将 ICO 文件放入此目录
2. 在 `src/profile/lib/api.ts` 中添加图标配置：
```typescript
{ id: 'your-icon', name: 'Your Icon', icoFile: '/icons/your-icon.ico', category: '工具网站' }
```

## 注意事项

- ICO 文件大小建议控制在 10KB 以内
- 确保图标在深色和浅色背景下都清晰可见
- 测试图标在不同浏览器中的显示效果
