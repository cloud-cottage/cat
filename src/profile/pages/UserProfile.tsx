import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { api, type User, type Link, type LinkGroup, PREDEFINED_ICONS, detectIconFromUrl, detectTitleFromUrl, getTwitterAvatarUrl } from '../lib/api'

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
          <a
            className="twitter-timeline"
            href={`https://twitter.com/${twitterHandle}?ref_src=twsrc%5Etfw`}
            style={{
              display: 'block',
              width: '100%',
              height: '400px'
            }}
          >
            Ta 的推特
          </a>
        </div>
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
  const [saving, setSaving] = useState(false)

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
        
        // 检查是否为所有者
        setIsOwner(!!(address && userData.user.walletAddress === address))
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [username, address])

  // 保存函数
  const handleSave = async () => {
    if (!user || !username) return
    
    try {
      setSaving(true)
      
      // 保存链接和分组
      await Promise.all([
        api.updateLinks(username, links),
        api.updateGroups(username, groups)
      ])
      
      setIsEditing(false)
      console.log('保存成功')
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      setSaving(false)
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
        
        // 如果更新的是URL，自动检测图标和标题
        if (field === 'url' && typeof value === 'string') {
          const detectedIcon = detectIconFromUrl(value)
          const detectedTitle = detectTitleFromUrl(value)
          updatedLink.icon = detectedIcon
          updatedLink.label = detectedTitle
        }
        
        return updatedLink
      }
      return link
    }))
  }

  // 删除链接
  const deleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id))
  }

  // 添加新分组
  const addGroup = () => {
    const newGroup: LinkGroup = {
      id: Date.now().toString(),
      userId: username!,
      name: '新分组',
      order: groups.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setGroups([...groups, newGroup])
  }

  // 更新分组
  const updateGroup = (id: string, field: keyof LinkGroup, value: string | number) => {
    setGroups(groups.map(group => 
      group.id === id ? { ...group, [field]: value } : group
    ))
  }

  // 删除分组
  const deleteGroup = (id: string) => {
    setGroups(groups.filter(group => group.id !== id))
  }

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
        {(user?.avatarUrl || user?.twitterHandle) ? (
          <img 
            src={user?.avatarUrl || getTwitterAvatarUrl(user?.twitterHandle || '')} 
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
              // 如果推特头像加载失败，显示默认头像
              const target = e.target as HTMLImageElement
              if (user?.twitterHandle && !user?.avatarUrl) {
                target.style.display = 'none'
              }
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={group.name}
                      onChange={(e) => updateGroup(group.id, 'name', e.target.value)}
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '8px',
                        color: 'white',
                        padding: '0.5rem',
                        fontSize: '1.3rem',
                        fontWeight: '600'
                      }}
                    />
                  ) : (
                    <h3 style={{ 
                      color: 'white', 
                      margin: 0,
                      fontSize: '1.3rem',
                      fontWeight: '600',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      {group.name}
                    </h3>
                  )}
                  {isEditing && (
                    <button
                      onClick={() => deleteGroup(group.id)}
                      style={{
                        padding: '0.5rem',
                        background: 'rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      删除分组
                    </button>
                  )}
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {groupLinks.map((link) => (
                  <div
                    key={link.id}
                    onClick={() => !isEditing && link.url && window.open(link.url, '_blank')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem 1.5rem',
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '16px',
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                      cursor: isEditing ? 'default' : link.url ? 'pointer' : 'default'
                    }}
                    onMouseEnter={(e) => {
                      if (!isEditing && link.url) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isEditing) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>
                      {isEditing ? (
                        <select
                          value={link.icon || 'link'}
                          onChange={(e) => updateLink(link.id, 'icon', e.target.value)}
                          style={{
                            background: 'rgba(255,255,255,0.2)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '8px',
                            color: 'white',
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
                        <span style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px'
                        }}>
                          {getIconElement(link.icon)}
                          {/* 备用 emoji */}
                          <span style={{ display: 'none' }}>
                            {PREDEFINED_ICONS.find(i => i.id === link.icon)?.emoji || '🔗'}
                          </span>
                        </span>
                      )}
                    </span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      {isEditing ? (
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.2)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '8px',
                            color: 'white',
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
                            background: 'rgba(255,255,255,0.2)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '8px',
                            color: 'white',
                            padding: '0.5rem',
                            fontSize: '0.9rem',
                            marginBottom: '0.5rem',
                            resize: 'vertical'
                          }}
                        />
                      ) : (
                        link.description && (
                          <div style={{ 
                            fontSize: '0.9rem', 
                            opacity: 0.8,
                            lineHeight: 1.3,
                            marginBottom: '0.25rem'
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
                            background: 'rgba(255,255,255,0.2)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '8px',
                            color: 'white',
                            padding: '0.5rem',
                            fontSize: '0.8rem',
                            fontFamily: 'monospace'
                          }}
                        />
                      ) : (
                        <div style={{
                          fontSize: '0.8rem',
                          opacity: 0.6,
                          fontFamily: 'monospace',
                          wordBreak: 'break-all'
                        }}>
                          {link.url}
                        </div>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <button
                        onClick={() => deleteLink(link.id)}
                        style={{
                          padding: '0.5rem',
                          background: 'rgba(255,255,255,0.2)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        删除
                      </button>
                    ) : (
                      <span style={{ fontSize: '1.2rem', opacity: 0.7 }}>
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
                      background: 'rgba(76, 175, 80, 0.8)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '16px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500',
                      marginTop: '1rem'
                    }}
                  >
                    + 添加新链接
                  </button>
                )}
                
                {isEditing && (
                  <button
                    onClick={addGroup}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'rgba(33, 150, 243, 0.8)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '16px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500',
                      marginTop: '0.5rem'
                    }}
                  >
                    + 添加新分组
                  </button>
                )}
              </div>
            </div>
          ))
        )}
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
              onClick={() => setIsEditing(!isEditing)}
              style={{
                color: 'rgba(255,255,255,0.9)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.9)'
              }}
            >
              {isEditing ? '取消编辑' : '编辑我的链接'}
            </button>
            
            {isEditing && (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    background: saving ? 'rgba(255,255,255,0.3)' : 'rgba(76, 175, 80, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? '保存中...' : '保存更改'}
                </button>
                
                <button
                  onClick={() => {
                    // 打开设置弹窗或跳转到设置页面
                    alert('设置功能开发中...')
                  }}
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    background: 'rgba(33, 150, 243, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                >
                  ⚙️ 设置
                </button>
              </>
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
    </div>
  )
}
