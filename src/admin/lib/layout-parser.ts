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
export async function parseThemeLayoutFromCSS(themeId: number, themeName: string, themeClassName: string): Promise<ThemeLayout> {
  try {
    // 检查是否在浏览器环境中
    if (typeof document === 'undefined') {
      console.warn('Document not available, using default layout for theme', themeName);
      return getDefaultThemeLayout(themeId, themeName);
    }

    // 创建临时元素来读取CSS元数据
    const tempElement = document.createElement('div');
    tempElement.className = themeClassName; // 使用正确的className
    tempElement.style.display = 'none';
    document.body.appendChild(tempElement);

    // 获取计算样式中的content内容
    const computedStyle = window.getComputedStyle(tempElement, '::before');
    const content = computedStyle.getPropertyValue('content');

    // 清理临时元素
    document.body.removeChild(tempElement);

    if (content && content !== 'none' && content !== '') {
      // 解析JSON字符串 - 处理CSS content的双重转义
      let jsonStr = content;
      
      console.log(`Raw content from CSS:`, content);
      console.log(`Raw content length:`, content.length);
      
      // 移除CSS content的引号包裹
      if (jsonStr.startsWith('"') && jsonStr.endsWith('"')) {
        jsonStr = jsonStr.slice(1, -1);
      }
      
      // 处理转义字符 - 将 \" 转换为 "
      jsonStr = jsonStr.replace(/\\"/g, '"');
      
      console.log(`Cleaned JSON string:`, jsonStr);
      console.log(`Cleaned JSON length:`, jsonStr.length);
      
      // 检查JSON字符串的完整性
      try {
        const metadata = JSON.parse(jsonStr);
        console.log(`Successfully parsed layout for theme ${themeName}:`, metadata);
        
        return {
          themeId,
          themeName,
          modules: convertCSSToModules(metadata.layout?.modules || {}),
          gridConfig: metadata.layout?.grid || { columns: 6, rows: 9, gap: '1rem' }
        };
      } catch (parseError) {
        console.error(`JSON parse error for theme ${themeName}:`, parseError);
        console.error(`JSON string at error position:`, jsonStr.substring(Math.max(0, (parseError as any).message?.match(/position (\d+)/)?.[1] - 50), ((parseError as any).message?.match(/position (\d+)/)?.[1] || 0) + 50));
        throw parseError;
      }
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
  // 数字模块映射 - 对应新的数字系统
  const moduleMap: Record<string, { name: string; component: Module['component'] }> = {
    '1': { name: '模块1', component: 'profile' },
    '2': { name: '模块2', component: 'social' },
    '3': { name: '模块3', component: 'mostfind' },
    '4': { name: '模块4', component: 'links' },
    '5': { name: '模块5', component: 'twitter' },
    '6': { name: '模块6', component: 'social' }
  };

  const modules: Module[] = [];

  // 使用数字键映射
  Object.entries(cssModules).forEach(([moduleKey, config]) => {
    const moduleInfo = moduleMap[moduleKey];
    if (moduleInfo) {
      // 根据order或index计算位置
      const position = calculateGridPosition(config.order || parseInt(moduleKey));
      
      modules.push({
        id: moduleKey, // 使用数字作为ID
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
    { id: 1, name: 'cyber-orange' },
    { id: 2, name: 'diamond' },
    { id: 3, name: 'hodl-blue' },
    { id: 4, name: 'strawberry' },
    { id: 5, name: 'matrix' },
    { id: 6, name: 'latte-brown' },
    { id: 7, name: 'mystery-purple' },
    { id: 8, name: 'guard' },
    { id: 9, name: 'aurora' }
  ];

  const layouts = await Promise.all(
    themes.map(theme => parseThemeLayoutFromCSS(theme.id, theme.name, `theme-${theme.name}`))
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
    'cyber-orange': '赛博橙',
    'diamond': '钻石手',
    'hodl-blue': 'HODL蓝',
    'strawberry': '草莓熊',
    'matrix': '韭菜帝国',
    'latte-brown': '拿铁棕',
    'mystery-purple': '神秘紫',
    'guard': '卫兵',
    'aurora': '极光'
  };
  
  return displayNames[themeName] || themeName;
}
