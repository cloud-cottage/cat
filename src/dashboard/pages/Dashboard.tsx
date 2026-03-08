import { useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import { api, type User } from '../../page/lib/api'
import { THEMES as SHARED_THEMES, getThemeClassName } from '../../themes'
import { parseThemeLayoutFromCSS, type Module as LayoutModule } from '../lib/layout-parser'
import { saveLayoutToCSSFile, validateLayout } from '../lib/layout-saver'

interface Module extends LayoutModule {
  // Admin页面特有的Module属性可以在这里扩展
}

interface DashboardTheme {
  id: number
  name: string
  className: string // 添加className属性
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

// Dashboard专用的主题配置 - 使用共享的颜色但添加预览和描述
const DASHBOARD_THEMES: DashboardTheme[] = SHARED_THEMES.map((theme) => ({
  ...theme,
  description: getThemeDescription(theme.name),
  preview: `/themes/${theme.className.replace('theme-', '')}.png`,
  modules: [] // 初始化为空，将在组件加载时异步填充
}))

function getThemeDescription(name: string): string {
  const descriptions: Record<string, string> = {
    '钻石手': '清爽简约，专注内容',
    'HODL蓝': '专业稳重，值得信赖',
    '草莓熊': '可爱甜美，温馨舒适',
    '赛博橙': '科技未来，动感活力',
    '韭菜帝国': '生机勃勃，自然清新',
    '拿铁棕': '温暖醇厚，舒适安逸',
    '神秘紫': '优雅神秘，独特个性',
    'Web3': '数字未来，去中心化'
  }
  return descriptions[name] || '个性化主题'
}

function getDefaultModules(): Module[] {
  return [
    {
      id: 'profile',
      name: '用户资料',
      component: 'profile' as const,
      position: { x: 0, y: 0 },
      size: { width: 3, height: 2 }
    },
    {
      id: 'social',
      name: '社交媒体',
      component: 'social' as const,
      position: { x: 3, y: 0 },
      size: { width: 3, height: 2 }
    },
    {
      id: 'mostfind',
      name: '我活跃在',
      component: 'mostfind' as const,
      position: { x: 0, y: 2 },
      size: { width: 2, height: 2 }
    },
    {
      id: 'links',
      name: '注册链接',
      component: 'links' as const,
      position: { x: 2, y: 2 },
      size: { width: 4, height: 4 }
    },
    {
      id: 'twitter',
      name: '推特动态',
      component: 'twitter' as const,
      position: { x: 0, y: 6 },
      size: { width: 6, height: 4 }
    }
  ];
}

export const Dashboard: React.FC = () => {
  const { address } = useAccount()
  const [user, setUser] = useState<User | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<DashboardTheme>(DASHBOARD_THEMES[0])
  const [modules, setModules] = useState<Module[]>(DASHBOARD_THEMES[0].modules)
  const [draggedModule, setDraggedModule] = useState<Module | null>(null)
  const [resizingModule, setResizingModule] = useState<{ module: Module; direction: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditingDisabled, setIsEditingDisabled] = useState(false)
  
  // 被禁止的用户名管理状态
  const [newForbiddenUsername, setNewForbiddenUsername] = useState('')
  const [forbiddenUsernames, setForbiddenUsernames] = useState<string[]>([
    'admin', 'administrator', 'root', 'system', 'api', 'www', 'mail', 'ftp',
    'i', 'username', 'user', 'users', 'profile', 'profiles', 'edit', 'editor',
    'setup', 'config', 'configuration', 'settings', 'dashboard', 'admin',
    'test', 'demo', 'example', 'sample', 'temp', 'temporary'
  ])
  
  // 当前选中的侧边栏菜单项
  const [activeSidebarItem, setActiveSidebarItem] = useState<'theme' | 'forbidden'>('theme')

  // 异步加载所有主题布局
  useEffect(() => {
    const loadThemeLayouts = async () => {
      try {
        console.log('Loading theme layouts from CSS...');
        console.log('DASHBOARD_THEMES count:', DASHBOARD_THEMES.length);
        
        // 为每个主题加载布局
        const updatedThemes = await Promise.all(
          DASHBOARD_THEMES.map(async (theme) => {
            console.log('Loading layout for theme:', theme.name, theme.className);
            const themeName = theme.className.replace('theme-', '');
            const layout = await parseThemeLayoutFromCSS(theme.id, themeName, theme.className);
            
            console.log('Layout loaded for', theme.name, ':', layout.modules.length, 'modules');
            
            return {
              ...theme,
              modules: layout.modules
            };
          })
        );

        // 更新DASHBOARD_THEMES（这里我们需要创建一个状态来存储更新的主题）
        console.log('Theme layouts loaded:', updatedThemes);
        
        // 设置当前选中主题的模块
        const currentTheme = updatedThemes.find(t => t.id === selectedTheme.id);
        if (currentTheme) {
          console.log('Setting current theme modules:', currentTheme.modules.length);
          setSelectedTheme(currentTheme);
          setModules(currentTheme.modules);
        }
        
        // 设置初始编辑禁用状态
        setIsEditingDisabled(selectedTheme.id === 1)
      } catch (error) {
        console.error('Failed to load theme layouts:', error);
        // 如果加载失败，使用默认布局
        setModules(getDefaultModules());
        setIsEditingDisabled(selectedTheme.id === 1)
      }
    };

    loadThemeLayouts();
  }, []); // 只在组件挂载时执行一次
  
  // 加载被禁止的用户名列表
  useEffect(() => {
    const loadForbiddenUsernames = async () => {
      try {
        const usernames = await api.getForbiddenUsernames()
        setForbiddenUsernames(usernames)
      } catch (error) {
        console.error('Failed to load forbidden usernames:', error)
      }
    }
    
    loadForbiddenUsernames()
  }, [])
  
  // CSS 编辑器状态
  const [cssContent, setCssContent] = useState(`:root {
  /* 品牌色彩 */
  --color-primary: ${DASHBOARD_THEMES[0].colors.primary};
  --color-secondary: ${DASHBOARD_THEMES[0].colors.secondary};
  
  /* 背景色 */
  --color-bg: ${DASHBOARD_THEMES[0].colors.bg};
  --color-surface: ${DASHBOARD_THEMES[0].colors.surface};
  
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

  // 加载用户数据的函数
  const loadUser = async () => {
    try {
      console.log('开始加载用户数据...')
      // 从URL获取用户名，如果没有则使用'test'作为默认
      const urlParams = new URLSearchParams(window.location.search)
      const targetUsername = urlParams.get('user') || 'test'
      
      console.log('目标用户名:', targetUsername)
      const userData = await api.getUserByUsername(targetUsername)
      console.log('获取到的用户数据:', userData)
      
      if (userData) {
        setUser(userData.user)
        console.log('当前用户布局:', userData.user.layout)
        
        // 加载用户的布局配置
        if (userData.user.layout) {
          console.log('加载用户布局配置:', userData.user.layout)
          setModules(userData.user.layout.modules)
          const theme = DASHBOARD_THEMES.find(t => t.id === userData.user.layout!.themeId)
          if (theme) {
            setSelectedTheme(theme)
            console.log('设置主题:', theme.name)
          }
        } else {
          // 如果用户未设置布局，使用第一个主题作为默认
          console.log('用户未设置布局，使用默认主题')
          setSelectedTheme(DASHBOARD_THEMES[0])
          setModules(DASHBOARD_THEMES[0].modules)
        }
      } else {
        // 如果用户不存在，使用第一个主题作为默认
        console.log('用户不存在，使用默认主题')
        setSelectedTheme(DASHBOARD_THEMES[0])
        setModules(DASHBOARD_THEMES[0].modules)
      }
    } catch (error) {
      console.error('加载用户数据失败:', error)
      // 出错时也使用第一个主题作为默认
      setSelectedTheme(DASHBOARD_THEMES[0])
      setModules(DASHBOARD_THEMES[0].modules)
    }
  }

  useEffect(() => {
    if (!address) return
    
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

  const handleThemeChange = (theme: DashboardTheme) => {
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
    if (!user || isEditingDisabled) return
    
    setIsSaving(true)
    
    try {
      // 验证布局
      const validation = validateLayout(modules)
      if (!validation.valid) {
        alert(`❌ 布局验证失败：\n${validation.errors.join('\n')}`)
        setIsSaving(false)
        return
      }
      
      // 获取主题名称
      const themeName = selectedTheme.className.replace('theme-', '')
      
      // 保存布局到CSS文件
      const cssResult = await saveLayoutToCSSFile(themeName, modules)
      if (!cssResult.success) {
        alert(`❌ CSS保存失败：${cssResult.message}`)
        setIsSaving(false)
        return
      }
      
      // 保存到数据库（保持原有逻辑）
      const userLayout = {
        themeId: selectedTheme.id,
        modules: modules,
        updatedAt: new Date().toISOString(),
        cssLayout: cssResult.cssContent // 添加CSS布局数据
      }
      
      console.log('准备保存的布局数据:', userLayout)
      console.log('当前模块状态:', modules)
      
      const updatedUser = {
        ...user,
        layout: userLayout
      }
      
      console.log('准备更新的用户数据:', updatedUser)
      
      const result = await api.updateUser(user.username, updatedUser)
      console.log('API更新结果:', result)
      setUser(updatedUser)
      console.log('布局应用成功')
      alert(`✅ 布局已成功应用并保存！\n📁 CSS文件已更新\n💾 数据库已同步`)
    } catch (error) {
      console.error('应用布局失败:', error)
      alert('❌ 应用布局失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  const handleApplyCSS = async () => {
    if (isEditingDisabled) {
      alert('⚠️ 默认主题不能应用自定义CSS')
      return
    }
    
    // 保存 CSS 到 localStorage
    localStorage.setItem('custom-css', cssContent)
    
    // 动态应用 CSS
    const styleElement = document.createElement('style')
    styleElement.textContent = cssContent
    document.head.appendChild(styleElement)
    
    alert('✅ CSS 文件已应用！')
  }

  // 处理被禁止的用户名
  const handleAddForbiddenUsername = async () => {
    if (!newForbiddenUsername.trim()) {
      alert('请输入用户名')
      return
    }
    
    if (forbiddenUsernames.includes(newForbiddenUsername.trim())) {
      alert('该用户名已在禁止名单中')
      return
    }
    
    const updatedList = [...forbiddenUsernames, newForbiddenUsername.trim()]
    const success = await api.updateForbiddenUsernames(updatedList)
    
    if (success) {
      setForbiddenUsernames(updatedList)
      setNewForbiddenUsername('')
      alert('用户名已添加到禁止名单')
    } else {
      alert('添加失败，请重试')
    }
  }

  const handleRemoveForbiddenUsername = async (index: number) => {
    const updatedList = forbiddenUsernames.filter((_, i) => i !== index)
    const success = await api.updateForbiddenUsernames(updatedList)
    
    if (success) {
      setForbiddenUsernames(updatedList)
      alert('用户名已从禁止名单中移除')
    } else {
      alert('移除失败，请重试')
    }
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
    <div className={getThemeClassName(selectedTheme.id)} style={{
      minHeight: '100vh',
      background: 'var(--theme-bg)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* 头部 */}
      <div className="theme-module" style={{
        padding: '1rem 2rem'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 className="theme-module-title" style={{ 
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: '700'
          }}>
            🎨 管理面板
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
        {/* 左侧侧边栏 - 菜单栏 */}
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
              🎭 管理菜单
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {/* 主题管理菜单项 */}
              <div
                onClick={() => setActiveSidebarItem('theme')}
                style={{
                  background: activeSidebarItem === 'theme' ? `${selectedTheme.colors.primary}20` : 'rgba(255,255,255,0.05)',
                  border: activeSidebarItem === 'theme' ? `2px solid ${selectedTheme.colors.primary}` : `1px solid ${selectedTheme.colors.primary}30`,
                  borderRadius: '12px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, ${selectedTheme.colors.primary}, ${selectedTheme.colors.secondary})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}>
                    🎨
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      color: selectedTheme.colors.primary,
                      margin: '0 0 0.25rem 0', 
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      主题管理
                    </h3>
                    <p style={{ 
                      color: '#666',
                      margin: 0, 
                      fontSize: '0.75rem',
                      lineHeight: '1.3'
                    }}>
                      选择主题、调整布局和CSS
                    </p>
                  </div>
                </div>
                
                {/* 主题选择列表 */}
                {activeSidebarItem === 'theme' && (
                  <div style={{
                    marginTop: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      padding: '0.5rem',
                      color: selectedTheme.colors.primary,
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      选择主题：
                    </div>
                    {DASHBOARD_THEMES.map(theme => {
                      const isCyberOrange = theme.id === 1 // 赛博橙主题ID
                      return (
                        <div
                          key={theme.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleThemeChange(theme)
                            // 设置编辑禁用状态
                            setIsEditingDisabled(isCyberOrange)
                          }}
                          style={{
                            background: selectedTheme.id === theme.id ? `${selectedTheme.colors.primary}30` : 'rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            opacity: isCyberOrange && selectedTheme.id !== theme.id ? 0.6 : 1
                          }}
                        >
                          <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                          }}>
                            {theme.name.charAt(0)}
                          </div>
                          <span style={{
                            color: selectedTheme.colors.primary,
                            fontSize: '0.85rem',
                            fontWeight: '500'
                          }}>
                            {theme.name}
                            {isCyberOrange && ' (默认)'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 被禁止的用户名菜单项 */}
              <div
                onClick={() => setActiveSidebarItem('forbidden')}
                style={{
                  background: activeSidebarItem === 'forbidden' ? `${selectedTheme.colors.primary}20` : 'rgba(255,255,255,0.05)',
                  border: activeSidebarItem === 'forbidden' ? `2px solid ${selectedTheme.colors.primary}` : `1px solid ${selectedTheme.colors.primary}30`,
                  borderRadius: '12px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, #f44336, #e91e63)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}>
                    🚫
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      color: selectedTheme.colors.primary,
                      margin: '0 0 0.25rem 0', 
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      被禁止的用户名
                    </h3>
                    <p style={{ 
                      color: '#666',
                      margin: 0, 
                      fontSize: '0.75rem',
                      lineHeight: '1.3'
                    }}>
                      管理禁用用户名列表
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧内容区 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          {activeSidebarItem === 'theme' ? (
            <>
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
                  💡 提示：拖拽模块可以调整位置，拖拽右下角可以调整大小。调整完成后点击【应用布局】保存。
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
                  📝 修改 CSS 文件
                </h2>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <textarea
                    value={cssContent}
                    onChange={(e) => setCssContent(e.target.value)}
                    style={{
                      width: '100%',
                      height: '400px',
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${selectedTheme.colors.primary}30`,
                      borderRadius: '8px',
                      color: selectedTheme.colors.primary,
                      padding: '1rem',
                      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      resize: 'vertical'
                    }}
                    placeholder="在这里输入 CSS 代码..."
                  />
                  
                  <div style={{
                    display: 'flex',
                    gap: '1rem'
                  }}>
                    <button
                      onClick={() => setCssContent(`:root {
  /* 品牌色彩 */
  --color-primary: ${selectedTheme.colors.primary};
  --color-secondary: ${selectedTheme.colors.secondary};
  
  /* 背景色 */
  --color-bg: ${selectedTheme.colors.bg};
  --color-surface: ${selectedTheme.colors.surface};
  
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
}`)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#6B7280',
                        border: '1px solid #4B5563',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      重置 CSS
                    </button>
                    
                    <button
                      onClick={handleApplyCSS}
                      disabled={isEditingDisabled}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: isEditingDisabled ? '#ccc' : selectedTheme.colors.primary + '20',
                        border: `1px solid ${isEditingDisabled ? '#999' : selectedTheme.colors.primary + '40'}`,
                        borderRadius: '8px',
                        color: isEditingDisabled ? '#666' : selectedTheme.colors.primary,
                        cursor: isEditingDisabled ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      {isEditingDisabled ? '🚫 默认主题' : '应用 CSS 文件'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 应用布局按钮 */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem'
              }}>
                <button
                  onClick={handleApplyLayout}
                  disabled={isSaving || isEditingDisabled}
                  style={{
                    padding: '1rem 2rem',
                    background: (isSaving || isEditingDisabled) ? '#ccc' : selectedTheme.colors.primary,
                    border: `2px solid ${selectedTheme.colors.primary}`,
                    borderRadius: '12px',
                    color: 'white',
                    cursor: (isSaving || isEditingDisabled) ? 'not-allowed' : 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isSaving ? '保存中...' : isEditingDisabled ? '🚫 默认主题' : '🚀 应用布局'}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* 被禁止的用户名管理 */}
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
                  🚫 被禁止的用户名管理
                </h2>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  {/* 添加新禁用用户名 */}
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${selectedTheme.colors.primary}20`,
                    borderRadius: '12px',
                    padding: '1.5rem'
                  }}>
                    <h3 style={{
                      color: selectedTheme.colors.primary,
                      margin: '0 0 1rem 0',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      ➕ 添加新的禁用用户名
                    </h3>
                    <div style={{
                      display: 'flex',
                      gap: '1rem'
                    }}>
                      <input
                        type="text"
                        value={newForbiddenUsername}
                        onChange={(e) => setNewForbiddenUsername(e.target.value)}
                        placeholder="输入要禁止的用户名"
                        style={{
                          flex: 1,
                          padding: '1rem',
                          background: 'rgba(255,255,255,0.05)',
                          border: `1px solid ${selectedTheme.colors.primary}30`,
                          borderRadius: '8px',
                          color: selectedTheme.colors.primary,
                          fontSize: '1rem'
                        }}
                      />
                      <button
                        onClick={handleAddForbiddenUsername}
                        style={{
                          padding: '1rem 2rem',
                          background: selectedTheme.colors.primary + '20',
                          border: `1px solid ${selectedTheme.colors.primary}40`,
                          borderRadius: '8px',
                          color: selectedTheme.colors.primary,
                          cursor: 'pointer',
                          fontSize: '1rem',
                          fontWeight: '500',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        添加
                      </button>
                    </div>
                  </div>
                  
                  {/* 禁用用户名列表 */}
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${selectedTheme.colors.primary}20`,
                    borderRadius: '12px',
                    padding: '1.5rem'
                  }}>
                    <h3 style={{
                      color: selectedTheme.colors.primary,
                      margin: '0 0 1rem 0',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      📋 当前禁用名单 ({forbiddenUsernames.length} 个)
                    </h3>
                    <div style={{
                      maxHeight: '400px',
                      overflowY: 'auto',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '0.75rem'
                    }}>
                      {forbiddenUsernames.map((username, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${selectedTheme.colors.primary}20`,
                            borderRadius: '8px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <span style={{
                            color: selectedTheme.colors.primary,
                            fontSize: '0.9rem',
                            fontWeight: '500'
                          }}>
                            {username}
                          </span>
                          <button
                            onClick={() => handleRemoveForbiddenUsername(index)}
                            style={{
                              padding: '0.5rem',
                              background: 'rgba(244, 67, 54, 0.8)',
                              border: '1px solid rgba(244, 67, 54, 0.3)',
                              borderRadius: '6px',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            删除
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
