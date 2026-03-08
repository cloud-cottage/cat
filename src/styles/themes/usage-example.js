/**
 * CSS布局系统使用示例
 * 展示如何在React组件中使用CSS中定义的布局信息
 */

import React, { useEffect, useRef } from 'react';
import { cssLayoutParser } from './layout-parser.js';

/**
 * CSS布局组件示例
 */
export const CSSLayoutExample = ({ themeName, modules }) => {
  const containerRef = useRef(null);
  const [layout, setLayout] = useState(null);

  useEffect(() => {
    // 从CSS文件解析布局信息
    const loadLayout = async () => {
      try {
        const layoutConfig = await cssLayoutParser.parseLayoutFromCSS(themeName);
        setLayout(layoutConfig);
        
        // 应用布局到容器
        if (containerRef.current) {
          cssLayoutParser.applyLayout(containerRef.current, layoutConfig);
        }
      } catch (error) {
        console.error('Failed to load layout:', error);
      }
    };

    loadLayout();
  }, [themeName]);

  /**
   * 根据布局配置渲染模块
   */
  const renderModules = () => {
    if (!layout || !modules) return null;

    return Object.entries(layout.modules).map(([moduleName, config]) => {
      const moduleData = modules[moduleName];
      if (!moduleData) return null;

      return (
        <div
          key={moduleName}
          className={`theme-module ${config.className}`}
          style={{
            gridArea: config.area,
            order: config.order
          }}
        >
          <h3 className="theme-module-title">{moduleData.title}</h3>
          <div className="theme-module-content">
            {moduleData.content}
          </div>
        </div>
      );
    });
  };

  return (
    <div className={`blog-container theme-${themeName}`}>
      <div ref={containerRef} className="grid-container">
        {renderModules()}
      </div>
    </div>
  );
};

/**
 * 动态布局切换示例
 */
export const DynamicLayoutSwitcher = ({ themes }) => {
  const [currentTheme, setCurrentTheme] = useState('diamond');
  const [layoutInfo, setLayoutInfo] = useState(null);

  const switchTheme = async (themeName) => {
    try {
      const layout = await cssLayoutParser.parseLayoutFromCSS(themeName);
      setLayoutInfo(layout);
      setCurrentTheme(themeName);
    } catch (error) {
      console.error('Failed to switch theme:', error);
    }
  };

  useEffect(() => {
    switchTheme(currentTheme);
  }, [currentTheme]);

  return (
    <div>
      {/* 主题切换器 */}
      <div className="theme-switcher">
        {themes.map(theme => (
          <button
            key={theme.name}
            onClick={() => switchTheme(theme.name)}
            className={`theme-button ${currentTheme === theme.name ? 'active' : ''}`}
          >
            {theme.displayName}
          </button>
        ))}
      </div>

      {/* 布局信息显示 */}
      {layoutInfo && (
        <div className="layout-info">
          <h4>当前布局信息:</h4>
          <pre>
            {JSON.stringify(layoutInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

/**
 * 响应式布局检测示例
 */
export const ResponsiveLayoutDetector = ({ themeName }) => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState('desktop');

  useEffect(() => {
    const detectBreakpoint = () => {
      const width = window.innerWidth;
      let breakpoint = 'desktop';

      if (width <= 900) {
        breakpoint = 'mobile';
      } else if (width <= 1400) {
        breakpoint = 'tablet';
      }

      setCurrentBreakpoint(breakpoint);
    };

    detectBreakpoint();
    window.addEventListener('resize', detectBreakpoint);

    return () => {
      window.removeEventListener('resize', detectBreakpoint);
    };
  }, [themeName]);

  return (
    <div className="breakpoint-indicator">
      <span>当前断点: {currentBreakpoint}</span>
      <span>屏幕宽度: {window.innerWidth}px</span>
    </div>
  );
};

/**
 * CSS Grid布局优势说明
 */
export const CSSGridBenefits = () => {
  return (
    <div className="benefits-list">
      <h3>CSS中存储布局信息的优势:</h3>
      <ul>
        <li><strong>原生支持:</strong> CSS Grid是浏览器原生支持的，性能优秀</li>
        <li><strong>语义化:</strong> 使用grid-template-areas，布局意图清晰</li>
        <li><strong>响应式:</strong> 媒体查询直接在CSS中处理</li>
        <li><strong>可维护:</strong> 布局和样式在同一文件中，便于维护</li>
        <li><strong>可解析:</strong> 通过JavaScript可以读取CSS中的布局配置</li>
        <li><strong>缓存友好:</strong> CSS文件可以被浏览器缓存</li>
      </ul>
    </div>
  );
};
