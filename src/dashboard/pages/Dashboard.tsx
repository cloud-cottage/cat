import { useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import { api, type User } from '../../profile/lib/api'

interface Module {
  id: string
  name: string
  component: 'profile' | 'links' | 'twitter' | 'social'
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

// 主题配置 - 8个主题模板
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
        name: '注册链接',
        component: 'links',
        position: { x: 3, y: 0 },
        size: { width: 3, height: 4 }
      },
      {
        id: 'social',
        name: '社交媒体',
        component: 'social',
        position: { x: 0, y: 3 },
        size: { width: 6, height: 3 }
      },
      {
        id: 'twitter',
        name: '推特动态',
        component: 'twitter',
        position: { x: 0, y: 6 },
        size: { width: 6, height: 4 }
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
        name: '注册链接',
        component: 'links',
        position: { x: 0, y: 2 },
        size: { width: 3, height: 4 }
      },
      {
        id: 'social',
        name: '社交媒体',
        component: 'social',
        position: { x: 3, y: 2 },
        size: { width: 3, height: 4 }
      },
      {
        id: 'twitter',
        name: '推特动态',
        component: 'twitter',
        position: { x: 0, y: 6 },
        size: { width: 6, height: 4 }
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
        name: '注册链接',
        component: 'links',
        position: { x: 2, y: 0 },
        size: { width: 4, height: 3 }
      },
      {
        id: 'social',
        name: '社交媒体',
        component: 'social',
        position: { x: 0, y: 2 },
        size: { width: 6, height: 4 }
      },
      {
        id: 'twitter',
        name: '推特动态',
        component: 'twitter',
        position: { x: 0, y: 6 },
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
        name: '注册链接',
        component: 'links',
        position: { x: 0, y: 2 },
        size: { width: 3, height: 3 }
      },
      {
        id: 'social',
        name: '社交媒体',
        component: 'social',
        position: { x: 3, y: 2 },
        size: { width: 3, height: 3 }
      },
      {
        id: 'twitter',
        name: '推特动态',
        component: 'twitter',
        position: { x: 0, y: 5 },
        size: { width: 6, height: 4 }
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
        name: '注册链接',
        component: 'links',
        position: { x: 2, y: 0 },
        size: { width: 4, height: 2 }
      },
      {
        id: 'social',
        name: '社交媒体',
        component: 'social',
        position: { x: 2, y: 2 },
        size: { width: 4, height: 3 }
      },
      {
        id: 'twitter',
        name: '推特动态',
        component: 'twitter',
        position: { x: 0, y: 5 },
        size: { width: 6, height: 4 }
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
        name: '注册链接',
        component: 'links',
        position: { x: 0, y: 2 },
        size: { width: 3, height: 3 }
      },
      {
        id: 'social',
        name: '社交媒体',
        component: 'social',
        position: { x: 3, y: 2 },
        size: { width: 3, height: 3 }
      },
      {
        id: 'twitter',
        name: '推特动态',
        component: 'twitter',
        position: { x: 0, y: 5 },
        size: { width: 6, height: 4 }
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
        name: '注册链接',
        component: 'links',
        position: { x: 0, y: 2 },
        size: { width: 2, height: 4 }
      },
      {
        id: 'social',
        name: '社交媒体',
        component: 'social',
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
        name: '注册链接',
        component: 'links',
        position: { x: 2, y: 0 },
        size: { width: 4, height: 2 }
      },
      {
        id: 'social',
        name: '社交媒体',
        component: 'social',
        position: { x: 0, y: 2 },
        size: { width: 6, height: 4 }
      },
      {
        id: 'twitter',
        name: '推特动态',
        component: 'twitter',
        position: { x: 0, y: 6 },
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
  const [resizingModule, setResizingModule] = useState<{ module: Module; direction: string } | null>(null)
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
          } else {
            // 如果用户未设置布局，使用第一个主题作为默认
            setSelectedTheme(THEMES[0])
            setModules(THEMES[0].modules)
          }
        } else {
          // 如果用户不存在，使用第一个主题作为默认
          setSelectedTheme(THEMES[0])
          setModules(THEMES[0].modules)
        }
      } catch (error) {
        console.error('加载用户数据失败:', error)
        // 出错时也使用第一个主题作为默认
        setSelectedTheme(THEMES[0])
        setModules(THEMES[0].modules)
      }
    }

    loadUser()
  }, [address])

  // 处理调整大小的全局事件
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingModule) {
        handleResize(e as any)
      }
    }

    const handleMouseUp = () => {
      if (resizingModule) {
        handleResizeEnd()
      }
    }

    if (resizingModule) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizingModule])

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

  const handleResizeStart = (module: Module, direction: string) => {
    setResizingModule({ module, direction })
  }

  const handleResizeEnd = () => {
    setResizingModule(null)
  }

  const handleResize = (e: React.MouseEvent) => {
    if (!resizingModule || !gridRef.current) return

    const rect = gridRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const cellWidth = rect.width / gridSize.cols
    const cellHeight = rect.height / gridSize.rows

    let newWidth = resizingModule.module.size.width
    let newHeight = resizingModule.module.size.height

    if (resizingModule.direction.includes('right')) {
      newWidth = Math.max(1, Math.min(gridSize.cols - resizingModule.module.position.x, Math.ceil(x / cellWidth)))
    }
    if (resizingModule.direction.includes('bottom')) {
      newHeight = Math.max(1, Math.min(gridSize.rows - resizingModule.module.position.y, Math.ceil(y / cellHeight)))
    }

    setModules(prev => prev.map(m => 
      m.id === resizingModule.module.id 
        ? { ...m, size: { width: newWidth, height: newHeight } }
        : m
    ))
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

  const handleApplyLayout = async () => {
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
      console.log('布局应用成功')
      alert('布局已应用！')
    } catch (error) {
      console.error('应用布局失败:', error)
      alert('应用布局失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  const handleApplyCSS = async () => {
    // 保存 CSS 到 localStorage
    localStorage.setItem('custom-css', cssContent)
    
    // 动态应用 CSS
    const styleElement = document.createElement('style')
    styleElement.textContent = cssContent
    document.head.appendChild(styleElement)
    
    alert('CSS 文件已应用！')
  }

  const renderGridLines = () => {
    const lines = []
    
    // 计算互补色
    const hexColor = selectedTheme.colors.bg.replace('#', '')
    const r = parseInt(hexColor.substr(0, 2), 16)
    const g = parseInt(hexColor.substr(2, 2), 16)
    const b = parseInt(hexColor.substr(4, 2), 16)
    const complementColor = `rgb(${255 - r}, ${255 - g}, ${255 - b})`
    
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
            background: complementColor,
            opacity: 0.3,
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
            background: complementColor,
            opacity: 0.3,
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
        background: selectedTheme.colors.bg,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh'
        }}>
          <div style={{
            background: selectedTheme.colors.surface,
            padding: '2rem',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: selectedTheme.colors.primary, margin: '0 0 1rem 0' }}>
              请先连接钱包
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>
              管理面板需要 Web3 钱包授权
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: selectedTheme.colors.bg,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* 头部 */}
      <div style={{
        background: selectedTheme.colors.surface,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${selectedTheme.colors.primary}20`,
        padding: '1rem 2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ 
            color: selectedTheme.colors.primary,
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '700'
          }}>
            🎨 布局管理面板
          </h1>
        </div>
      </div>

      <div style={{
        maxWidth: '1400px',
        margin: '2rem auto',
        padding: '0 2rem',
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '2rem'
      }}>
        {/* 左侧侧边栏 - 主题选择 */}
        <div>
          <div style={{
            background: selectedTheme.colors.surface,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${selectedTheme.colors.primary}20`,
            borderRadius: '16px',
            padding: '1.5rem',
            position: 'sticky',
            top: '2rem'
          }}>
            <h2 style={{ 
              color: selectedTheme.colors.primary,
              margin: '0 0 1rem 0',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              🎭 选择主题
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {THEMES.map(theme => (
                <div
                  key={theme.id}
                  onClick={() => handleThemeChange(theme)}
                  style={{
                    background: selectedTheme.id === theme.id ? `${selectedTheme.colors.primary}20` : 'rgba(255,255,255,0.05)',
                    border: selectedTheme.id === theme.id ? `2px solid ${selectedTheme.colors.primary}` : `1px solid ${selectedTheme.colors.primary}30`,
                    borderRadius: '12px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}>
                      {theme.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        color: selectedTheme.colors.primary,
                        margin: '0 0 0.25rem 0', 
                        fontSize: '1rem',
                        fontWeight: '600'
                      }}>
                        {theme.name}
                      </h3>
                      <p style={{ 
                        color: '#666',
                        margin: 0, 
                        fontSize: '0.75rem',
                        lineHeight: '1.3'
                      }}>
                        {theme.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧内容区 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          {/* 布局编辑器 */}
          <div style={{
            background: selectedTheme.colors.surface,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${selectedTheme.colors.primary}20`,
            borderRadius: '16px',
            padding: '1.5rem'
          }}>
            <h2 style={{ 
              color: selectedTheme.colors.primary,
              margin: '0 0 1rem 0',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
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
                    background: selectedTheme.colors.primary + 'CC',
                    border: `2px solid ${selectedTheme.colors.primary}`,
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
                       module.component === 'links' ? '🔗' : 
                       module.component === 'social' ? '📱' : '🐦'}
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      {module.name}
                    </div>
                  </div>
                  
                  {/* 调整大小的手柄 */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '0',
                      bottom: '0',
                      width: '16px',
                      height: '16px',
                      background: 'rgba(255,255,255,0.8)',
                      border: '2px solid ' + selectedTheme.colors.primary,
                      borderRadius: '0 0 6px 0',
                      cursor: 'se-resize',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      handleResizeStart(module, 'right-bottom')
                    }}
                  >
                    <div style={{
                      width: '4px',
                      height: '4px',
                      background: selectedTheme.colors.primary,
                      borderRadius: '50%'
                    }} />
                  </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  💡 <strong>使用提示：</strong>
                </div>
                <button
                  onClick={handleApplyLayout}
                  disabled={isSaving}
                  style={{
                    background: isSaving ? 'rgba(255,255,255,0.3)' : selectedTheme.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                >
                  {isSaving ? '应用中...' : '应用布局'}
                </button>
              </div>
              <ul style={{ margin: '0', paddingLeft: '1.5rem' }}>
                <li>拖拽模块到新位置来调整布局</li>
                <li>模块会自动对齐到网格</li>
                <li>选择不同的主题模板来快速切换布局</li>
                <li>点击"应用布局"来应用更改</li>
              </ul>
            </div>
          </div>

          {/* CSS 编辑器 */}
          <div style={{
            background: selectedTheme.colors.surface,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${selectedTheme.colors.primary}20`,
            borderRadius: '16px',
            padding: '1.5rem'
          }}>
            <h2 style={{ 
              color: selectedTheme.colors.primary,
              margin: '0 0 1rem 0',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
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
                    border: `1px solid ${selectedTheme.colors.primary}30`,
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
                  onClick={() => {
                    // 重置为当前主题的默认 CSS
                    handleThemeChange(selectedTheme)
                  }}
                  style={{
                    background: '#6B7280',
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
                <button
                  onClick={handleApplyCSS}
                  style={{
                    background: selectedTheme.colors.secondary,
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
                  📝 应用 CSS 文件
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
                <li>点击"重置 CSS"恢复当前主题的默认样式</li>
                <li>点击"应用 CSS 文件"来应用自定义样式</li>
                <li>主题切换时会自动更新 CSS 内容</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
