import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { api, type User, type Link } from '../lib/api'
import WalletConnect from '../../components/WalletConnect'

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

  const handleThemeChange = async (newThemeId: number) => {
    if (!user) return
    setThemeId(newThemeId)
    try {
      const updatedUser = await api.updateUser(user.username, { themeId: newThemeId })
      setUser(updatedUser)
    } catch (error) {
      console.error('Error updating theme:', error)
      // 回滚
      setThemeId(user.themeId || 1)
    }
  }

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
            <p className="blog-muted">
              Twitter: @{user.twitterHandle || '未设置'} | 
              钱包: {user.walletAddress === '0x0000' ? '未连接' : `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <WalletConnect />
            <select 
              value={themeId} 
              onChange={e => handleThemeChange(Number(e.target.value))} 
              style={{ padding: '0.25rem 0.5rem', background: 'var(--bg)', color: 'var(--fg)', border: '1px solid #444', borderRadius: '6px' }}
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>主题 {i + 1}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* 钱包连接状态提示 */}
        {user.walletAddress === '0x0000' && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.75rem', 
            background: 'rgba(255, 193, 7, 0.1)', 
            border: '1px solid rgba(255, 193, 7, 0.3)', 
            borderRadius: '6px',
            fontSize: '0.9rem',
            color: '#fbbf24'
          }}>
            💡 提示：连接钱包后可以访问编辑页面
          </div>
        )}
        
        {/* 个人简介 */}
        {user.bio && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ lineHeight: 1.6, color: 'var(--fg)' }}>{user.bio}</p>
          </div>
        )}
        
        {/* 外部链接 */}
        <div className="blog-card" style={{ marginTop: '1rem' }}>
          <h3 style={{ margin: 0, marginBottom: '1rem' }}>外部链接</h3>
          
          {links.length === 0 ? (
            <p className="blog-muted">暂无外部链接</p>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  )
}
