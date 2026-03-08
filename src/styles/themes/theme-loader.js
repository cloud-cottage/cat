/**
 * 主题配置加载器
 * 用于动态加载和应用主题配置
 */

export class ThemeLoader {
  constructor() {
    this.themes = new Map();
    this.currentTheme = null;
  }

  /**
   * 加载主题配置
   * @param {string} themeName - 主题名称
   * @returns {Promise<Object>} 主题配置对象
   */
  async loadTheme(themeName) {
    if (this.themes.has(themeName)) {
      return this.themes.get(themeName);
    }

    try {
      const response = await fetch(`/styles/themes/${themeName}/theme.json`);
      if (!response.ok) {
        throw new Error(`Failed to load theme: ${themeName}`);
      }
      
      const themeConfig = await response.json();
      this.themes.set(themeName, themeConfig);
      return themeConfig;
    } catch (error) {
      console.error(`Error loading theme ${themeName}:`, error);
      throw error;
    }
  }

  /**
   * 应用主题配置
   * @param {Object} themeConfig - 主题配置对象
   */
  applyTheme(themeConfig) {
    // 生成CSS变量
    const cssVariables = this.generateCSSVariables(themeConfig);
    
    // 创建或更新主题样式
    this.applyThemeStyles(themeConfig.name, cssVariables);
    
    // 应用背景
    this.applyBackground(themeConfig.background);
    
    // 更新当前主题
    this.currentTheme = themeConfig;
    
    // 触发主题变更事件
    this.dispatchThemeChange(themeConfig);
  }

  /**
   * 生成CSS变量
   * @param {Object} themeConfig - 主题配置
   * @returns {string} CSS变量字符串
   */
  generateCSSVariables(themeConfig) {
    const { colors, layout, effects, typography } = themeConfig;
    
    const variables = {
      // 颜色变量
      '--theme-primary': colors.primary,
      '--theme-secondary': colors.secondary,
      '--theme-surface': colors.surface,
      '--theme-text-primary': colors.text.primary,
      '--theme-text-secondary': colors.text.secondary,
      '--theme-text-muted': colors.text.muted,
      '--theme-text-white': colors.text.white,
      
      // 布局变量
      '--container-width': layout.container.width,
      '--container-padding': layout.container.padding,
      '--grid-gap': layout.grid.gap,
      '--module-background': layout.module.background,
      '--module-border-radius': layout.module.borderRadius,
      '--module-border-width': layout.module.borderWidth,
      
      // 效果变量
      '--theme-shadow': effects.shadow,
      '--theme-hover-shadow': effects.hoverShadow,
      '--theme-glow': effects.glow,
      
      // 字体变量
      '--theme-font-family': typography.fontFamily,
      '--theme-font-size': typography.fontSize,
      '--theme-line-height': typography.lineHeight,
    };

    // 处理RGB值（用于透明度）
    if (colors.primaryRgb) {
      variables['--theme-primary-rgb'] = colors.primaryRgb;
    }
    if (colors.secondaryRgb) {
      variables['--theme-secondary-rgb'] = colors.secondaryRgb;
    }

    return Object.entries(variables)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n');
  }

  /**
   * 应用主题样式
   * @param {string} themeName - 主题名称
   * @param {string} cssVariables - CSS变量字符串
   */
  applyThemeStyles(themeName, cssVariables) {
    let styleElement = document.getElementById(`theme-${themeName}`);
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = `theme-${themeName}`;
      styleElement.setAttribute('data-theme', themeName);
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      .theme-${themeName} {
        ${cssVariables}
      }
    `;
  }

  /**
   * 应用背景
   * @param {Object} background - 背景配置
   */
  applyBackground(background) {
    const root = document.documentElement;
    
    switch (background.type) {
      case 'pattern':
        root.style.setProperty('--theme-bg', 'transparent');
        root.style.background = `url('${background.value}') ${background.repeat || 'repeat'}`;
        root.style.backgroundSize = background.size || 'auto';
        root.style.backgroundAttachment = background.attachment || 'scroll';
        break;
        
      case 'gradient':
        root.style.setProperty('--theme-bg', 'transparent');
        root.style.background = background.value;
        root.style.backgroundAttachment = background.attachment || 'scroll';
        break;
        
      case 'solid':
        root.style.setProperty('--theme-bg', background.value);
        root.style.background = '';
        break;
        
      default:
        root.style.setProperty('--theme-bg', background.value || '#ffffff');
        root.style.background = '';
    }
  }

  /**
   * 触发主题变更事件
   * @param {Object} themeConfig - 主题配置
   */
  dispatchThemeChange(themeConfig) {
    const event = new CustomEvent('themechange', {
      detail: {
        theme: themeConfig,
        name: themeConfig.name,
        displayName: themeConfig.displayName
      }
    });
    
    document.dispatchEvent(event);
  }

  /**
   * 获取所有可用主题列表
   * @returns {Array<string>} 主题名称列表
   */
  getAvailableThemes() {
    return [
      'diamond',
      'hodl-blue', 
      'strawberry',
      'cyber-orange',
      'leek-green',
      'latte-brown',
      'mystery-purple',
      'web3'
    ];
  }

  /**
   * 预加载所有主题配置
   * @returns {Promise<void>}
   */
  async preloadAllThemes() {
    const themes = this.getAvailableThemes();
    const promises = themes.map(theme => this.loadTheme(theme));
    
    try {
      await Promise.all(promises);
      console.log('All themes preloaded successfully');
    } catch (error) {
      console.error('Error preloading themes:', error);
    }
  }
}

// 创建全局实例
export const themeLoader = new ThemeLoader();

// 便捷方法
export const loadTheme = (themeName) => themeLoader.loadTheme(themeName);
export const applyTheme = (themeConfig) => themeLoader.applyTheme(themeConfig);
export const preloadAllThemes = () => themeLoader.preloadAllThemes();
