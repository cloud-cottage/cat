/**
 * CSS布局解析器
 * 从CSS文件中提取布局信息
 */

export class CSSLayoutParser {
  constructor() {
    this.layoutCache = new Map();
  }

  /**
   * 从CSS文件解析布局信息
   * @param {string} themeName - 主题名称
   * @returns {Promise<Object>} 布局配置对象
   */
  async parseLayoutFromCSS(themeName) {
    if (this.layoutCache.has(themeName)) {
      return this.layoutCache.get(themeName);
    }

    try {
      // 方法1: 从CSS伪元素读取JSON元数据
      const metadata = await this.parseMetadataFromCSS(themeName);
      if (metadata) {
        this.layoutCache.set(themeName, metadata);
        return metadata;
      }

      // 方法2: 解析CSS文件内容
      const layoutConfig = await this.parseCSSFile(themeName);
      this.layoutCache.set(themeName, layoutConfig);
      return layoutConfig;

    } catch (error) {
      console.error(`Error parsing layout for theme ${themeName}:`, error);
      return this.getDefaultLayout();
    }
  }

  /**
   * 从CSS伪元素解析元数据
   * @param {string} themeName - 主题名称
   * @returns {Object|null} 解析的元数据
   */
  async parseMetadataFromCSS(themeName) {
    try {
      // 创建临时元素来读取CSS内容
      const tempElement = document.createElement('div');
      tempElement.className = `theme-${themeName}`;
      tempElement.style.display = 'none';
      document.body.appendChild(tempElement);

      // 获取计算样式中的content内容
      const computedStyle = window.getComputedStyle(tempElement, '::before');
      const content = computedStyle.getPropertyValue('content');

      // 清理临时元素
      document.body.removeChild(tempElement);

      if (content && content !== 'none') {
        // 解析JSON字符串
        const jsonStr = content.replace(/['"]/g, '');
        return JSON.parse(jsonStr);
      }

      return null;
    } catch (error) {
      console.warn('Failed to parse metadata from CSS:', error);
      return null;
    }
  }

  /**
   * 直接解析CSS文件
   * @param {string} themeName - 主题名称
   * @returns {Object} 布局配置
   */
  async parseCSSFile(themeName) {
    try {
      const response = await fetch(`/styles/themes/${themeName}/layout.css`);
      if (!response.ok) {
        throw new Error(`Failed to load layout CSS: ${themeName}`);
      }

      const cssText = await response.text();
      return this.extractLayoutFromCSSText(cssText);
    } catch (error) {
      console.error(`Error loading CSS file for ${themeName}:`, error);
      return this.getDefaultLayout();
    }
  }

  /**
   * 从CSS文本提取布局信息
   * @param {string} cssText - CSS文本内容
   * @returns {Object} 布局配置
   */
  extractLayoutFromCSSText(cssText) {
    const layout = {
      name: '',
      displayName: '',
      grid: {
        columns: 6,
        rows: 9,
        gap: '1rem'
      },
      modules: {},
      responsive: {}
    };

    // 解析网格配置
    const gridMatch = cssText.match(/grid-template-columns:\s*([^;]+)/);
    if (gridMatch) {
      const columnsStr = gridMatch[1];
      const repeatMatch = columnsStr.match(/repeat\((\d+),/);
      if (repeatMatch) {
        layout.grid.columns = parseInt(repeatMatch[1]);
      }
    }

    const rowMatch = cssText.match(/grid-template-rows:\s*([^;]+)/);
    if (rowMatch) {
      const rowsStr = rowMatch[1];
      const repeatMatch = rowsStr.match(/repeat\((\d+),/);
      if (repeatMatch) {
        layout.grid.rows = parseInt(repeatMatch[1]);
      }
    }

    const gapMatch = cssText.match(/gap:\s*([^;]+)/);
    if (gapMatch) {
      layout.grid.gap = gapMatch[1].trim();
    }

    // 解析模块区域
    const areaMatch = cssText.match(/grid-template-areas:\s*([^;]+)/);
    if (areaMatch) {
      const areasText = areaMatch[1];
      layout.modules = this.parseGridAreas(areasText);
    }

    // 解析响应式布局
    const mediaQueries = cssText.match(/@media[^{]+\{([^}]+)\}/g);
    if (mediaQueries) {
      layout.responsive = this.parseMediaQueries(mediaQueries);
    }

    return layout;
  }

  /**
   * 解析Grid Areas
   * @param {string} areasText - grid-template-areas文本
   * @returns {Object} 模块配置
   */
  parseGridAreas(areasText) {
    const modules = {};
    const lines = areasText.trim().split('\n');
    const areaNames = new Set();

    // 收集所有区域名称
    lines.forEach(line => {
      const areas = line.trim().split(/\s+/).filter(area => area && area !== '.' && area !== 'none');
      areas.forEach(area => {
        if (area && !areaNames.has(area)) {
          areaNames.add(area);
        }
      });
    });

    // 为每个区域创建配置
    let order = 1;
    areaNames.forEach(areaName => {
      modules[areaName] = {
        area: areaName,
        order: order++,
        className: `module-${areaName}`
      };
    });

    return modules;
  }

  /**
   * 解析媒体查询
   * @param {Array} mediaQueries - 媒体查询数组
   * @returns {Object} 响应式配置
   */
  parseMediaQueries(mediaQueries) {
    const responsive = {};

    mediaQueries.forEach((query, index) => {
      const breakpointMatch = query.match(/@media[^{]+\{([^}]+)\}/);
      if (breakpointMatch) {
        const cssContent = breakpointMatch[1];
        const layout = this.extractLayoutFromCSSText(cssContent);
        
        // 提取断点
        const widthMatch = query.match(/\(max-width:\s*(\d+)px\)/);
        const breakpoint = widthMatch ? parseInt(widthMatch[1]) : `unknown-${index}`;
        
        responsive[breakpoint] = layout;
      }
    });

    return responsive;
  }

  /**
   * 生成CSS Grid类名
   * @param {Object} layout - 布局配置
   * @returns {Object} CSS类名映射
   */
  generateGridClasses(layout) {
    const classes = {};

    Object.entries(layout.modules).forEach(([name, config]) => {
      classes[name] = {
        className: config.className,
        gridArea: config.area,
        order: config.order
      };
    });

    return classes;
  }

  /**
   * 应用布局到容器
   * @param {HTMLElement} container - 容器元素
   * @param {Object} layout - 布局配置
   */
  applyLayout(container, layout) {
    // 添加网格容器类
    container.classList.add('grid-container');

    // 应用网格样式
    Object.assign(container.style, {
      display: 'grid',
      gridTemplateColumns: `repeat(${layout.grid.columns}, 1fr)`,
      gridTemplateRows: `repeat(${layout.grid.rows}, 280px)`,
      gap: layout.grid.gap
    });

    // 设置grid-template-areas
    if (Object.keys(layout.modules).length > 0) {
      const areas = this.generateGridAreas(layout.modules, layout.grid.columns, layout.grid.rows);
      container.style.gridTemplateAreas = areas;
    }
  }

  /**
   * 生成grid-template-areas字符串
   * @param {Object} modules - 模块配置
   * @param {number} columns - 列数
   * @param {number} rows - 行数
   * @returns {string} grid-template-areas字符串
   */
  generateGridAreas(modules, columns, rows) {
    // 这里需要根据具体的模块位置来生成
    // 暂时返回默认布局
    return `
      "profile profile stats stats nft nft activity"
      "profile profile stats stats nft nft activity"
      "profile profile stats stats nft nft activity"
      "blog blog blog blog blog blog blog"
      "blog blog blog blog blog blog blog"
      "blog blog blog blog blog blog blog"
      "social social social social social social"
      "social social social social social social"
      "settings settings settings settings settings settings"
    `.trim();
  }

  /**
   * 获取默认布局
   * @returns {Object} 默认布局配置
   */
  getDefaultLayout() {
    return {
      name: 'default',
      displayName: '默认布局',
      grid: {
        columns: 6,
        rows: 9,
        gap: '1rem'
      },
      modules: {
        profile: { area: 'profile', order: 1, className: 'module-profile' },
        stats: { area: 'stats', order: 2, className: 'module-stats' },
        nft: { area: 'nft', order: 3, className: 'module-nft' },
        blog: { area: 'blog', order: 4, className: 'module-blog' },
        social: { area: 'social', order: 5, className: 'module-social' },
        activity: { area: 'activity', order: 6, className: 'module-activity' },
        settings: { area: 'settings', order: 7, className: 'module-settings' }
      }
    };
  }
}

// 创建全局实例
export const cssLayoutParser = new CSSLayoutParser();

// 便捷方法
export const parseLayout = (themeName) => cssLayoutParser.parseLayoutFromCSS(themeName);
export const applyLayout = (container, layout) => cssLayoutParser.applyLayout(container, layout);
