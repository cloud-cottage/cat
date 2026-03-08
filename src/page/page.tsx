import { useEffect, useState } from 'react'
import { getUserAvatarUrl } from './lib/api'
import { getThemeClassName } from '../themes'
import { TwitterTimeline } from './components/TwitterTimeline'
import { ThemeSelector } from './components/ThemeSelector'
import { ExploreModal } from './components/ExploreModal'
import { useUserProfile } from './hooks/useUserProfile'

interface Web3ProfileProps {
  username?: string
}

export const Web3ProfileSimple: React.FC<Web3ProfileProps> = ({ username: propUsername }) => {
  const { 
    loading, 
    user, 
    links, 
    currentTheme, 
    layoutModules, 
    isOwner, 
    setCurrentTheme 
  } = useUserProfile({ username: propUsername })
  
  const [isEditing, setIsEditing] = useState(false)
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [showExploreModal, setShowExploreModal] = useState(false)

  if (loading) {
    return <div className="blog-container">加载中...</div>
  }

  // 应用主题到body元素
  useEffect(() => {
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(getThemeClassName(currentTheme.id));
    
    return () => {
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
    };
  }, [currentTheme.id]);

  if (!user) {
    return <div className="blog-container">用户不存在</div>
  }

  const renderModule = (module: any, index: number) => {
    // 兼容两种命名方式：组件名和数字序号
    const moduleClass = typeof module.id === 'string' && !isNaN(parseInt(module.id)) 
      ? `module-${module.id}`  // 数字序号 (matrix主题)
      : `module-${module.component}`; // 组件名 (其他主题)

    return (
      <div
        key={`${module.id}-${index}`}  // 使用组合键确保唯一性
        className={`theme-module ${moduleClass}`}
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
            
            {/* 认证徽章 */}
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
              </div>
            )}
          </div>
        )}
        
        {module.component === 'social' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🌐</div>
            <p className="theme-text-secondary" style={{ 
              margin: 0,
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              社交媒体链接
            </p>
          </div>
        )}
        
        {module.component === 'mostfind' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
            <p className="theme-text-secondary" style={{ 
              margin: 0,
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              我活跃在
            </p>
          </div>
        )}
        
        {module.component === 'links' && (
          <div style={{ flex: 1, overflow: 'auto' }}>
            {links.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="theme-link"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: 'var(--theme-primary)',
                      background: 'rgba(var(--theme-primary-rgb), 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--theme-primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {link.label.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.9rem' }}>{link.label}</span>
                  </a>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔗</div>
                <p className="theme-text-muted" style={{ 
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  暂无链接
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
    )
  }

  return (
    <div className={`blog-container ${getThemeClassName(currentTheme.id)}`} style={{ 
      width: '1800px',
      maxWidth: '100%',
      margin: '0 auto',
      minHeight: '100vh',
      padding: '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* 调试信息 */}
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '10px', 
        borderRadius: '5px',
        zIndex: 9999,
        fontSize: '12px'
      }}>
        <div>Theme ID: {currentTheme.id}</div>
        <div>Theme Name: {currentTheme.name}</div>
        <div>Theme Class: {getThemeClassName(currentTheme.id)}</div>
        <div>Modules Count: {layoutModules.length}</div>
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="grid-container">
          {layoutModules.map((module, index) => renderModule(module, index))}
        </div>

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
              style={{ color: 'var(--theme-primary)', textDecoration: 'none' }}
            >
              隐私政策
            </a>
            <a
              href="/terms"
              className="theme-link"
              style={{ color: 'var(--theme-primary)', textDecoration: 'none' }}
            >
              服务条款
            </a>
            <a
              href="/about"
              className="theme-link"
              style={{ color: 'var(--theme-primary)', textDecoration: 'none' }}
            >
              关于我们
            </a>
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
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--theme-primary)',
                border: 'none',
                borderRadius: '25px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              {isEditing ? '保存' : '编辑'}
            </button>
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
                fontWeight: '600'
              }}
            >
              主题
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowExploreModal(true)}
            style={{
              padding: '0.8rem 2rem',
              background: 'rgba(var(--theme-primary-rgb), 0.2)',
              border: '1px solid rgba(var(--theme-primary-rgb), 0.4)',
              borderRadius: '25px',
              color: 'var(--theme-primary)',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            随机逛逛Explore
          </button>
        )}
      </div>

      {/* Theme Selector Modal */}
      {showThemeSelector && (
        <ThemeSelector
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
          onClose={() => setShowThemeSelector(false)}
        />
      )}

      {/* Explore Modal */}
      <ExploreModal
        show={showExploreModal}
        onClose={() => setShowExploreModal(false)}
        currentTheme={currentTheme}
      />
    </div>
  )
}

export default Web3ProfileSimple
