import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { api, type User, type Link, type LinkGroup, PREDEFINED_ICONS, getUserAvatarUrl } from '../lib/api'
import { SettingsModal } from '../components/SettingsModal'

// 主题配置 - 从 admin 面板导入相同的主题
const THEMES = [
  {
    id: 1,
    name: '钻石手',
    colors: {
      primary: '#FF8C42',
      secondary: '#1C6E9C',
      bg: '#F8F9FA',
      surface: '#FFFFFF'
    }
  },
  {
    id: 2,
    name: 'HODL蓝',
    colors: {
      primary: '#1C6E9C',
      secondary: '#FF8C42',
      bg: '#EBF8FF',
      surface: '#FFFFFF'
    }
  },
  {
    id: 3,
    name: '草莓熊',
    colors: {
      primary: '#FF6B9D',
      secondary: '#C66FBC',
      bg: '#FFF0F5',
      surface: '#FFFFFF'
    }
  },
  {
    id: 4,
    name: '赛博橙',
    colors: {
      primary: '#FF6B35',
      secondary: '#00D9FF',
      bg: '#0A0E27',
      surface: '#1A1F3A'
    }
  },
  {
    id: 5,
    name: '韭菜绿',
    colors: {
      primary: '#52C41A',
      secondary: '#52C41A',
      bg: '#F6FFED',
      surface: '#FFFFFF'
    }
  },
  {
    id: 6,
    name: '拿铁棕',
    colors: {
      primary: '#8B4513',
      secondary: '#D2691E',
      bg: '#FFF8DC',
      surface: '#FFFFFF'
    }
  },
  {
    id: 7,
    name: '神秘紫',
    colors: {
      primary: '#6B46C1',
      secondary: '#9F7AEA',
      bg: '#F7FAFC',
      surface: '#FFFFFF'
    }
  },
  {
    id: 8,
    name: '深海蓝',
    colors: {
      primary: '#0891B2',
      secondary: '#06B6D4',
      bg: '#F0F9FF',
      surface: '#FFFFFF'
    }
  }
]

// 推特时间线组件
const TwitterTimeline = ({ twitterHandle }: { twitterHandle: string }) => {
  useEffect(() => {
    // 动态加载 Twitter widgets 脚本
    const script = document.createElement('script')
    script.src = 'https://platform.twitter.com/widgets.js'
    script.charset = 'utf-8'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // 清理脚本
      const existingScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]')
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript)
      }
    }
  }, [])

  return (
    <div style={{
      marginTop: '2rem',
      width: '100%',
      maxWidth: '600px'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{
          color: 'white',
          margin: '0 0 1rem 0',
          fontSize: '1.2rem',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          🐦 推特动态
        </h3>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          minHeight: '400px'
        }}>
          <blockquote 
            className="twitter-tweet" 
            data-width="500"
            data-theme="light"
          >
            <a 
              href={`https://twitter.com/${twitterHandle}?ref_src=twsrc%5Etfw`}
              target="_blank"
              rel="noopener noreferrer"
            >
              @{twitterHandle} 的推文
            </a>
          </blockquote>
        </div>
      </div>
    </div>
  )
}


// 获取图标
const getIconElement = (iconId?: string): React.ReactNode => {
  if (!iconId) return '🔗'
  const icon = PREDEFINED_ICONS.find(i => i.id === iconId)
  
  if (icon?.icoFile) {
    return (
      <img 
        src={icon.icoFile} 
        alt={icon.name}
        style={{ 
          width: '24px', 
          height: '24px',
          objectFit: 'contain'
        }}
        onError={(e) => {
          // 如果 ico 文件加载失败，显示默认 emoji
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          if (target.nextSibling) {
            (target.nextSibling as HTMLElement).style.display = 'inline'
          }
        }}
      />
    )
  }
  
  return icon?.emoji || '🔗'
}

