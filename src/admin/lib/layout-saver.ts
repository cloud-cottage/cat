/**
 * Admin页面布局保存器
 * 将编辑后的布局数据保存到CSS文件
 */

import { type Module } from './layout-parser'

export interface LayoutSaveResult {
  success: boolean
  message: string
  cssContent?: string
}

interface CSSModuleMetadata {
  area: string
  order: number
  className: string
}

/**
 * 将模块布局转换为CSS格式
 */
export function convertModulesToCSS(themeName: string, modules: Module[]): string {
  const gridAreas = generateGridAreas(modules)
  const modulePositions = generateModulePositions(themeName, modules)
  
  return `/* ${themeName}主题布局配置 - 由Admin页面编辑 */

/* 网格布局定义 */
.theme-${themeName} .grid-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(9, 280px);
  gap: 1rem;
  min-height: 900px;
}

/* ${themeName}主题布局 - 用户自定义 */
.theme-${themeName} .grid-container {
  grid-template-areas: 
${gridAreas};
}

${modulePositions}

/* 响应式调整 */
@media (max-width: 1400px) {
  .theme-${themeName} .grid-container {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(12, 280px);
    grid-template-areas: 
${generateResponsiveGridAreas(modules, 4)};
  }
}

@media (max-width: 900px) {
  .theme-${themeName} .grid-container {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(18, 280px);
    grid-template-areas: 
${generateResponsiveGridAreas(modules, 2)};
  }
}

/* 布局元数据 */
.theme-${themeName}::before {
  content: '${generateLayoutMetadata(themeName, modules)}';
  display: none;
}
`
}

/**
 * 生成grid-template-areas
 */
function generateGridAreas(modules: Module[]): string {
  const grid = Array(9).fill(null).map(() => Array(6).fill('.'))
  
  modules.forEach(module => {
    const { x, y } = module.position
    const { width, height } = module.size
    
    for (let row = y; row < Math.min(y + height, 9); row++) {
      for (let col = x; col < Math.min(x + width, 6); col++) {
        if (grid[row] && grid[row][col] !== undefined) {
          grid[row][col] = module.id
        }
      }
    }
  })
  
  return grid.map(row => `    "${row.join(' ')}"`).join(',\n')
}

/**
 * 生成模块位置CSS
 */
function generateModulePositions(themeName: string, modules: Module[]): string {
  return modules.map(module => 
`.theme-${themeName} .module-${module.id} {
  grid-area: ${module.id};
}`
  ).join('\n\n')
}

/**
 * 生成响应式网格布局
 */
function generateResponsiveGridAreas(modules: Module[], columns: number): string {
  const rows = Math.ceil(18 / columns)
  const grid = Array(rows).fill(null).map(() => Array(columns).fill('.'))
  
  let currentPos = 0
  modules.forEach(module => {
    for (let i = 0; i < module.size.width * module.size.height; i++) {
      if (currentPos >= rows * columns) return
      
      const row = Math.floor(currentPos / columns)
      const col = currentPos % columns
      
      if (grid[row] && grid[row][col] !== undefined) {
        grid[row][col] = module.id
      }
      
      currentPos++
    }
  })
  
  return grid.map(row => `      "${row.join(' ')}"`).join(',\n')
}

/**
 * 生成布局元数据
 */
function generateLayoutMetadata(themeName: string, modules: Module[]): string {
  const moduleData: Record<string, CSSModuleMetadata> = {}
  
  modules.forEach((module, index) => {
    moduleData[module.id] = {
      area: module.id,
      order: index + 1,
      className: `module-${module.id}`
    }
  })
  
  const metadata = {
    name: themeName,
    displayName: getThemeDisplayName(themeName),
    layout: {
      type: 'custom',
      focus: 'user-defined',
      grid: { columns: 6, rows: 9, gap: '1rem' },
      modules: moduleData
    }
  }
  
  return JSON.stringify(metadata).replace(/'/g, "\\'")
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
  }
  
  return displayNames[themeName] || themeName
}

/**
 * 保存布局到CSS文件（模拟）
 * 在实际应用中，这里应该调用后端API来保存CSS文件
 */
export async function saveLayoutToCSSFile(
  themeName: string, 
  modules: Module[]
): Promise<LayoutSaveResult> {
  try {
    const cssContent = convertModulesToCSS(themeName, modules)
    
    // 模拟API调用
    console.log(`Saving layout for theme ${themeName}:`)
    console.log(cssContent)
    
    // 在实际应用中，这里应该调用后端API
    // const response = await fetch('/api/themes/save-layout', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ themeName, cssContent })
    // })
    
    // if (!response.ok) {
    //   throw new Error('Failed to save layout')
    // }
    
    return {
      success: true,
      message: `布局已成功保存到 ${themeName}/layout.css`,
      cssContent
    }
  } catch (error) {
    console.error('Error saving layout:', error)
    return {
      success: false,
      message: '保存布局失败，请重试'
    }
  }
}

/**
 * 验证布局有效性
 */
export function validateLayout(modules: Module[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const occupiedPositions = new Set<string>()
  
  modules.forEach(module => {
    const { x, y } = module.position
    const { width, height } = module.size
    
    // 检查是否超出边界
    if (x < 0 || y < 0 || x + width > 6 || y + height > 9) {
      errors.push(`模块 ${module.name} 超出网格边界`)
    }
    
    // 检查是否有重叠
    for (let row = y; row < y + height; row++) {
      for (let col = x; col < x + width; col++) {
        const posKey = `${row}-${col}`
        if (occupiedPositions.has(posKey)) {
          errors.push(`模块 ${module.name} 与其他模块重叠`)
        }
        occupiedPositions.add(posKey)
      }
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}
