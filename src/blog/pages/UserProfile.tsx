import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { api, type User, type Link, type LinkGroup } from '../lib/api'

// Twitter 组件
function TwitterEmbed({ handle }: { handle: string }) {
  const [tweets, setTweets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!handle) return

    const loadTweets = async () => {
      try {
        // 使用 Twitter API v2 获取最新推文
        const response = await fetch(`https://api.allorigins.win/raw?url=https://syndication.twitter.com/srv/timeline-profile?screenName=${handle}&count=3`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch tweets')
        }

        const data = await response.text()
        
        // 简单的 HTML 解析来提取推文内容
        const parser = new DOMParser()
        const doc = parser.parseFromString(data, 'text/html')
        const tweetElements = doc.querySelectorAll('.timeline-Tweet')
        
        const extractedTweets = Array.from(tweetElements).slice(0, 3).map((tweet, index) => {
          const textElement = tweet.querySelector('.timeline-Tweet-text')
          const timeElement = tweet.querySelector('.timeline-Tweet-timestamp')
          
          return {
            id: index,
            text: textElement ? textElement.textContent || '' : '',
            time: timeElement ? timeElement.textContent || '' : ''
          }
        })
        
        setTweets(extractedTweets)
      } catch (err) {
        console.error('Error loading tweets:', err)
        setError('无法加载推文')
      } finally {
        setLoading(false)
      }
    }

    loadTweets()
  }, [handle])

  if (!handle) return null
  if (loading) return <div style={{ color: 'var(--muted)' }}>加载推文中...</div>
  if (error) return <div style={{ color: 'var(--muted)' }}>{error}</div>
  if (tweets.length === 0) return <div style={{ color: 'var(--muted)' }}>暂无推文</div>

  return (
    <div style={{ marginTop: '1rem' }}>
      <h3 style={{ margin: 0, marginBottom: '1rem' }}>最新推文</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {tweets.map((tweet) => (
          <div 
            key={tweet.id}
            style={{
              padding: '0.75rem',
              background: 'var(--surface)',
              border: '1px solid #444',
              borderRadius: '8px',
              fontSize: '0.9rem',
              lineHeight: 1.4
            }}
          >
            <div style={{ color: 'var(--fg)', marginBottom: '0.5rem' }}>
              {tweet.text}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
              {tweet.time}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
        <a 
          href={`https://twitter.com/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ 
            color: 'var(--link)', 
            fontSize: '0.9rem',
            textDecoration: 'none'
          }}
        >
          查看更多推文 →
        </a>
      </div>
    </div>
  )
}

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

export default function UserProfile({ username: propUsername }: { username?: string }) {
  const { username: paramUsername } = useParams<{ username: string }>()
  const { address } = useAccount()
  
  // 优先使用传入的 username prop（来自子域名），其次使用 URL 参数
  const username = propUsername || paramUsername
  
  const [user, setUser] = useState<User | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [groups, setGroups] = useState<LinkGroup[]>([])
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
          userData = { user: newUser, links: [], groups: [], posts: [] }
        }
        
        setUser(userData.user)
        setLinks(userData.links)
        setGroups(userData.groups)
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
    
    // 移除所有主题类
    document.body.className = document.body.className.replace(/theme-\d+/g, '')
    // 添加当前主题类
    document.body.classList.add(`theme-${themeId}`)
    
    console.log('UserProfile: 应用主题', { themeId, username: user.username })
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
        
        {/* Twitter 推文 */}
        {user.twitterHandle && <TwitterEmbed handle={user.twitterHandle} />}
        
        {/* 外部链接按分组显示 */}
        {links.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            {getLinksByGroups(links, groups).map(({ group, links: groupLinks }) => (
              <div key={group?.id || 'ungrouped'} className="blog-card" style={{ marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, marginBottom: '1rem' }}>
                  {group ? group.name : '其他链接'}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {groupLinks.map((link, index) => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
