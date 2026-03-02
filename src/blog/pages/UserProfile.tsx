import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { api, type User, type Link } from '../lib/api'

export default function UserProfile({ username: propUsername }: { username?: string }) {
  const { username: paramUsername } = useParams<{ username: string }>()
  const { address } = useAccount()
  
  // 优先使用传入的 username prop（来自子域名），其次使用 URL 参数
  const username = propUsername || paramUsername
  
  const [user, setUser] = useState<User | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [themeId, setThemeId] = useState<number>(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!username) return
    
    const loadUserData = async () => {
      try {
        let userData = await api.getUserByUsername(username)
        
        if (!userData) {
          // 创建新用户，如果钱包已连接则使用钱包地址
          const newUser = await api.createUser(username, address)
          userData = { user: newUser, links: [] }
        }
        
        setUser(userData.user)
        setLinks(userData.links)
        setThemeId(userData.user.themeId || 1)
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [username, address])

  useEffect(() => {
    if (!user) return
    document.body.className = `theme-${themeId}`
  }, [themeId, user])

  if (loading) {
    return <div className="blog-container">加载中...</div>
  }

  if (!user) {
    return <div className="blog-container">用户不存在</div>
  }

  return (
    <div className="blog-container"> 
      <div className="blog-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>{user.username}</h2>
          </div>
        </div>
        
        {/* 检查博客是否为空 */}
        {!user.bio && links.length === 0 && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '2rem', 
            background: 'var(--surface)', 
            border: '1px solid #444', 
            borderRadius: '12px',
            textAlign: 'center',
            fontSize: '1.1rem',
            color: 'var(--muted)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📝</div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>此博客尚未设置任何信息</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>博主正在努力完善中...</p>
          </div>
        )}

        {/* 个人简介 */}
        {user.bio && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ lineHeight: 1.6, color: 'var(--fg)' }}>{user.bio}</p>
          </div>
        )}
        
        {/* 外部链接 */}
        {links.length > 0 && (
          <div className="blog-card" style={{ marginTop: '1rem' }}>
            <h3 style={{ margin: 0, marginBottom: '1rem' }}>外部链接</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {links.map((link, index) => (
                <div 
                  key={link.id}
                  style={{
                    padding: '0.75rem',
                    background: 'var(--surface)',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <span style={{ 
                    minWidth: '24px', 
                    fontWeight: 'bold', 
                    color: 'var(--muted)',
                    fontSize: '0.9rem'
                  }}>
                    {index + 1}.
                  </span>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ 
                        color: 'var(--link)', 
                        fontWeight: 500, 
                        textDecoration: 'none',
                        fontSize: '1rem'
                      }}
                    >
                      {link.label}
                    </a>
                    {link.description && (
                      <div style={{ 
                        color: 'var(--muted)', 
                        fontSize: '0.85rem',
                        lineHeight: 1.4
                      }}>
                        {link.description}
                      </div>
                    )}
                    <span style={{ 
                      color: 'var(--muted)', 
                      fontSize: '0.75rem', 
                      opacity: 0.7 
                    }}>
                      {link.url}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
