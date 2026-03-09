import { useEffect } from 'react'
import { getThemeClassName } from '../themes'
import { useUserProfile } from './hooks/useUserProfile'
import { getUserAvatarUrl } from './lib/api'

interface Web3ProfileProps {
  username?: string
}

export const Web3ProfileSimple: React.FC<Web3ProfileProps> = ({ username: propUsername }) => {
  const { loading, user, links, currentTheme } = useUserProfile({ username: propUsername })
  
  // 应用主题到body元素
  useEffect(() => {
    const themeClass = getThemeClassName(currentTheme.id);
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(themeClass);
    
    return () => {
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
    };
  }, [currentTheme.id]);
  
  if (loading) {
    return <div className="blog-container">加载中...</div>
  }

  if (!user) {
    return <div className="blog-container">用户不存在</div>
  }

  const themeClass = getThemeClassName(currentTheme.id);
  
  // 简单的模块数组
  const modules = [
    { 
      id: 'profile', 
      name: '用户资料', 
      content: `${user?.nickname || user?.username}`,
      type: 'profile'
    },
    { 
      id: 'social', 
      name: '社交媒体', 
      content: '社交链接',
      type: 'social'
    },
    { 
      id: 'links', 
      name: '注册链接', 
      content: `共 ${links.length} 个链接`,
      type: 'links',
      data: links
    },
    { 
      id: 'mostfind', 
      name: '我活跃在', 
      content: '活跃平台',
      type: 'mostfind'
    }
  ];
  
  return (
    <div className={`blog-container ${themeClass}`} style={{ 
      width: '1800px',
      maxWidth: '100%',
      margin: '0 auto',
      minHeight: '100vh',
      padding: '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="grid-container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridTemplateRows: 'repeat(9, 280px)',
          gap: '1rem',
          minHeight: '900px'
        }}>
          {modules.map((module, index) => {
            // 根据模块类型设置网格位置
            const getPosition = (type: string) => {
              switch (type) {
                case 'profile':
                  return { gridColumn: '1 / 4', gridRow: '1 / 3' };
                case 'social':
                  return { gridColumn: '4 / 7', gridRow: '1 / 3' };
                case 'links':
                  return { gridColumn: '1 / 4', gridRow: '3 / 5' };
                case 'mostfind':
                  return { gridColumn: '4 / 7', gridRow: '3 / 5' };
                default:
                  return { gridColumn: '1 / 3', gridRow: '5 / 7' };
              }
            };

            const position = getPosition(module.type);

            return (
              <div
                key={`simple-${module.id}-${index}`}
                style={{
                  ...position,
                  background: 'rgba(255,255,255,0.1)',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                <h3>{module.name}</h3>
                
                {module.type === 'profile' && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      {getUserAvatarUrl(user) ? (
                        <img 
                          src={getUserAvatarUrl(user!)} 
                          alt={user?.username}
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '3px solid var(--theme-primary)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
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
                          background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%)',
                          margin: '0 auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem',
                          color: 'white',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}>
                          {user?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h2 style={{ 
                        margin: '0 0 0.5rem 0', 
                        fontSize: '1.5rem', 
                        color: 'var(--theme-primary)',
                        fontWeight: '600'
                      }}>
                        {user?.nickname || user?.username}
                      </h2>
                      {user?.nickname && user?.username && (
                        <p style={{ 
                          margin: '0 0 0.5rem 0', 
                          fontSize: '0.875rem', 
                          opacity: 0.7 
                        }}>
                          @{user.username}
                        </p>
                      )}
                      {user?.walletAddress && (
                        <p style={{ 
                          margin: '0', 
                          fontSize: '0.75rem', 
                          opacity: 0.6,
                          fontFamily: 'monospace',
                          background: 'rgba(var(--theme-primary-rgb), 0.1)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}>
                          {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {module.type === 'social' && (
                  <div>
                    <p>{module.content}</p>
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {user?.twitterHandle ? (
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          background: 'rgba(29, 161, 242, 0.2)', 
                          borderRadius: '4px',
                          fontSize: '0.75rem'
                        }}>
                          Twitter: @{user.twitterHandle}
                        </span>
                      ) : (
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          background: 'rgba(108, 117, 125, 0.2)', 
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontStyle: 'italic'
                        }}>
                          Twitter: 未设置
                        </span>
                      )}
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        background: 'rgba(51, 51, 51, 0.2)', 
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                      }}>
                        GitHub: {user?.username || '未设置'}
                      </span>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        background: 'rgba(142, 36, 170, 0.2)', 
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                      }}>
                        Farcaster: {user?.username || '未设置'}
                      </span>
                    </div>
                  </div>
                )}
                
                {module.type === 'links' && (
                  <div>
                    <p>{module.content}</p>
                    {module.data && module.data.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        {module.data.slice(0, 3).map((link: any, linkIndex: number) => (
                          <a
                            key={link.id || linkIndex}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              fontSize: '0.875rem', 
                              opacity: 0.8,
                              marginBottom: '0.25rem',
                              display: 'block',
                              color: 'var(--theme-primary)',
                              textDecoration: 'none',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              transition: 'all 0.2s ease',
                              border: '1px solid rgba(var(--theme-primary-rgb), 0.2)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '1';
                              e.currentTarget.style.background = 'rgba(var(--theme-primary-rgb), 0.1)';
                              e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '0.8';
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }}
                          >
                            🔗 {link.label || link.title || '无标题'}
                          </a>
                        ))}
                        {module.data.length > 3 && (
                          <div style={{ 
                            fontSize: '0.75rem', 
                            opacity: 0.6,
                            marginTop: '0.5rem',
                            fontStyle: 'italic'
                          }}>
                            ...还有 {module.data.length - 3} 个链接
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {module.type === 'mostfind' && (
                  <div>
                    <p>{module.content}</p>
                    <div style={{ 
                      marginTop: '0.5rem', 
                      fontSize: '0.875rem', 
                      opacity: 0.8 
                    }}>
                      <div>• Web3社区</div>
                      <div>• 开发者平台</div>
                      <div>• 创作者生态</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
              使用条款
            </a>
            <a
              href="https://github.com/cloud-cottage/cat"
              target="_blank"
              rel="noopener noreferrer"
              className="theme-link"
              style={{ color: 'var(--theme-primary)', textDecoration: 'none' }}
            >
              GitHub
            </a>
          </div>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.7rem', opacity: 0.6 }}>
            Powered by CAT - Your Web3 Paws
          </p>
        </div>
      </div>
    </div>
  )
}
