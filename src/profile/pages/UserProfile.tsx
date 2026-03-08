import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { api, type User, type Link, getUserAvatarUrl } from '../lib/api'
import { THEMES, getThemeClassName } from '../../themes'

interface UserProfileProps {
  username?: string
}

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
    <div>
      <blockquote className="twitter-tweet" data-width="300">
        <a href={`https://twitter.com/${twitterHandle}?ref_src=twsrc%5Etfw`}>Tweets by @{twitterHandle}</a>
      </blockquote>
    </div>
  )
}

export const UserProfile: React.FC<UserProfileProps> = ({ username: propUsername }) => {
  const { username: routeUsername } = useParams<{ username: string }>()
  const username = propUsername || routeUsername
  const { address } = useAccount()
  
  // 状态管理
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [currentTheme, setCurrentTheme] = useState(THEMES[0])
  const [layoutModules, setLayoutModules] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [showWalletAddress, setShowWalletAddress] = useState(false)
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [showExploreModal, setShowExploreModal] = useState(false)

  // 加载用户数据
  useEffect(() => {
    if (!username) return
    
    const loadUserData = async () => {
      try {
        let userData = await api.getUserByUsername(username)
        if (!userData) {
          if (address) {
            const newUser = await api.createUser(username, address)
            userData = { user: newUser, links: [], groups: [] }
          } else {
            setLoading(false)
            return
          }
        }
        
        if (!userData) return
        
        setUser(userData.user)
        setLinks(userData.links)
        if (userData.user.layout) {
          const theme = THEMES.find(t => t.id === userData.user.layout!.themeId)
          if (theme) {
            setCurrentTheme(theme)
            setLayoutModules(userData.user.layout.modules || [])
          }
        } else {
          setCurrentTheme(THEMES[0])
          // 设置默认模块布局
          setLayoutModules([
            { id: 'profile', name: '用户资料', component: 'profile', position: { x: 0, y: 0 }, size: { width: 3, height: 2 } },
            { id: 'mostfind', name: '我活跃在', component: 'mostfind', position: { x: 0, y: 2 }, size: { width: 2, height: 2 } },
            { id: 'links', name: '注册链接', component: 'links', position: { x: 2, y: 2 }, size: { width: 4, height: 4 } },
            { id: 'social', name: '社交媒体', component: 'social', position: { x: 3, y: 0 }, size: { width: 3, height: 2 } },
            { id: 'twitter', name: '推特动态', component: 'twitter', position: { x: 0, y: 6 }, size: { width: 6, height: 4 } }
          ])
        }
        document.title = `${userData.user.nickname || userData.user.username}｜CAT｜Your Web3 Paws`
        setIsOwner(!!(address && address.toLowerCase() === userData.user.walletAddress.toLowerCase()))
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadUserData()
  }, [username, address])

  if (loading) {
    return <div className="blog-container">加载中...</div>
  }

  // 应用主题到body元素
  useEffect(() => {
    // 清除所有主题类名
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    // 添加当前主题类名到body
    document.body.classList.add(getThemeClassName(currentTheme.id));
    
    return () => {
      // 清理：移除主题类名
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
    };
  }, [currentTheme.id]);

  if (!user) {
    return <div className="blog-container">用户不存在</div>
  }

  return (
    <div className="blog-container" style={{ 
      width: '1800px',
      maxWidth: '100%',
      margin: '0 auto',
      minHeight: '100vh',
      padding: '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* 页面主容器 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 网格布局 - 使用CSS中定义的布局 */}
        <div className="grid-container">
        {/* 根据布局模块渲染内容 */}
        {layoutModules.map((module) => (
          <div
            key={module.id}
            className={`theme-module module-${module.component}`}
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <h3 className="theme-module-title" style={{ 
              margin: '0 0 1rem 0',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              {module.component === 'profile' ? (user?.nickname || user?.username) : module.name}
            </h3>
            
            {module.component === 'profile' && (
              <div style={{ textAlign: 'center' }}>
                {getUserAvatarUrl(user) ? (
                  <img 
                    src={getUserAvatarUrl(user!)} 
                    alt={user?.username}
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid rgba(255,255,255,0.2)',
                      margin: '0 auto 1rem'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'white',
                    margin: '0 auto 1rem'
                  }}>
                    {user?.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                
                <h4 style={{ 
                  color: 'var(--theme-primary)', 
                  margin: '0 0 0.5rem 0',
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}>
                  {user?.username}
                </h4>
                
                {user?.bio && (
                  <p className="theme-text-secondary" style={{ 
                    margin: '0 0 1rem 0',
                    fontSize: '0.9rem',
                    lineHeight: 1.4
                  }}>
                    {user.bio}
                  </p>
                )}
                
                {/* 认证徽章 - 绿色邮戳/印章风格 */}
                {user?.walletAddress && user.walletAddress !== '0x0000' && (
                  <div style={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    transform: 'rotate(-8deg)',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                      border: '2px solid rgba(255,255,255,0.3)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <span style={{ fontSize: '0.7rem' }}>该页面由</span>
                      <br/>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        fontFamily: 'monospace',
                        letterSpacing: '0.5px'
                      }}>
                        {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                      </span>
                      <br/>
                      签名认证
                    </div>
                    
                    {/* 伪元素效果 - 通过额外div实现 */}
                    <div style={{
                      position: 'absolute',
                      top: '-2px',
                      left: '-2px',
                      right: '-2px',
                      bottom: '-2px',
                      border: '1px dashed rgba(76, 175, 80, 0.2)',
                      borderRadius: '8px',
                      pointerEvents: 'none'
                    }} />
                    
                    <div style={{
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                      right: '2px',
                      bottom: '2px',
                      border: '1px dotted rgba(139, 195, 74, 0.15)',
                      borderRadius: '8px',
                      pointerEvents: 'none'
                    }} />
                  </div>
                )}
                
                {/* 钱包地址 */}
                {user?.walletAddress && user.walletAddress !== '0x0000' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <button
                      onClick={() => setShowWalletAddress(!showWalletAddress)}
                      className="theme-button"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                        borderRadius: '20px'
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>💼</span>
                      {showWalletAddress ? user.walletAddress : `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {module.component === 'mostfind' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌍</div>
                <p className="theme-text-secondary" style={{ 
                  margin: '0 0 1rem 0',
                  fontSize: '1.1rem',
                  fontWeight: '500'
                }}>
                  我活跃在各大Web3平台
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '2rem' }}>🐦</div>
                  <div style={{ fontSize: '2rem' }}>💎</div>
                  <div style={{ fontSize: '2rem' }}>🚀</div>
                  <div style={{ fontSize: '2rem' }}>🎮</div>
                  <div style={{ fontSize: '2rem' }}>🎨</div>
                </div>
              </div>
            )}
            
            {module.component === 'links' && (
              <div style={{ flex: 1, overflow: 'auto' }}>
                {links.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📝</div>
                    <p className="theme-text-muted" style={{ 
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: '500'
                    }}>
                      暂无链接
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {links.map((link) => (
                      <div
                        key={link.id}
                        onClick={() => link.url && window.open(link.url, '_blank')}
                        className="theme-card"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '1rem',
                          cursor: 'pointer'
                        }}
                      >
                        <div className="theme-tag" style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          padding: 0
                        }}>
                          {link.label.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="theme-text-primary" style={{
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {link.label}
                          </div>
                          {link.description && (
                            <div className="theme-text-muted" style={{
                              fontSize: '0.8rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {link.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {module.component === 'social' && (
              <div style={{ textAlign: 'center' }}>
                {user?.twitterHandle ? (
                  <a
                    href={`https://twitter.com/${user.twitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="theme-button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '25px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      textDecoration: 'none'
                    }}
                  >
                    🐦 Twitter
                  </a>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📱</div>
                    <p className="theme-text-muted" style={{ 
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: '500'
                    }}>
                      暂无社交媒体
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {module.component === 'twitter' && (
              <div style={{ flex: 1, overflow: 'auto' }}>
                {user?.twitterHandle ? (
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1rem',
                    minHeight: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TwitterTimeline twitterHandle={user.twitterHandle} />
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🐦</div>
                    <p className="theme-text-muted" style={{ 
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: '500'
                    }}>
                      暂无推特账号
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        </div>

        {/* 页脚功能链接 */}
        <div className="theme-text-muted" style={{ 
          textAlign: 'center', 
          padding: '1rem',
          fontSize: '0.75rem',
          borderTop: '1px solid rgba(var(--theme-primary-rgb), 0.2)',
          marginTop: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <a
              href="/privacy"
              className="theme-link"
            >
              隐私条款
            </a>
            <a
              href="https://t.me/xCatKing"
              target="_blank"
              rel="noopener noreferrer"
              className="theme-link"
            >
              报错
            </a>
            <button
              onClick={() => setShowExploreModal(true)}
              className="theme-link"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'inherit',
                padding: 0
              }}
            >
              随机逛逛Explore
            </button>
          </div>
        </div>
      </div>

      {/* 底部编辑链接 */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '3rem' }}>
        {getUserAvatarUrl(user) ? (
          <img 
            src={getUserAvatarUrl(user!)} 
            alt={user?.username}
            style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid rgba(255,255,255,0.2)',
              marginBottom: '1rem'
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        ) : (
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white',
            margin: '0 auto 1rem'
          }}>
            {user?.username?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
        {isOwner ? (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false)
                } else {
                  setIsEditing(true)
                }
              }}
              className="theme-button"
              style={{
                background: isEditing ? '#28a745' : undefined
              }}
            >
              {isEditing ? '完成编辑' : '开始编辑'}
            </button>
            
            {/* 主题选择器按钮 - 只在编辑模式下显示 */}
            {isEditing && (
              <button
                onClick={() => setShowThemeSelector(true)}
                className="theme-button-secondary"
              >
                🎨 选择主题
              </button>
            )}
          </div>
        ) : (
          <a
            href="/admin"
            className="theme-button"
            style={{
              textDecoration: 'none'
            }}
          >
            编辑我的链接
          </a>
        )}
      </div>

      {/* 主题选择器模态框 */}
      {showThemeSelector && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--theme-surface)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '1px solid rgba(var(--theme-primary-rgb), 0.2)',
          }}>
            <h2 style={{ 
              color: 'var(--theme-primary)',
              margin: '0 0 1rem 0',
              fontSize: '1.5rem',
              fontWeight: '600',
              textAlign: 'center'
            }}>
               选择主题
            </h2>
            
            {/* 8 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {THEMES.map((theme) => {
                const isCurrentTheme = currentTheme.id === theme.id
                
                return (
                  <div
                    key={theme.id}
                    onClick={() => {
                      setCurrentTheme(theme)
                      setShowThemeSelector(false)
                    }}
                    style={{
                      border: isCurrentTheme ? '3px solid var(--theme-primary)' : '2px solid #ddd',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isCurrentTheme ? 'rgba(var(--theme-primary-rgb), 0.4)' : '#f8f9fa',
                      minHeight: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      boxShadow: isCurrentTheme ? `0 4px 12px rgba(var(--theme-primary-rgb), 0.4)` : '0 2px 4px rgba(0,0,0,0.1)',
                      transform: isCurrentTheme ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentTheme) {
                        e.currentTarget.style.background = 'rgba(var(--theme-primary-rgb), 0.6)'
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
                        background: `linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))`,
                        marginBottom: '0.5rem'
                      }}
                    />
                    <div style={{ fontSize: '0.8rem', color: '#333', fontWeight: '600' }}>
                      {theme.name}
                    </div>
                    {isCurrentTheme && (
                      <div style={{ 
                        fontSize: '0.7rem', 
                        color: 'var(--theme-primary)', 
                        fontWeight: '700',
                        marginTop: '0.25rem'
                      }}>
                        选择
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            
            {/* */}
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

      {/* Explore */}
      {showExploreModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--theme-surface)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '1px solid rgba(var(--theme-primary-rgb), 0.2)',
          }}>
            <h2 style={{ 
              color: 'var(--theme-primary)',
              margin: '0 0 1rem 0',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              🌟 探索社区
            </h2>
            <p style={{ 
              color: currentTheme.id === 4 ? 'rgba(255,255,255,0.9)' : '#666',
              margin: '0 0 2rem 0',
              lineHeight: 1.5
            }}>
              这里将展示整个社区最活跃的用户介绍，敬请期待！
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem'
            }}>
              <button
                onClick={() => setShowExploreModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(var(--theme-primary-rgb), 0.2)',
                  border: '1px solid rgba(var(--theme-primary-rgb), 0.4)',
                  borderRadius: '8px',
                  color: 'var(--theme-primary)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile
