/**
 * Admin页面布局解析器
 * 从CSS文件中读取主题布局信息
 */

export interface Module {
  id: string
  name: string
  component: 'profile' | 'links' | 'twitter' | 'social' | 'mostfind'
  position: { x: number; y: number }
  size: { width: number; height: number }
}

export interface ThemeLayout {
  themeId: number
  themeName: string
  modules: Module[]
  gridConfig: {
    columns: number
    rows: number
    gap: string
  }
}

/**
 * 从CSS中解析主题布局信息
 * @param themeId 主题ID
 * @param themeName 主题名称
 * @returns Promise<ThemeLayout>
 */
export async function parseThemeLayoutFromCSS(themeId: number, themeName: string): Promise<ThemeLayout> {
  try {
    // 检查是否在浏览器环境中
    if (typeof document === 'undefined') {
      console.warn('Document not available, using default layout for theme', themeName);
      return getDefaultThemeLayout(themeId, themeName);
    }

    // 创建临时元素来读取CSS元数据
    const tempElement = document.createElement('div');
    tempElement.className = `theme-${themeName}`;
    tempElement.style.display = 'none';
    document.body.appendChild(tempElement);

    // 获取计算样式中的content内容
    const computedStyle = window.getComputedStyle(tempElement, '::before');
    const content = computedStyle.getPropertyValue('content');

    // 清理临时元素
    document.body.removeChild(tempElement);

    if (content && content !== 'none' && content !== '') {
      // 解析JSON字符串
      const jsonStr = content.replace(/['"]/g, '');
      const metadata = JSON.parse(jsonStr);
      
      console.log(`Successfully parsed layout for theme ${themeName}:`, metadata);
      
      return {
        themeId,
        themeName,
        modules: convertCSSToModules(metadata.layout?.modules || {}),
        gridConfig: metadata.layout?.grid || { columns: 6, rows: 9, gap: '1rem' }
      };
    }

    // 如果无法从CSS读取，返回默认布局
    console.warn(`No layout metadata found for theme ${themeName}, using default`);
    return getDefaultThemeLayout(themeId, themeName);

  } catch (error) {
    console.warn(`Failed to parse layout for theme ${themeName}:`, error);
    return getDefaultThemeLayout(themeId, themeName);
  }
}

/**
 * 将CSS模块配置转换为Admin页面模块格式
 */
function convertCSSToModules(cssModules: Record<string, any>): Module[] {
  // 模块数组 - 按顺序对应
  const moduleArray = [
    { name: '用户资料', component: 'profile' as const },
    { name: '社交媒体', component: 'social' as const },
    { name: '我活跃在', component: 'mostfind' as const },
    { name: '注册链接', component: 'links' as const },
    { name: '推特动态', component: 'twitter' as const }
  ];

  const modules: Module[] = [];

  // 使用数组序号映射
  Object.entries(cssModules).forEach(([moduleKey, config], index) => {
    const moduleIndex = parseInt(moduleKey);
    if (!isNaN(moduleIndex) && moduleIndex < moduleArray.length) {
      const moduleInfo = moduleArray[moduleIndex];
      // 根据order或index计算位置
      const position = calculateGridPosition(config.order || index + 1);
      
      modules.push({
        id: moduleInfo.component, // 使用组件名作为ID
        name: moduleInfo.name,
        component: moduleInfo.component,
        position,
        size: { width: 2, height: 2 } // 默认大小，可以根据需要调整
      });
    }
  });

  return modules;
}

/**
 * 根据order计算网格位置
 */
function calculateGridPosition(order: number): { x: number; y: number } {
  const columns = 6;
  const row = Math.floor((order - 1) / columns);
  const col = (order - 1) % columns;
  
  return { x: col, y: row };
}

/**
 * 获取默认主题布局
 */
function getDefaultThemeLayout(themeId: number, themeName: string): ThemeLayout {
  const defaultModules: Module[] = [
    {
      id: 'profile',
      name: '用户资料',
      component: 'profile',
      position: { x: 0, y: 0 },
      size: { width: 3, height: 2 }
    },
    {
      id: 'social',
      name: '社交媒体',
      component: 'social',
      position: { x: 3, y: 0 },
      size: { width: 3, height: 2 }
    },
    {
      id: 'mostfind',
      name: '我活跃在',
      component: 'mostfind',
      position: { x: 0, y: 2 },
      size: { width: 2, height: 2 }
    },
    {
      id: 'links',
      name: '注册链接',
      component: 'links',
      position: { x: 2, y: 2 },
      size: { width: 4, height: 4 }
    },
    {
      id: 'twitter',
      name: '推特动态',
      component: 'twitter',
      position: { x: 0, y: 6 },
      size: { width: 6, height: 4 }
    }
  ];

  return {
    themeId,
    themeName,
    modules: defaultModules,
    gridConfig: { columns: 6, rows: 9, gap: '1rem' }
  };
}

/**
 * 批量加载所有主题布局
 */
export async function loadAllThemeLayouts(): Promise<ThemeLayout[]> {
  const themes = [
    { id: 1, name: 'diamond' },
    { id: 2, name: 'hodl-blue' },
    { id: 3, name: 'strawberry' },
    { id: 4, name: 'cyber-orange' },
    { id: 5, name: 'leek-green' },
    { id: 6, name: 'latte-brown' },
    { id: 7, name: 'mystery-purple' },
    { id: 8, name: 'web3' }
  ];

  const layouts = await Promise.all(
    themes.map(theme => parseThemeLayoutFromCSS(theme.id, theme.name))
  );

  return layouts;
}

/**
 * 将Admin页面的模块布局保存为CSS格式
 */
export function saveLayoutToCSS(themeName: string, modules: Module[]): string {
  const cssModules: Record<string, any> = {};
  
  modules.forEach((module, index) => {
    cssModules[module.id] = {
      area: module.id,
      order: index + 1,
      className: `module-${module.id}`
    };
  });

  const metadata = {
    name: themeName,
    displayName: getThemeDisplayName(themeName),
    layout: {
      type: 'custom',
      grid: { columns: 6, rows: 9, gap: '1rem' },
      modules: cssModules
    }
  };

  return JSON.stringify(metadata);
}

function getThemeDisplayName(themeName: string): string {
  const displayNames: Record<string, string> = {
    'diamond': '钻石手',
    'hodl-blue': 'HODL蓝',
    'strawberry': '草莓熊',
    'cyber-orange': '赛博橙',
    'leek-green': '韭菜绿',
    'latte-brown': '拿铁棕',
    'mystery-purple': '神秘紫',
    'web3': 'Web3'
  };
  
  return displayNames[themeName] || themeName;
}
