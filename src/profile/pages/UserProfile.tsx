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
          setLayoutModules([])
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

  if (!user) {
    return <div className="blog-container">用户不存在</div>
  }

  return (
    <div className={`blog-container ${getThemeClassName(currentTheme.id)}`} style={{ 
      minHeight: '100vh',
      background: 'var(--theme-bg)',
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
        {/* 根据布局模块渲染内容 */}
        {layoutModules.map((module) => (
          <div
            key={module.id}
            className="theme-module"
            style={{
              gridColumn: `${module.position.x + 1} / span ${module.size.width}`,
              gridRow: `${module.position.y + 1} / span ${module.size.height}`,
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
                  <p style={{ 
                    color: currentTheme.id === 4 ? 'rgba(255,255,255,0.9)' : '#666', 
                    margin: 0,
                    fontSize: '0.9rem',
                    lineHeight: 1.4
                  }}>
                    {user.bio}
                  </p>
                )}
                
                {user?.walletAddress && user.walletAddress !== '0x0000' && (
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      onClick={() => setShowWalletAddress(!showWalletAddress)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--theme-primary)',
                        border: 'none',
                        borderRadius: '20px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {showWalletAddress ? '隐藏钱包地址' : '显示钱包地址'}
                    </button>
                    {showWalletAddress && (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        background: 'rgba(0,0,0,0.1)',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        wordBreak: 'break-all',
                        fontFamily: 'monospace'
                      }}>
                        {user.walletAddress}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {module.component === 'mostfind' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌍</div>
                <p style={{ 
                  color: currentTheme.id === 4 ? 'rgba(255,255,255,0.9)' : '#666', 
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
                    <p style={{ 
                      color: currentTheme.id === 4 ? 'white' : '#666', 
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
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          background: 'rgba(255,255,255,0.05)',
                          border: `1px solid var(--theme-primary)20`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                          e.currentTarget.style.transform = 'translateY(-1px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          background: `linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontWeight: 'bold'
                        }}>
                          {link.label.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            color: currentTheme.id === 4 ? 'white' : '#333',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {link.label}
                          </div>
                          {link.description && (
                            <div style={{
                              color: currentTheme.id === 4 ? 'rgba(255,255,255,0.7)' : '#666',
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
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      background: 'var(--theme-primary)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '25px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)'
                      e.currentTarget.style.boxShadow = '0 4px 12px var(--theme-primary)40'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    🐦 Twitter
                  </a>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📱</div>
                    <p style={{ 
                      color: currentTheme.id === 4 ? 'white' : '#666', 
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
                    <p style={{ 
                      color: currentTheme.id === 4 ? 'white' : '#666', 
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
              style={{
                padding: '0.75rem 1.5rem',
                background: isEditing ? '#28a745' : 'var(--theme-primary)',
                border: 'none',
                borderRadius: '25px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = isEditing ? '0 4px 12px rgba(40, 167, 69, 0.3)' : '0 4px 12px var(--theme-primary)40'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {isEditing ? '完成编辑' : '开始编辑'}
            </button>
            
            {/* 主题选择器按钮 - 只在编辑模式下显示 */}
            {isEditing && (
              <button
                onClick={() => setShowThemeSelector(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--theme-secondary)',
                  border: 'none',
                  borderRadius: '25px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 4px 12px var(--theme-secondary)40'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                🎨 选择主题
              </button>
            )}
          </div>
        ) : (
          <a
            href="/admin"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: 'var(--theme-primary)',
              border: 'none',
              borderRadius: '25px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 4px 12px var(--theme-primary)40'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            编辑我的链接
          </a>
        )}
      </div>

      {/* 页脚功能链接 */}
      <div style={{ 
        textAlign: 'center', 
        padding: '1rem',
        fontSize: '0.75rem',
        color: currentTheme.id === 4 ? 'rgba(255,255,255,0.6)' : '#999',
        borderTop: '1px solid var(--theme-primary)20',
        marginTop: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <a
            href="/privacy"
            style={{
              color: 'inherit',
              textDecoration: 'none',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--theme-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'inherit'
            }}
          >
            隐私条款
          </a>
          <a
            href="https://t.me/xCatKing"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'inherit',
              textDecoration: 'none',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--theme-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'inherit'
            }}
          >
            报错
          </a>
          <button
            onClick={() => setShowExploreModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: 'inherit',
              padding: 0,
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--theme-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'inherit'
            }}
          >
            随机逛逛Explore
          </button>
        </div>
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
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '1px solid var(--theme-primary)20'
          }}>
            <h2 style={{ 
              color: 'var(--theme-primary)',
              margin: '0 0 2rem 0',
              fontSize: '1.8rem',
              fontWeight: '700',
              textAlign: 'center'
            }}>
              🎨 选择主题
            </h2>
            
            {/* 8个主题选项 */}
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
                      background: isCurrentTheme ? 'var(--theme-bg)40' : '#f8f9fa',
                      minHeight: '120px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      boxShadow: isCurrentTheme ? `0 4px 12px var(--theme-primary)40` : '0 2px 4px rgba(0,0,0,0.1)',
                      transform: isCurrentTheme ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentTheme) {
                        e.currentTarget.style.background = 'var(--theme-bg)60'
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

      {/* 探索模态框 */}
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
            border: '1px solid var(--theme-primary)20'
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
                  background: 'var(--theme-primary)20',
                  border: '1px solid var(--theme-primary)40',
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
