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
  preview: string
  modules: Module[]
}

const THEMES: Theme[] = [
  {
    id: 1,
    name: '经典布局',
    preview: '/themes/classic.png',
    modules: [
      {
        id: 'profile',
        name: '个人资料',
        component: 'profile',
        position: { x: 0, y: 0 },
        size: { width: 4, height: 3 }
      },
      {
        id: 'links',
        name: '链接集合',
        component: 'links',
        position: { x: 0, y: 3 },
        size: { width: 4, height: 4 }
      },
      {
        id: 'twitter',
        name: '推特动态',
        component: 'twitter',
        position: { x: 0, y: 7 },
        size: { width: 4, height: 3 }
      }
    ]
  },
  {
    id: 2,
    name: '侧边栏布局',
    preview: '/themes/sidebar.png',
    modules: [
      {
        id: 'profile',
        name: '个人资料',
        component: 'profile',
        position: { x: 0, y: 0 },
        size: { width: 2, height: 4 }
      },
      {
        id: 'links',
        name: '链接集合',
        component: 'links',
        position: { x: 2, y: 0 },
        size: { width: 2, height: 4 }
      },
      {
        id: 'twitter',
        name: '推特动态',
        component: 'twitter',
        position: { x: 0, y: 4 },
        size: { width: 4, height: 3 }
      }
    ]
  },
  {
    id: 3,
    name: '卡片布局',
    preview: '/themes/cards.png',
    modules: [
      {
        id: 'profile',
        name: '个人资料',
        component: 'profile',
        position: { x: 0, y: 0 },
        size: { width: 2, height: 2 }
      },
      {
        id: 'links',
        name: '链接集合',
        component: 'links',
        position: { x: 2, y: 0 },
        size: { width: 2, height: 3 }
      },
      {
        id: 'twitter',
        name: '推特动态',
        component: 'twitter',
        position: { x: 0, y: 2 },
        size: { width: 4, height: 3 }
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
  const [gridSize] = useState({ cols: 4, rows: 10 })
  const [isSaving, setIsSaving] = useState(false)

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

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme)
    setModules(theme.modules)
  }

  const handleSaveLayout = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const updatedUser = {
        ...user,
        layout: {
          themeId: selectedTheme.id,
          modules
        },
        updatedAt: new Date().toISOString()
      }

      await api.updateUser(user.username, updatedUser)
      setUser(updatedUser)
      alert('布局保存成功！')
    } catch (error) {
      console.error('保存布局失败:', error)
      alert('保存布局失败，请重试')
    } finally {
      setIsSaving(false)
    }
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
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem'
                }}>
                  {theme.id === 1 ? '📱' : theme.id === 2 ? '📋' : '🎴'}
                </div>
                <h3 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
                  {theme.name}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.8rem' }}>
                  {theme.modules.length} 个模块
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
      </div>
    </div>
  )
}
