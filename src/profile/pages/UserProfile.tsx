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
    setLinks(links.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ))
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
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
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
                        getIconEmoji(link.icon)
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