export default function UserProfile({ username: propUsername }: { username?: string }) {
  const { username: paramUsername } = useParams<{ username: string }>()
  const { address } = useAccount()
  
  // 优先使用传入的 username prop（来自子域名），其次使用 URL 参数
  const username = propUsername || paramUsername
  
  const [user, setUser] = useState<User | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [groups, setGroups] = useState<LinkGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [showWalletAddress, setShowWalletAddress] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]) // 默认主题
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [layoutModules, setLayoutModules] = useState<any[]>([]) // 布局模块

  useEffect(() => {
    if (!username) return
    
    const loadUserData = async () => {
      try {
        let userData = await api.getUserByUsername(username)
        
        if (!userData) {
          // 创建新用户，如果钱包已连接则使用钱包地址
          if (address) {
            const newUser = await api.createUser(username, address)
            userData = { user: newUser, links: [], groups: [] }
          } else {
            // 如果没有钱包连接，显示提示
            setLoading(false)
            return
          }
        }
        
        setUser(userData.user)
        setLinks(userData.links)
        setGroups(userData.groups)
        
        // 设置主题和布局
        if (userData.user.layout) {
          const theme = THEMES.find(t => t.id === userData.user.layout!.themeId)
          if (theme) {
            setCurrentTheme(theme)
            setLayoutModules(userData.user.layout.modules || [])
          }
        } else {
          // 如果用户没有设置布局，使用第一个主题的默认布局
          setCurrentTheme(THEMES[0])
          setLayoutModules([
            { id: 'profile', name: '用户资料', component: 'profile', position: { x: 0, y: 0 }, size: { width: 3, height: 2 } },
            { id: 'mostfind', name: '我活跃在', component: 'mostfind', position: { x: 0, y: 2 }, size: { width: 2, height: 2 } },
            { id: 'links', name: '注册链接', component: 'links', position: { x: 2, y: 2 }, size: { width: 4, height: 4 } },
            { id: 'social', name: '社交媒体', component: 'social', position: { x: 3, y: 0 }, size: { width: 3, height: 2 } },
            { id: 'twitter', name: '推特时间线', component: 'twitter', position: { x: 0, y: 6 }, size: { width: 6, height: 4 } }
          ])
        }
        
        // 设置页面标题：昵称｜CAT｜Your Web3 Paws
        const displayName = userData.user.nickname || userData.user.username
        document.title = `${displayName}｜CAT｜Your Web3 Paws`
        
        // 检查是否为所有者
        setIsOwner(!!(address && address.toLowerCase() === userData.user.walletAddress.toLowerCase()))
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [username, address])

  // 检测是否有未保存的更改
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // 离开页面自动保存功能
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEditing && hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = '您有未保存的更改，确定要离开吗？'
        
        // 自动保存
        autoSave()
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isEditing && hasUnsavedChanges) {
        // 页面隐藏时自动保存
        autoSave()
      }
    }

    const handlePageHide = () => {
      if (isEditing && hasUnsavedChanges) {
        // 页面隐藏时自动保存
        autoSave()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [isEditing, hasUnsavedChanges])

  // 自动保存功能
  const autoSave = async () => {
    if (!user || !isEditing) return
    
    try {
      await api.updateUser(username!, user)
      await api.updateLinks(username!, links)
      await api.updateGroups(username!, groups)
      setHasUnsavedChanges(false)
      console.log('自动保存成功')
    } catch (error) {
      console.error('自动保存失败:', error)
    }
  }

  // 检测链接和分组变化
  useEffect(() => {
    if (!isEditing) return
    
    // 这里可以添加更复杂的变化检测逻辑
    // 简单起见，只要在编辑模式下就认为有未保存的更改
    setHasUnsavedChanges(true)
  }, [links, groups, isEditing])





  // 保存设置
  const handleSaveSettings = async (updatedUser: User) => {
    try {
      await api.updateUser(username!, updatedUser)
      setUser(updatedUser)
    } catch (error) {
      console.error('保存设置失败:', error)
      throw error
    }
  }

  // 添加新链接
  const addLink = () => {
    const newLink: Link = {
      id: Date.now().toString(),
      label: '新链接',
      url: '',
      description: '',
      group: '',
      icon: 'link',
      order: links.length + 1,
      userId: username!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setLinks([...links, newLink])
  }

  // 更新链接
  const updateLink = (id: string, field: keyof Link, value: string | number) => {
    setLinks(links.map(link => {
      if (link.id === id) {
        const updatedLink = { ...link, [field]: value }
        return updatedLink
      }
      return link
    }))
  }

  // 删除链接
  const deleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id))
  }



  if (loading) {
    return <div className="blog-container">加载中...</div>
  }

  if (!user) {
    return <div className="blog-container">用户不存在</div>
  }

  // 临时使用layoutModules来避免构建错误
  console.log('Current layout modules:', layoutModules.length)

  return (
    <div style={{ 
      minHeight: '100vh',
      background: currentTheme.colors.bg,
      padding: '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* 1800像素宽的格子布局容器 */}
      <div style={{
        width: '1800px',
        maxWidth: '100%',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 300px)',
        gridTemplateRows: 'repeat(9, 300px)',
        gap: '1rem',
        minHeight: '900px'
      }}>
        {/* 临时显示布局信息 */}
        <div style={{
          gridColumn: '1 / span 6',
          gridRow: '1 / span 1',
          background: currentTheme.colors.surface + '10',
          borderRadius: '16px',
          padding: '1rem',
          border: `1px solid ${currentTheme.colors.primary}20`,
          textAlign: 'center'
        }}>
          <h3 style={{ 
            color: currentTheme.colors.primary, 
            margin: '0 0 0.5rem 0',
            fontSize: '1.2rem',
            fontWeight: '600'
          }}>
            🌐 布局系统已启用
          </h3>
          <p style={{ 
            color: currentTheme.id === 4 ? 'rgba(255,255,255,0.9)' : '#666', 
            margin: 0,
            fontSize: '0.9rem'
          }}>
            容器宽度: 1800px | 格子尺寸: 300px × 300px | 网格: 6×9
          </p>
          <p style={{ 
            color: currentTheme.id === 4 ? 'rgba(255,255,255,0.9)' : '#666', 
            margin: '0.5rem 0',
            fontSize: '0.8rem',
            opacity: 0.7
          }}>
            当前布局模块数量: {layoutModules.length}
          </p>
        </div>
      </div>
      {/* 头像区域 */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {getUserAvatarUrl(user) ? (
          <img 
            src={getUserAvatarUrl(user!)} 
            alt={user?.username}
            style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
            }}
            onError={(e) => {
              // 如果头像加载失败，显示默认头像
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        ) : (
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            border: '4px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            {user?.username?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
        
        <h1 style={{ 
          color: currentTheme.colors.primary, 
          margin: '0 0 0.5rem 0',
          fontSize: '2rem',
          fontWeight: 'bold',
          textShadow: currentTheme.id === 4 ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
        }}>
          {user?.username}
        </h1>
        
        {user?.bio && (
          <p style={{ 
            color: currentTheme.id === 4 ? 'rgba(255,255,255,0.9)' : '#666', 
            margin: '0 0 1rem 0',
            fontSize: '1.1rem',
            maxWidth: '600px',
            lineHeight: 1.5
          }}>
            {user.bio}
          </p>
        )}
        
        {/* 钱包地址 */}
        {user?.walletAddress && user.walletAddress !== '0x0000' && (
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => setShowWalletAddress(!showWalletAddress)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: currentTheme.colors.surface + '20',
                border: `1px solid ${currentTheme.colors.primary}30`,
                borderRadius: '20px',
                padding: '0.5rem 1rem',
                color: currentTheme.id === 4 ? 'white' : currentTheme.colors.primary,
                cursor: 'pointer',
                fontSize: '0.9rem',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = currentTheme.colors.surface + '40'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = currentTheme.colors.surface + '20'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>💼</span>
              {showWalletAddress ? user.walletAddress : `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
            </button>
          </div>
        )}

        {/* 认证徽章 - 绿色邮戳/印章风格 */}
        {user?.walletAddress && user.walletAddress !== '0x0000' && (
          <div style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2rem',
            transform: 'rotate(-8deg)',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
          }}>
            {/* SVG 虚线边框背景 */}
            <svg
              width="280"
              height="80"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="roughPaper">
                  <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
                </filter>
                <filter id="greenGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* 外层虚线圆 */}
              <circle
                cx="140"
                cy="40"
                r="35"
                fill="none"
                stroke="#2d5016"
                strokeWidth="2"
                strokeDasharray="8 4 3 6 5 3"
                filter="url(#roughPaper)"
                opacity="0.8"
              />
              
              {/* 内层虚线圆 */}
              <circle
                cx="140"
                cy="40"
                r="30"
                fill="none"
                stroke="#4a7c28"
                strokeWidth="1.5"
                strokeDasharray="6 3 4 4"
                filter="url(#roughPaper)"
                opacity="0.6"
              />
              
              {/* 点线装饰 */}
              <circle
                cx="140"
                cy="40"
                r="25"
                fill="none"
                stroke="#6b9e3a"
                strokeWidth="1"
                strokeDasharray="2 3"
                opacity="0.4"
              />
            </svg>
            
            {/* 内容区域 */}
            <div style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem 1.5rem',
              background: 'radial-gradient(circle, rgba(76, 175, 80, 0.15) 0%, rgba(46, 125, 50, 0.25) 100%)',
              borderRadius: '50%',
              border: '2px solid rgba(76, 175, 80, 0.3)',
              boxShadow: `
                inset 0 2px 4px rgba(0,0,0,0.2),
                0 0 20px rgba(76, 175, 80, 0.3),
                0 0 40px rgba(76, 175, 80, 0.1)
              `
            }}>
              <div style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#2e7d32',
                marginBottom: '0.25rem',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                fontFamily: 'serif'
              }}>
                ✓
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#388e3c',
                textAlign: 'center',
                lineHeight: 1.2,
                fontFamily: 'serif',
                fontWeight: '500'
              }}>
                该页面由<br/>
                <span style={{ 
                  fontFamily: 'monospace',
                  fontSize: '0.7rem',
                  letterSpacing: '0.5px'
                }}>
                  {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                </span>
                <br/>
                签名认证
              </div>
            </div>
            
            {/* 伪元素效果 - 通过额外div实现 */}
            <div style={{
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              right: '-2px',
              bottom: '-2px',
              border: '1px dashed rgba(76, 175, 80, 0.2)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />
            
            <div style={{
              position: 'absolute',
              top: '2px',
              left: '2px',
              right: '2px',
              bottom: '2px',
              border: '1px dotted rgba(139, 195, 74, 0.15)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />
          </div>
        )}
      </div>

      {/* 注册链接 */}
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{
          background: currentTheme.colors.surface + '10',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: `1px solid ${currentTheme.colors.primary}20`
        }}>
          <h3 style={{ 
            color: currentTheme.colors.primary, 
            margin: '0 0 1rem 0',
            fontSize: '1.3rem',
            fontWeight: '600',
            textShadow: currentTheme.id === 4 ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
          }}>
            🔗 注册链接
          </h3>
          {links.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <p style={{ 
                color: currentTheme.id === 4 ? 'white' : '#666', 
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>
                暂无链接
              </p>
              {isEditing && (
                <button
                  onClick={addLink}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    background: currentTheme.colors.primary + '20',
                    border: `1px solid ${currentTheme.colors.primary}40`,
                    borderRadius: '8px',
                    color: currentTheme.colors.primary,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = currentTheme.colors.primary + '30'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = currentTheme.colors.primary + '20'
                  }}
                >
                  + 添加第一个链接
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {links.map((link) => (
                <div
                  key={link.id}
                  onClick={() => !isEditing && link.url && window.open(link.url, '_blank')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.5rem',
                    background: currentTheme.colors.surface + '05',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${currentTheme.colors.primary}10`,
                    borderRadius: '12px',
                    color: currentTheme.id === 4 ? 'white' : '#333',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    cursor: isEditing ? 'default' : link.url ? 'pointer' : 'default'
                  }}
                  onMouseEnter={(e) => {
                    if (!isEditing && link.url) {
                      e.currentTarget.style.background = currentTheme.colors.surface + '10'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isEditing) {
                      e.currentTarget.style.background = currentTheme.colors.surface + '05'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>
                    {isEditing ? (
                      <select
                        value={link.icon || 'link'}
                        onChange={(e) => updateLink(link.id, 'icon', e.target.value)}
                        style={{
                          background: currentTheme.colors.surface + '20',
                          border: `1px solid ${currentTheme.colors.primary}30`,
                          borderRadius: '6px',
                          color: currentTheme.id === 4 ? 'white' : currentTheme.colors.primary,
                          padding: '0.25rem',
                          fontSize: '1rem'
                        }}
                      >
                        {PREDEFINED_ICONS.map(icon => (
                          <option key={icon.id} value={icon.id}>
                            {icon.emoji} {icon.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      getIconElement(link.icon)
                    )}
                  </span>
                  <div style={{ flex: 1 }}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                        style={{
                          width: '100%',
                          background: currentTheme.colors.surface + '20',
                          border: `1px solid ${currentTheme.colors.primary}30`,
                          borderRadius: '6px',
                          color: currentTheme.id === 4 ? 'white' : '#333',
                          padding: '0.5rem',
                          fontSize: '1rem',
                          fontWeight: '600',
                          marginBottom: '0.5rem'
                        }}
                      />
                    ) : (
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        {link.label}
                      </div>
                    )}
                    
                    {isEditing ? (
                      <textarea
                        value={link.description || ''}
                        onChange={(e) => updateLink(link.id, 'description', e.target.value)}
                        placeholder="链接说明（可选）"
                        rows={2}
                        style={{
                          width: '100%',
                          background: currentTheme.colors.surface + '20',
                          border: `1px solid ${currentTheme.colors.primary}30`,
                          borderRadius: '6px',
                          color: currentTheme.id === 4 ? 'white' : '#333',
                          padding: '0.5rem',
                          fontSize: '0.9rem',
                          marginBottom: '0.5rem',
                          resize: 'vertical'
                        }}
                      />
                    ) : (
                      link.description && (
                        <div style={{ 
                          fontSize: '0.85rem', 
                          opacity: 0.8,
                          lineHeight: 1.3
                        }}>
                          {link.description}
                        </div>
                      )
                    )}
                    
                    {isEditing ? (
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                        placeholder="https://example.com"
                        style={{
                          width: '100%',
                          background: currentTheme.colors.surface + '20',
                          border: `1px solid ${currentTheme.colors.primary}30`,
                          borderRadius: '6px',
                          color: currentTheme.id === 4 ? 'white' : '#333',
                          padding: '0.5rem',
                          fontSize: '0.8rem',
                          fontFamily: 'monospace'
                        }}
                      />
                    ) : (
                      link.url && (
                        <div style={{
                          fontSize: '0.8rem',
                          opacity: 0.6,
                          fontFamily: 'monospace',
                          wordBreak: 'break-all'
                        }}>
                          {link.url}
                        </div>
                      )
                    )}
                  </div>
                  
                  {isEditing ? (
                    <button
                      onClick={() => deleteLink(link.id)}
                      style={{
                        padding: '0.5rem',
                        background: 'rgba(244, 67, 54, 0.8)',
                        border: '1px solid rgba(244, 67, 54, 0.3)',
                        borderRadius: '6px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      删除
                    </button>
                  ) : (
                    <span style={{ fontSize: '1rem', opacity: 0.7 }}>
                      →
                    </span>
                  )}
                </div>
              ))}
              
              {isEditing && (
                <button
                  onClick={addLink}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: currentTheme.colors.primary + '20',
                    border: `1px solid ${currentTheme.colors.primary}40`,
                    borderRadius: '12px',
                    color: currentTheme.colors.primary,
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    marginTop: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = currentTheme.colors.primary + '30'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = currentTheme.colors.primary + '20'
                  }}
                >
                  + 添加新链接
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 社交媒体 */}
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{
          background: currentTheme.colors.surface + '10',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: `1px solid ${currentTheme.colors.primary}20`
        }}>
          <h3 style={{ 
            color: currentTheme.colors.primary, 
            margin: '0 0 1rem 0',
            fontSize: '1.3rem',
            fontWeight: '600',
            textShadow: currentTheme.id === 4 ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
          }}>
            📱 社交媒体
          </h3>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {user?.twitterHandle && (
              <a
                href={`https://twitter.com/${user.twitterHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: currentTheme.colors.surface + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  fontSize: '1.5rem',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  border: `1px solid ${currentTheme.colors.primary}30`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = currentTheme.colors.surface + '40'
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = currentTheme.colors.surface + '20'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                🐦
              </a>
            )}
            {/* 可以在这里添加更多社交媒体图标 */}
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                border: '1px dashed rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.5)'
              }}
            >
              +
            </div>
          </div>
        </div>
      </div>

      {/* 推特时间线 */}
      {user?.twitterHandle && (
        <TwitterTimeline twitterHandle={user.twitterHandle} />
      )}

      {/* 底部编辑链接 */}
      <div style={{ marginTop: '3rem' }}>
        {isOwner ? (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => {
                if (isEditing) {
                  // 完成编辑时自动保存
                  autoSave()
                  setIsEditing(false)
                  setHasUnsavedChanges(false)
                } else {
                  setIsEditing(true)
                }
              }}
              style={{
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: '0.9rem',
                padding: '0.6rem 1.2rem',
                borderRadius: '25px',
                background: isEditing ? '#f44336' : '#4caf50',
                border: '2px solid #ffffff',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                display: 'inline-block',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                fontWeight: '600',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                textTransform: 'none',
                lineHeight: '1.2',
                minWidth: '120px',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isEditing ? '#d32f2f' : '#388e3c'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isEditing ? '#f44336' : '#4caf50'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {isEditing ? '完成编辑' : '进入编辑模式'}
            </button>
            
            {/* 主题选择器按钮 - 只在编辑模式下显示 */}
            {isEditing && (
              <button
                onClick={() => setShowThemeSelector(true)}
                style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '25px',
                  background: '#2196f3',
                  border: '2px solid #ffffff',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  display: 'inline-block',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  fontWeight: '600',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  textTransform: 'none',
                  lineHeight: '1.2',
                  minWidth: '120px',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1976d2'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#2196f3'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                选择主题
              </button>
            )}
          </div>
        ) : (
          <a
            href={`https://${username}.catcat.meme/edit`}
            style={{
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
            }}
          >
            编辑我的链接
          </a>
        )}
      </div>
      
      {/* 设置模态框 */}
      {user && (
        <SettingsModal
          user={user}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
        />
      )}
      
      {/* 主题选择器模态框 */}
      {showThemeSelector && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', textAlign: 'center', color: '#333' }}>
              选择主题
            </h3>
            
            {/* 九宫格主题选择器 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {/* 保持现状 - 中央位置 */}
              <div
                onClick={() => {
                  setShowThemeSelector(false)
                }}
                style={{
                  gridColumn: '2',
                  gridRow: '2',
                  border: '2px solid #ddd',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: '#f8f9fa',
                  minHeight: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎨</div>
                <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '600' }}>保持现状</div>
              </div>
              
              {/* 8个主题选项 */}
              {THEMES.map((theme, index) => {
                // 计算九宫格位置 (0-7 对应周围8个位置)
                const positions = [
                  { col: 1, row: 1 }, // 左上
                  { col: 2, row: 1 }, // 中上
                  { col: 3, row: 1 }, // 右上
                  { col: 1, row: 2 }, // 左中
                  { col: 3, row: 2 }, // 右中
                  { col: 1, row: 3 }, // 左下
                  { col: 2, row: 3 }, // 中下
                  { col: 3, row: 3 }  // 右下
                ]
                const pos = positions[index]
                const isCurrentTheme = currentTheme.id === theme.id
                
                return (
                  <div
                    key={theme.id}
                    onClick={() => {
                      setCurrentTheme(theme)
                      setShowThemeSelector(false)
                    }}
                    style={{
                      gridColumn: pos.col,
                      gridRow: pos.row,
                      border: isCurrentTheme ? '3px solid ' + theme.colors.primary : '2px solid #ddd',
                      borderRadius: '12px',
                      padding: '1rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isCurrentTheme ? theme.colors.bg + '40' : '#f8f9fa',
                      minHeight: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      boxShadow: isCurrentTheme ? `0 4px 12px ${theme.colors.primary}40` : '0 2px 4px rgba(0,0,0,0.1)',
                      transform: isCurrentTheme ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentTheme) {
                        e.currentTarget.style.background = theme.colors.bg + '60'
                        e.currentTarget.style.transform = 'scale(1.02)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentTheme) {
                        e.currentTarget.style.background = '#f8f9fa'
                        e.currentTarget.style.transform = 'scale(1)'
                      }
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                        marginBottom: '0.5rem'
                      }}
                    />
                    <div style={{ fontSize: '0.8rem', color: '#333', fontWeight: '600' }}>
                      {theme.name}
                    </div>
                    {isCurrentTheme && (
                      <div style={{ 
                        fontSize: '0.7rem', 
                        color: theme.colors.primary, 
                        fontWeight: '700',
                        marginTop: '0.25rem'
                      }}>
                        当前选择
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            
            {/* 关闭按钮 */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setShowThemeSelector(false)}
                style={{
                  padding: '0.8rem 2rem',
                  background: '#6c757d',
                  border: 'none',
                  borderRadius: '25px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
