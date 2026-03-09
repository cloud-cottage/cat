import { useEffect } from 'react'
import { getThemeClassName } from '../themes'
import { useUserProfile } from './hooks/useUserProfile'

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
      id: 'links', 
      name: '注册链接', 
      content: `共 ${links.length} 个链接`,
      type: 'links',
      data: links
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
          {modules.map((module, index) => (
            <div
              key={`simple-${module.id}-${index}`}
              style={{
                gridColumn: module.id === 'profile' ? '1 / 4' : '4 / 7',
                gridRow: module.id === 'profile' ? '1 / 3' : '1 / 3',
                background: 'rgba(255,255,255,0.1)',
                padding: '1rem',
                borderRadius: '8px'
              }}>
              <h3>{module.name}</h3>
              
              {module.type === 'profile' && (
                <div>
                  <p>{module.content}</p>
                  {user?.walletAddress && (
                    <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                      {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                    </p>
                  )}
                </div>
              )}
              
              {module.type === 'links' && (
                <div>
                  <p>{module.content}</p>
                  {module.data && module.data.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      {module.data.slice(0, 3).map((link: any, linkIndex: number) => (
                        <div key={link.id || linkIndex} style={{ 
                          fontSize: '0.875rem', 
                          opacity: 0.8,
                          marginBottom: '0.25rem'
                        }}>
                          • {link.title}
                        </div>
                      ))}
                      {module.data.length > 3 && (
                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                          ...还有 {module.data.length - 3} 个链接
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
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
