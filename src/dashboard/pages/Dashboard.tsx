import React, { useState, useRef, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { api, type User } from '../../profile/lib/api'

interface Module {
  id: string
  name: string
  component: 'profile' | 'links' | 'twitter'
  position: { x: number; y: number }
  size: { width: number; height: number }
}

interface Theme {
  id: number
  name: string
  description: string
  preview: string
  colors: {
    primary: string
    secondary: string
    bg: string
    surface: string
  }
  modules: Module[]
}

const THEMES: Theme[] = [
  {
    id: 1,
    name: '钻石手',
    description: '清爽简约，专注内容',
    preview: '/themes/diamond.png',
    colors: {
      primary: '#FF8C42',
      secondary: '#1C6E9C',
      bg: '#F8F9FA',
      surface: '#FFFFFF'
    },
    modules: [
      {
        id: 'profile',
        name: '用户资料',
        component: 'profile',
        position: { x: 0, y: 0 },
        size: { width: 3, height: 3 }
      },
      {
        id: 'links',
        name: '链接列表',
        component: 'links',
        position: { x: 3, y: 0 },
        size: { width: 3, height: 4 }
      },
      {
        id: 'twitter',
        name: '推特动态',
        component: 'twitter',
        position: { x: 0, y: 3 },
        size: { width: 6, height: 3 }
      }
    ]
  },
  {
    id: 2,
    name: 'HODL蓝',
    description: '长期持有，信仰坚定',
    preview: '/themes/hodl.png',
    colors: {
      primary: '#1C6E9C',
      secondary: '#FF8C42',
      bg: '#EBF8FF',
      surface: '#FFFFFF'
    },
    modules: [
      {
        id: 'profile',
        name: '用户资料',
        component: 'profile',
        position: { x: 2, y: 0 },
        size: { width: 2, height: 2 }
      },
      {
        id: 'links',
        name: '链接列表',
        component: 'links',
        position: { x: 0, y: 2 },
        size: { width: 3, height: 4 }
      },
      {
        id: 'twitter',
        name: '推特动态',
        component: 'twitter',
        position: { x: 3, y: 2 },
        size: { width: 3, height: 4 }
      }
    ]
  },
  {
    id: 3,
    name: '草莓熊',
    description: '温柔浪漫，少女心',
    preview: '/themes/strawberry.png',
    colors: {
      primary: '#FF6B9D',
      secondary: '#C66FBC',
      bg: '#FFF0F5',
      surface: '#FFFFFF'
    },
    modules: [
      {
        id: 'profile',
        name: '用户资料',
        component: 'profile',
        position: { x: 0, y: 0 },
        size: { width: 2, height: 2 }
      },
      {
        id: 'links',
        name: '链接列表',
        component: 'links',
        position: { x: 2, y: 0 },
        size: { width: 4, height: 3 }
      },
      {
        id: 'twitter',
        name: '推特动态',
        component: 'twitter',
        position: { x: 0, y: 2 },
        size: { width: 6, height: 4 }
      }
    ]
  },
  {
    id: 4,
    name: '赛博橙',
    description: '未来科技，霓虹风格',
    preview: '/themes/cyber.png',
    colors: {
      primary: '#FF6B35',
      secondary: '#00D9FF',
      bg: '#0A0E27',
      surface: '#1A1F3A'
    },
    modules: [
      {
        id: 'profile',
        name: '用户资料',
        component: 'profile',
        position: { x: 1, y: 0 },
        size: { width: 4, height: 2 }
      },
      {
        id: 'links',
        name: '链接列表',
        component: 'links',
        position: { x: 0, y: 2 },
        size: { width: 3, height: 3 }
      },
      {
        id: 'twitter',
        name: '推特动态',
        component: 'twitter',
        position: { x: 3, y: 2 },
        size: { width: 3, height: 3 }
      }
    ]
  },
  {
    id: 5,
    name: '韭菜绿',
    description: '自然清新，护眼舒适',
    preview: '/themes/leek.png',
    colors: {
      primary: '#52C41A',
      secondary: '#52C41A',
      bg: '#F6FFED',
      surface: '#FFFFFF'
    },
    modules: [
      {
        id: 'profile',
        name: '用户资料',
        component: 'profile',
        position: { x: 0, y: 0 },
        size: { width: 2, height: 3 }
      },
      {
        id: 'links',
        name: '链接列表',
        component: 'links',
        position: { x: 2, y: 0 },
        size: { width: 4, height: 2 }
      },
      {
        id: 'twitter',
        name: '推特动态',
        component: 'twitter',
        position: { x: 2, y: 2 },
        size: { width: 4, height: 3 }
      }
    ]
  },
  {
    id: 6,
    name: '拿铁棕',
    description: '温暖治愈，ins 风格',
    preview: '/themes/latte.png',
    colors: {
      primary: '#8B4513',
      secondary: '#D2691E',
      bg: '#FFF8DC',
      surface: '#FFFFFF'
    },
    modules: [
      {
        id: 'profile',
        name: '用户资料',
        component: 'profile',
        position: { x: 0, y: 0 },
        size: { width: 3, height: 2 }
      },
      {
        id: 'links',
        name: '链接列表',
        component: 'links',
        position: { x: 0, y: 2 },
        size: { width: 3, height: 3 }
      },
      {
        id: 'twitter',
        name: '推特动态',
        component: 'twitter',
        position: { x: 3, y: 2 },
        size: { width: 3, height: 3 }
      }
    ]
  },
  {
    id: 7,
    name: '神秘紫',
    description: '神秘优雅，高级感',
    preview: '/themes/purple.png',
    colors: {
      primary: '#6B46C1',
      secondary: '#9F7AEA',
      bg: '#F7FAFC',
      surface: '#FFFFFF'
    },
    modules: [
      {
        id: 'profile',
        name: '用户资料',
        component: 'profile',
        position: { x: 1, y: 0 },
        size: { width: 4, height: 2 }
      },
      {
        id: 'links',
        name: '链接列表',
        component: 'links',
        position: { x: 0, y: 2 },
        size: { width: 2, height: 4 }
      },
      {
        id: 'twitter',
        name: '推特动态',
        component: 'twitter',
        position: { x: 2, y: 2 },
        size: { width: 4, height: 4 }
      }
    ]
  },
  {
    id: 8,
    name: '深海蓝',
    description: '清新宁静，夏日气息',
    preview: '/themes/ocean.png',
    colors: {
      primary: '#0891B2',
      secondary: '#06B6D4',
      bg: '#F0F9FF',
      surface: '#FFFFFF'
    },
    modules: [
      {
        id: 'profile',
        name: '用户资料',
        component: 'profile',
        position: { x: 0, y: 0 },
        size: { width: 2, height: 2 }
      },
      {
        id: 'links',
        name: '链接列表',
        component: 'links',
        position: { x: 2, y: 0 },
        size: { width: 4, height: 2 }
      },
      {
        id: 'twitter',
        name: '推特动态',
        component: 'twitter',
        position: { x: 0, y: 2 },
        size: { width: 6, height: 4 }
      }
    ]
  }
]

export const Dashboard: React.FC = () => {
  const { address } = useAccount()
  const [user, setUser] = useState<User | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<Theme>(THEMES[0])
  const [modules, setModules] = useState<Module[]>(THEMES[0].modules)
  const [draggedModule, setDraggedModule] = useState<Module | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // CSS 编辑器状态
  const [cssContent, setCssContent] = useState(`:root {
  /* 品牌色彩 */
  --color-primary: ${THEMES[0].colors.primary};
  --color-secondary: ${THEMES[0].colors.secondary};
  
  /* 背景色 */
  --color-bg: ${THEMES[0].colors.bg};
  --color-surface: ${THEMES[0].colors.surface};
  
  /* 文字颜色 */
  --color-text-dark: #2D3748;
  --color-text-light: #718096;
  --color-white: #FFFFFF;
  --color-black: #1A202C;
  
  /* 阴影和圆角 */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --radius: 8px;
  
  /* 字体 */
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}`)

  // 网格配置
  const gridSize = {
    cols: 6,  // 改为 6 列
    rows: 9   // 改为 9 行
  }

  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!address) return
    
    const loadUser = async () => {
      try {
        const userData = await api.getUserByUsername('admin') // 临时使用 admin
        if (userData) {
          setUser(userData.user)
          // 加载用户的布局配置
          if (userData.user.layout) {
            setModules(userData.user.layout.modules)
            const theme = THEMES.find(t => t.id === userData.user.layout!.themeId)
            if (theme) setSelectedTheme(theme)
          }
        }
      } catch (error) {
        console.error('加载用户数据失败:', error)
      }
    }

    loadUser()
  }, [address])

  const handleDragStart = (module: Module) => {
    setDraggedModule(module)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedModule || !gridRef.current) return

    const rect = gridRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const cellWidth = rect.width / gridSize.cols
    const cellHeight = rect.height / gridSize.rows

    const newCol = Math.max(0, Math.min(gridSize.cols - draggedModule.size.width, Math.floor(x / cellWidth)))
    const newRow = Math.max(0, Math.min(gridSize.rows - draggedModule.size.height, Math.floor(y / cellHeight)))

    setModules(prev => prev.map(m => 
      m.id === draggedModule.id 
        ? { ...m, position: { x: newCol, y: newRow } }
        : m
    ))
    setDraggedModule(null)
  }

  // 调整大小处理函数
  const handleResizeStart = (e: React.MouseEvent, module: Module, direction: 'left' | 'right' | 'top' | 'bottom') => {
    e.preventDefault()
    e.stopPropagation()
    
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = module.size.width
    const startHeight = module.size.height

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!gridRef.current) return

      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      const cellWidth = gridRef.current.offsetWidth / gridSize.cols
      const cellHeight = gridRef.current.offsetHeight / gridSize.rows

      let newWidth = startWidth
      let newHeight = startHeight

      if (direction === 'right') {
        newWidth = Math.max(1, Math.min(gridSize.cols, Math.round(startWidth + deltaX / cellWidth)))
      } else if (direction === 'bottom') {
        newHeight = Math.max(1, Math.min(gridSize.rows, Math.round(startHeight + deltaY / cellHeight)))
      } else if (direction === 'left') {
        newWidth = Math.max(1, Math.min(gridSize.cols, Math.round(startWidth - deltaX / cellWidth)))
      } else if (direction === 'top') {
        newHeight = Math.max(1, Math.min(gridSize.rows, Math.round(startHeight - deltaY / cellHeight)))
      }

      setModules(prev => prev.map(m => 
        m.id === module.id 
          ? { ...m, size: { width: newWidth, height: newHeight } }
          : m
      ))
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme)
    setModules(theme.modules)
    
    // 更新 CSS 内容
    const newCssContent = `:root {
  /* 品牌色彩 */
  --color-primary: ${theme.colors.primary};
  --color-secondary: ${theme.colors.secondary};
  
  /* 背景色 */
  --color-bg: ${theme.colors.bg};
  --color-surface: ${theme.colors.surface};
  
  /* 文字颜色 */
  --color-text-dark: #2D3748;
  --color-text-light: #718096;
  --color-white: #FFFFFF;
  --color-black: #1A202C;
  
  /* 阴影和圆角 */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --radius: 8px;
  
  /* 字体 */
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}`
    setCssContent(newCssContent)
  }

  const handleSaveLayout = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const updatedUser = {
        ...user,
        layout: {
          themeId: selectedTheme.id,
          modules: modules
        }
      }
      await api.updateUser('admin', updatedUser)
      setUser(updatedUser)
      console.log('布局保存成功')
    } catch (error) {
      console.error('保存布局失败:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveCSS = async () => {
    // 这里可以添加保存 CSS 到服务器的逻辑
    console.log('保存 CSS:', cssContent)
    
    // 暂时只保存到 localStorage
    localStorage.setItem('custom-css', cssContent)
    
    // 可以动态应用 CSS
    const styleElement = document.createElement('style')
    styleElement.textContent = cssContent
    document.head.appendChild(styleElement)
    
    alert('CSS 已保存并应用')
  }

  const renderGridLines = () => {
    const lines = []
    
    // 垂直线
    for (let i = 0; i <= gridSize.cols; i++) {
      lines.push(
        <div
          key={`v-${i}`}
          style={{
            position: 'absolute',
            left: `${(i / gridSize.cols) * 100}%`,
            top: 0,
            bottom: 0,
            width: '1px',
            background: 'rgba(255,255,255,0.1)',
            pointerEvents: 'none'
          }}
        />
      )
    }

    // 水平线
    for (let i = 0; i <= gridSize.rows; i++) {
      lines.push(
        <div
          key={`h-${i}`}
          style={{
            position: 'absolute',
            top: `${(i / gridSize.rows) * 100}%`,
            left: 0,
            right: 0,
            height: '1px',
            background: 'rgba(255,255,255,0.1)',
            pointerEvents: 'none'
          }}
        />
      )
    }

    return lines
  }

  if (!address) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ color: 'white', margin: '0 0 1rem 0' }}>
            请先连接钱包
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            管理面板需要 Web3 钱包授权
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* 头部 */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        padding: '1rem 2rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ color: 'white', margin: 0 }}>
            🎨 布局管理面板
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleSaveLayout}
              disabled={isSaving}
              style={{
                background: isSaving ? 'rgba(255,255,255,0.3)' : 'rgba(76, 175, 80, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              {isSaving ? '保存中...' : '保存布局'}
            </button>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '2rem auto',
        padding: '0 2rem'
      }}>
        {/* 主题选择 */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: 'white', margin: '0 0 1rem 0' }}>
            🎭 选择主题模板
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {THEMES.map(theme => (
              <div
                key={theme.id}
                onClick={() => handleThemeChange(theme)}
                style={{
                  background: selectedTheme.id === theme.id ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.1)',
                  border: selectedTheme.id === theme.id ? '2px solid rgba(76, 175, 80, 0.8)' : '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: '100%',
                  height: '100px',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`
                }}>
                  <div style={{
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}>
                    {theme.name.charAt(0)}
                  </div>
                </div>
                <h3 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
                  {theme.name}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.8rem' }}>
                  {theme.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 布局编辑器 */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '16px',
          padding: '1.5rem'
        }}>
          <h2 style={{ color: 'white', margin: '0 0 1rem 0' }}>
            🎯 拖拽调整布局
          </h2>
          <div
            ref={gridRef}
            style={{
              position: 'relative',
              width: '100%',
              height: '600px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              border: '2px dashed rgba(255,255,255,0.2)'
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {/* 网格线 */}
            {renderGridLines()}

            {/* 模块 */}
            {modules.map(module => (
              <div
                key={module.id}
                draggable
                onDragStart={() => handleDragStart(module)}
                onDragEnd={() => setDraggedModule(null)}
                style={{
                  position: 'absolute',
                  left: `${(module.position.x / gridSize.cols) * 100}%`,
                  top: `${(module.position.y / gridSize.rows) * 100}%`,
                  width: `${(module.size.width / gridSize.cols) * 100}%`,
                  height: `${(module.size.height / gridSize.rows) * 100}%`,
                  background: 'rgba(76, 175, 80, 0.8)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  cursor: 'move',
                  transition: 'all 0.3s ease',
                  zIndex: draggedModule?.id === module.id ? 1000 : 1
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {module.component === 'profile' ? '👤' : 
                     module.component === 'links' ? '🔗' : '🐦'}
                  </div>
                  <div style={{ fontSize: '0.9rem' }}>
                    {module.name}
                  </div>
                </div>

                {/* 调整大小手柄 */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '4px',
                    right: '4px',
                    height: '4px',
                    background: 'transparent',
                    cursor: 'ns-resize'
                  }}
                  onMouseDown={(e) => handleResizeStart(e, module, 'top')}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '4px',
                    right: '4px',
                    height: '4px',
                    background: 'transparent',
                    cursor: 'ns-resize'
                  }}
                  onMouseDown={(e) => handleResizeStart(e, module, 'bottom')}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '4px',
                    bottom: '4px',
                    width: '4px',
                    background: 'transparent',
                    cursor: 'ew-resize'
                  }}
                  onMouseDown={(e) => handleResizeStart(e, module, 'left')}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '4px',
                    bottom: '4px',
                    width: '4px',
                    background: 'transparent',
                    cursor: 'ew-resize'
                  }}
                  onMouseDown={(e) => handleResizeStart(e, module, 'right')}
                />

                {/* 角落调整手柄 */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '8px',
                    height: '8px',
                    background: 'rgba(255,255,255,0.5)',
                    cursor: 'nw-resize',
                    borderRadius: '2px 0 0 0'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleResizeStart(e, module, 'top')
                    handleResizeStart(e, module, 'left')
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '8px',
                    height: '8px',
                    background: 'rgba(255,255,255,0.5)',
                    cursor: 'ne-resize',
                    borderRadius: '0 2px 0 0'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleResizeStart(e, module, 'top')
                    handleResizeStart(e, module, 'right')
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '8px',
                    height: '8px',
                    background: 'rgba(255,255,255,0.5)',
                    cursor: 'sw-resize',
                    borderRadius: '0 0 0 2px'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleResizeStart(e, module, 'bottom')
                    handleResizeStart(e, module, 'left')
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '8px',
                    height: '8px',
                    background: 'rgba(255,255,255,0.5)',
                    cursor: 'se-resize',
                    borderRadius: '0 0 2px 0'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleResizeStart(e, module, 'bottom')
                    handleResizeStart(e, module, 'right')
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.9rem'
          }}>
            💡 <strong>使用提示：</strong>
            <ul style={{ margin: '0.5rem 0 0 1rem', paddingLeft: '1.5rem' }}>
              <li>拖拽模块到新位置来调整布局</li>
              <li>模块会自动对齐到网格</li>
              <li>选择不同的主题模板来快速切换布局</li>
              <li>点击"保存布局"来应用更改</li>
            </ul>
          </div>
        </div>

        {/* CSS 编辑器 */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: 'white', margin: '0 0 1rem 0' }}>
            🎨 修改 CSS 文件
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '1rem',
            alignItems: 'start'
          }}>
            <div>
              <textarea
                value={cssContent}
                onChange={(e) => setCssContent(e.target.value)}
                style={{
                  width: '100%',
                  height: '400px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '1rem',
                  color: 'white',
                  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  resize: 'vertical'
                }}
                placeholder="在这里输入 CSS 代码..."
              />
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <button
                onClick={handleSaveCSS}
                style={{
                  background: 'rgba(76, 175, 80, 0.8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}
              >
                💾 保存 CSS
              </button>
              <button
                onClick={() => {
                  // 重置为当前主题的默认 CSS
                  handleThemeChange(selectedTheme)
                }}
                style={{
                  background: 'rgba(255, 152, 0, 0.8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  whiteSpace: 'nowrap'
                }}
              >
                🔄 重置 CSS
              </button>
            </div>
          </div>
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.9rem'
          }}>
            💡 <strong>使用提示：</strong>
            <ul style={{ margin: '0.5rem 0 0 1rem', paddingLeft: '1.5rem' }}>
              <li>修改 CSS 变量来自定义配色方案</li>
              <li>支持所有标准 CSS 属性和语法</li>
              <li>点击"保存 CSS"立即应用更改</li>
              <li>点击"重置 CSS"恢复当前主题的默认样式</li>
              <li>更改会自动保存到本地存储</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
