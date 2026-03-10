/**
 * CSS自定义属性布局解析器
 * 从CSS自定义属性中读取完整主题配置
 */

export interface ThemeLayout {
  themeId: string;
  themeName: string;
  description?: string;
  version?: string;
  author?: string;
  modules: Record<string, { area: string; order: number }>;
  gridConfig: { 
    columns: number; 
    rows: number; 
    gap: string;
    columnSize?: string;
    rowHeight?: string;
  };
  colors?: {
    primary: string;
    secondary?: string;
    accent?: string;
    surface?: string;
    text?: {
      primary: string;
      secondary?: string;
      muted?: string;
      white?: string;
    };
  };
  container?: {
    width: string;
    maxWidth: string;
    margin: string;
    minHeight: string;
    padding: string;
  };
  module?: {
    background: string;
    borderRadius: string;
    borderWidth: string;
    padding: string;
  };
  background?: {
    type: string;
    value: string;
    size?: string;
    repeat?: string;
    attachment?: string;
  };
  typography?: {
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
  };
  effects?: {
    shadow: string;
    hoverShadow: string;
    glow: string;
  };
  metadata?: {
    category: string;
    tags: string;
    difficulty: string;
    popularity: string;
  };
}

export function parseThemeLayoutFromCSS(element: HTMLElement, themeName: string): ThemeLayout | null {
  try {
    // 获取CSS自定义属性
    const computedStyle = getComputedStyle(element);
    
    // 读取主题基本信息
    const themeId = computedStyle.getPropertyValue('--theme-name').trim().replace(/"/g, '');
    const displayName = computedStyle.getPropertyValue('--theme-display-name').trim().replace(/"/g, '');
    const description = computedStyle.getPropertyValue('--theme-description').trim().replace(/"/g, '') || undefined;
    const version = computedStyle.getPropertyValue('--theme-version').trim().replace(/"/g, '') || undefined;
    const author = computedStyle.getPropertyValue('--theme-author').trim().replace(/"/g, '') || undefined;
    
    // 读取网格配置
    const columns = parseInt(computedStyle.getPropertyValue('--theme-grid-columns').trim());
    const rows = parseInt(computedStyle.getPropertyValue('--theme-grid-rows').trim());
    const gap = computedStyle.getPropertyValue('--theme-grid-gap').trim();
    const columnSize = computedStyle.getPropertyValue('--theme-grid-column-size').trim() || undefined;
    const rowHeight = computedStyle.getPropertyValue('--theme-grid-row-height').trim() || undefined;
    
    // 读取模块布局JSON
    const modulesJson = computedStyle.getPropertyValue('--theme-modules').trim();
    const modulesData = JSON.parse(modulesJson);
    
    // 转换模块数据格式
    const modules: Record<string, { area: string; order: number }> = {};
    Object.entries(modulesData).forEach(([key, value]: [string, any]) => {
      modules[key] = {
        area: value.area,
        order: value.order
      };
    });
    
    // 读取颜色配置
    const primary = computedStyle.getPropertyValue('--theme-primary').trim();
    const secondary = computedStyle.getPropertyValue('--theme-secondary').trim() || undefined;
    const accent = computedStyle.getPropertyValue('--theme-accent').trim() || undefined;
    const surface = computedStyle.getPropertyValue('--theme-surface').trim() || undefined;
    const textPrimary = computedStyle.getPropertyValue('--theme-text-primary').trim();
    const textSecondary = computedStyle.getPropertyValue('--theme-text-secondary').trim() || undefined;
    const textMuted = computedStyle.getPropertyValue('--theme-text-muted').trim() || undefined;
    const textWhite = computedStyle.getPropertyValue('--theme-text-white').trim() || undefined;
    
    // 读取容器配置
    const containerWidth = computedStyle.getPropertyValue('--theme-container-width').trim() || undefined;
    const containerMaxWidth = computedStyle.getPropertyValue('--theme-container-max-width').trim() || undefined;
    const containerMargin = computedStyle.getPropertyValue('--theme-container-margin').trim() || undefined;
    const containerMinHeight = computedStyle.getPropertyValue('--theme-container-min-height').trim() || undefined;
    const containerPadding = computedStyle.getPropertyValue('--theme-container-padding').trim() || undefined;
    
    // 读取模块样式配置
    const moduleBackground = computedStyle.getPropertyValue('--theme-module-background').trim() || undefined;
    const moduleBorderRadius = computedStyle.getPropertyValue('--theme-module-border-radius').trim() || undefined;
    const moduleBorderWidth = computedStyle.getPropertyValue('--theme-module-border-width').trim() || undefined;
    const modulePadding = computedStyle.getPropertyValue('--theme-module-padding').trim() || undefined;
    
    // 读取背景配置
    const bgType = computedStyle.getPropertyValue('--theme-bg-type').trim() || undefined;
    const bgValue = computedStyle.getPropertyValue('--theme-bg-value').trim() || undefined;
    const bgSize = computedStyle.getPropertyValue('--theme-bg-size').trim() || undefined;
    const bgRepeat = computedStyle.getPropertyValue('--theme-bg-repeat').trim() || undefined;
    const bgAttachment = computedStyle.getPropertyValue('--theme-bg-attachment').trim() || undefined;
    
    // 读取字体配置
    const fontFamily = computedStyle.getPropertyValue('--theme-font-family').trim() || undefined;
    const fontSize = computedStyle.getPropertyValue('--theme-font-size').trim() || undefined;
    const lineHeight = computedStyle.getPropertyValue('--theme-line-height').trim() || undefined;
    
    // 读取效果配置
    const shadow = computedStyle.getPropertyValue('--theme-shadow').trim() || undefined;
    const hoverShadow = computedStyle.getPropertyValue('--theme-hover-shadow').trim() || undefined;
    const glow = computedStyle.getPropertyValue('--theme-glow').trim() || undefined;
    
    // 读取元数据配置
    const metadataCategory = computedStyle.getPropertyValue('--theme-metadata-category').trim() || undefined;
    const metadataTags = computedStyle.getPropertyValue('--theme-metadata-tags').trim() || undefined;
    const metadataDifficulty = computedStyle.getPropertyValue('--theme-metadata-difficulty').trim() || undefined;
    const metadataPopularity = computedStyle.getPropertyValue('--theme-metadata-popularity').trim() || undefined;
    
    const result: ThemeLayout = {
      themeId,
      themeName: displayName,
      description,
      version,
      author,
      modules,
      gridConfig: { columns, rows, gap, columnSize, rowHeight }
    };
    
    // 添加可选配置
    if (primary) {
      result.colors = {
        primary,
        ...(secondary && { secondary }),
        ...(accent && { accent }),
        ...(surface && { surface }),
        text: {
          primary: textPrimary,
          ...(textSecondary && { secondary: textSecondary }),
          ...(textMuted && { muted: textMuted }),
          ...(textWhite && { white: textWhite })
        }
      };
    }
    
    if (containerWidth) {
      result.container = {
        width: containerWidth,
        maxWidth: containerMaxWidth || '100%',
        margin: containerMargin || '0 auto',
        minHeight: containerMinHeight || '100vh',
        padding: containerPadding || '2rem 1rem'
      };
    }
    
    if (moduleBackground) {
      result.module = {
        background: moduleBackground,
        borderRadius: moduleBorderRadius || '12px',
        borderWidth: moduleBorderWidth || '2px',
        padding: modulePadding || '1.5rem'
      };
    }
    
    if (bgType) {
      result.background = {
        type: bgType,
        value: bgValue || '',
        ...(bgSize && { size: bgSize }),
        ...(bgRepeat && { repeat: bgRepeat }),
        ...(bgAttachment && { attachment: bgAttachment })
      };
    }
    
    if (fontFamily) {
      result.typography = {
        fontFamily,
        fontSize: fontSize || '16px',
        lineHeight: lineHeight || '1.5'
      };
    }
    
    if (shadow) {
      result.effects = {
        shadow,
        hoverShadow: hoverShadow || shadow,
        glow: glow || shadow
      };
    }
    
    if (metadataCategory) {
      result.metadata = {
        category: metadataCategory,
        tags: metadataTags || '',
        difficulty: metadataDifficulty || '',
        popularity: metadataPopularity || ''
      };
    }
    
    console.log(`Successfully parsed complete layout for theme ${themeName} from CSS custom properties:`, result);
    
    return result;
  } catch (error) {
    console.error(`Failed to parse layout for theme ${themeName} from CSS custom properties:`, error);
    return null;
  }
}

/**
 * 获取所有主题的布局数据
 */
export async function getAllThemeLayouts(): Promise<ThemeLayout[]> {
  const themes: ThemeLayout[] = [];
  
  // 主题列表
  const themeList = [
    { id: 'cyber-orange', name: '赛博橙' },
    { id: 'diamond', name: '钻石手' },
    { id: 'hodl-blue', name: 'HODL蓝' },
    { id: 'strawberry', name: '草莓熊' },
    { id: 'matrix', name: '韭菜帝国' },
    { id: 'latte-brown', name: '拿铁棕' },
    { id: 'mystery-purple', name: '神秘紫' },
    { id: 'guard', name: '卫兵' },
    { id: 'aurora', name: '极光' }
  ];
  
  for (const theme of themeList) {
    // 创建临时元素来读取CSS属性
    const element = document.createElement('div');
    element.className = `theme-${theme.id}`;
    document.body.appendChild(element);
    
    const layout = parseThemeLayoutFromCSS(element, theme.name);
    if (layout) {
      themes.push(layout);
    }
    
    // 清理临时元素
    document.body.removeChild(element);
  }
  
  return themes;
}
