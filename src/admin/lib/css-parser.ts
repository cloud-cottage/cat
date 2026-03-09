/**
 * CSS自定义属性布局解析器
 * 从CSS自定义属性中读取主题布局数据
 */

export interface ThemeLayout {
  themeId: string;
  themeName: string;
  modules: Record<string, { area: string; order: number }>;
  gridConfig: { columns: number; rows: number; gap: string };
}

export function parseThemeLayoutFromCSS(element: HTMLElement, themeName: string): ThemeLayout | null {
  try {
    // 获取CSS自定义属性
    const computedStyle = getComputedStyle(element);
    
    // 读取主题基本信息
    const themeId = computedStyle.getPropertyValue('--theme-name').trim().replace(/"/g, '');
    const displayName = computedStyle.getPropertyValue('--theme-display-name').trim().replace(/"/g, '');
    
    // 读取网格配置
    const columns = parseInt(computedStyle.getPropertyValue('--theme-grid-columns').trim());
    const rows = parseInt(computedStyle.getPropertyValue('--theme-grid-rows').trim());
    const gap = computedStyle.getPropertyValue('--theme-grid-gap').trim();
    
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
    
    console.log(`Successfully parsed layout for theme ${themeName} from CSS custom properties:`, {
      themeId,
      displayName,
      gridConfig: { columns, rows, gap },
      modules
    });
    
    return {
      themeId,
      themeName: displayName,
      modules,
      gridConfig: { columns, rows, gap }
    };
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
