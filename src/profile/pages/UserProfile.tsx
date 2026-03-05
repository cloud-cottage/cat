import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { api, type User, type Link, type LinkGroup, PREDEFINED_ICONS } from '../lib/api'

// 按分组组织链接的辅助函数
const getLinksByGroups = (links: Link[], groups: LinkGroup[]) => {
  if (groups.length === 0) {
    // 没有分组时，显示所有链接
    return [{ group: null, links }]
  }
  
  return groups.map(group => ({
    group,
    links: links.filter(link => link.group === group.id)
  })).filter(group => group.links.length > 0) // 只显示有链接的分组
}

// 获取图标
const getIconEmoji = (iconId?: string): string => {
  if (!iconId) return '🔗'
  const icon = PREDEFINED_ICONS.find(i => i.id === iconId)
  return icon ? icon.emoji : '🔗'
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

  useEffect(() => {
    if (!username) return
    
    const loadUserData = async () => {
      try {
        let userData = await api.getUserByUsername(username)
        
        if (!userData) {
          // 创建新用户，如果钱包已连接则使用钱包地址
          const newUser = await api.createUser(username, address)
          userData = { user: newUser, links: [], groups: [] }
        }
        
        setUser(userData.user)
        setLinks(userData.links)
        setGroups(userData.groups)
      } catch (error) {
        console.error('Error loading user data:', error)
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
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* 头像区域 */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        {user?.avatarUrl ? (
          <img 
            src={user.avatarUrl} 
            alt={user.username}
            style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%',
              border: '4px solid white',
              marginBottom: '1rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}
          />
        ) : (
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '3rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            👤
          </div>
        )}
        
        <h1 style={{ 
          color: 'white', 
          margin: '0 0 0.5rem 0',
          fontSize: '2rem',
          fontWeight: 'bold',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {user?.username}
        </h1>
        
        {user?.bio && (
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            margin: '0 0 1rem 0',
            fontSize: '1.1rem',
            maxWidth: '600px',
            lineHeight: 1.5
          }}>
            {user.bio}
          </p>
        )}
        
        {/* 社交媒体链接 */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
          {user?.twitterHandle && (
            <a
              href={`https://twitter.com/${user.twitterHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                fontSize: '1.2rem',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              🐦
            </a>
          )}
        </div>

        {/* 认证徽章 */}
        {user?.walletAddress && user.walletAddress !== '0x0000' && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            marginBottom: '2rem',
            fontSize: '0.9rem',
            color: 'rgba(255,255,255,0.9)'
          }}>
            <span style={{ fontSize: '1rem' }}>✓</span>
            <span>
              该页面由 {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)} 签名认证
            </span>
          </div>
        )}
      </div>

      {/* 链接列表 */}
      <div style={{ width: '100%', maxWidth: '600px' }}>
        {links.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <p style={{ 
              color: 'white', 
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: '500'
            }}>
              暂无链接
            </p>
          </div>
        ) : (
          getLinksByGroups(links, groups).map(({ group, links: groupLinks }) => (
            <div key={group?.id || 'ungrouped'} style={{ marginBottom: '2rem' }}>
              {group && (
                <h3 style={{ 
                  color: 'white', 
                  margin: '0 0 1rem 0',
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {group.name}
                </h3>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {groupLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 1.5rem',
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '16px',
                      textDecoration: 'none',
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>
                      {getIconEmoji(link.icon)}
                    </span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        {link.label}
                      </div>
                      {link.description && (
                        <div style={{ 
                          fontSize: '0.9rem', 
                          opacity: 0.8,
                          lineHeight: 1.3
                        }}>
                          {link.description}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '1.2rem', opacity: 0.7 }}>
                      →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 底部编辑链接 */}
      <div style={{ marginTop: '3rem' }}>
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
      </div>
    </div>
  )
}
