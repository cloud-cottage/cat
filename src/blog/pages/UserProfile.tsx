import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { db, generateUser, type User, type Link } from '../lib/db'

function getInitialUserData(username: string) {
  let existingUser = db.getUserByUsername(username)
  if (!existingUser) {
    existingUser = generateUser(username)
    db.createUser(existingUser)
  }
  return {
    user: existingUser,
    themeId: existingUser.themeId || 1,
    twitterHandle: existingUser.twitterHandle || '',
    bio: existingUser.bio || '',
    links: db.getLinks(existingUser.id)
  }
}

export default function UserProfile() {
  const { username } = useParams<{ username: string }>()
  
  const initialData = useMemo(() => {
    if (!username) return null
    return getInitialUserData(username)
  }, [username])
  
  const [themeId, setThemeId] = useState<number>(() => initialData?.themeId ?? 1)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingLinks, setIsEditingLinks] = useState(false)
  const [twitterHandle, setTwitterHandle] = useState<string>(() => initialData?.twitterHandle ?? '')
  const [bio, setBio] = useState<string>(() => initialData?.bio ?? '')
  const [links, setLinks] = useState<Link[]>(() => initialData?.links ?? [])
  const [newLink, setNewLink] = useState({ label: '', url: '', description: '' })
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [urlError, setUrlError] = useState(false)
  const [user, setUser] = useState<User | null>(() => initialData?.user ?? null)

  useEffect(() => {
    if (!user) return
    document.body.className = `theme-${themeId}`
  }, [themeId, user])

  const handleThemeChange = async (newThemeId: number) => {
    if (!user) return
    setThemeId(newThemeId)
    const updatedUser = { ...user, themeId: newThemeId, updatedAt: new Date().toISOString() }
    db.updateUser(updatedUser)
    setUser(updatedUser)
  }

  const handleSaveProfile = async () => {
    if (!user) return
    const updatedUser = { 
      ...user, 
      twitterHandle, 
      bio, 
      updatedAt: new Date().toISOString() 
    }
    db.updateUser(updatedUser)
    setUser(updatedUser)
    setIsEditingProfile(false)
  }

  const validateUrl = (url: string): { valid: boolean; processed: string; error: string } => {
    let processedUrl = url.trim()
    let isValid = true
    let errorMessage = ''
    
    if (!processedUrl || processedUrl.length < 3) {
      isValid = false
      errorMessage = 'URL 太短'
    }
    
    if (isValid && !/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl
    }
    
    if (isValid) {
      try {
        const urlObj = new URL(processedUrl)
        const hostname = urlObj.hostname.toLowerCase()
        
        if (!hostname) {
          isValid = false
          errorMessage = '缺少域名'
        }
        
        if (isValid) {
          const isValidHostname = /^(localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?|[a-z0-9-]+)$/i.test(hostname)
          
          if (!isValidHostname) {
            isValid = false
            errorMessage = '域名格式无效'
          }
        }
        
        if (isValid) {
          urlObj.hostname = hostname
          processedUrl = urlObj.toString()
        }
        
      } catch {
        isValid = false
        errorMessage = 'URL 格式无效'
      }
    }
    
    return { valid: isValid, processed: processedUrl, error: errorMessage }
  }

  const handleAddLink = async () => {
    if (!user) return
    
    const labelTrimmed = newLink.label.trim()
    if (!labelTrimmed || labelTrimmed.length < 2) {
      setUrlError(true)
      setTimeout(() => setUrlError(false), 500)
      alert('链接标题至少需要 2 个汉字或字符')
      return
    }
    
    if (!newLink.url) {
      alert('请填写链接地址')
      return
    }
    
    if (links.length >= 9) {
      alert('最多只能添加 9 条链接')
      return
    }
    
    const { valid, processed, error } = validateUrl(newLink.url)
    if (!valid) {
      setUrlError(true)
      setTimeout(() => setUrlError(false), 500)
      alert(error)
      return
    }
    
    const newDbLink = db.addLink(user.id, {
      label: newLink.label,
      url: processed,
      description: newLink.description
    })
    
    setLinks([...links, newDbLink])
    setNewLink({ label: '', url: '', description: '' })
  }

  const handleDeleteLink = (linkId: string) => {
    if (!user) return
    db.deleteLink(user.id, linkId)
    setLinks(links.filter(l => l.id !== linkId))
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    setDragOverIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    if (!user) return

    const newLinks = [...links]
    const [movedItem] = newLinks.splice(draggedIndex, 1)
    newLinks.splice(dropIndex, 0, movedItem)
    
    setLinks(newLinks)
    setDraggedIndex(null)
    
    db.reorderLinks(user.id, newLinks)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  if (!user) {
    return <div className="blog-container">加载中...</div>
  }

  return (
    <div className="blog-container"> 
      <div className="blog-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>{user.username}</h2>
            <p className="blog-muted">Twitter: @{user.twitterHandle || '未设置'}</p>
          </div>
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
        <div style={{ marginTop: '1rem' }}>
          {isEditingProfile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={twitterHandle} 
                onChange={e => setTwitterHandle(e.target.value)} 
                placeholder="Twitter handle" 
                className="blog-input"
              />
              <textarea 
                value={bio} 
                onChange={e => setBio(e.target.value)} 
                placeholder="个人简介" 
                rows={2}
                className="blog-input"
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleSaveProfile} className="blog-btn">保存</button>
                <button onClick={() => setIsEditingProfile(false)} className="blog-btn blog-btn-secondary">取消</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsEditingProfile(true)} className="blog-btn">编辑资料</button>
          )}
        </div>
      </div>

      <div className="blog-card" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>外部链接</h3>
          <button onClick={() => setIsEditingLinks(!isEditingLinks)} className="blog-btn">
            {isEditingLinks ? '完成' : '编辑外部链接'}
          </button>
        </div>
        
        {isEditingLinks ? (
          <div>
            <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  value={newLink.label}
                  onChange={e => setNewLink({...newLink, label: e.target.value})}
                  placeholder="链接名称"
                  className="blog-input"
                  style={{ flex: 1, minWidth: '120px' }}
                />
                <input 
                  type="text" 
                  value={newLink.url}
                  onChange={e => {
                    setNewLink({...newLink, url: e.target.value})
                    if (urlError) setUrlError(false)
                  }}
                  placeholder="https://..."
                  className={urlError ? 'input-shake' : ''}
                  style={{ 
                    flex: 2,
                    minWidth: '200px',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #444',
                    background: 'var(--bg)',
                    color: 'var(--fg)'
                  }}
                />
                <input 
                  type="text" 
                  value={newLink.description}
                  onChange={e => setNewLink({...newLink, description: e.target.value})}
                  placeholder="说明文字"
                  className="blog-input"
                  style={{ flex: 1.5, minWidth: '120px' }}
                />
                <button onClick={handleAddLink} disabled={links.length >= 9} className="blog-btn">添加</button>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                已添加 {links.length}/9 条链接
              </div>
            </div>
            
            {links.length > 0 && (
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                💡 拖拽链接可调整顺序
              </div>
            )}
            
            {links.map((link, index) => (
              <div 
                key={link.id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.5rem', 
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  background: dragOverIndex === index 
                    ? 'rgba(37, 99, 235, 0.1)' 
                    : 'rgba(255,255,255,0.03)',
                  borderRadius: '6px',
                  border: dragOverIndex === index ? '2px dashed var(--link)' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ minWidth: '24px', fontWeight: 'bold', marginTop: '0.25rem' }}>{index + 1}.</span>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link)', fontWeight: 500, textDecoration: 'none' }}>
                    {link.label}
                  </a>
                  {link.description && (
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      style={{ 
                        color: 'var(--muted)', 
                        fontSize: '0.85rem',
                        cursor: 'move',
                        padding: '0.25rem 0.5rem',
                        background: draggedIndex === index ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                        borderRadius: '4px',
                        borderLeft: '3px solid var(--link)',
                        opacity: draggedIndex === index ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <span>⋮⋮</span>
                      <span>{link.description}</span>
                    </div>
                  )}
                  <span style={{ color: 'var(--muted)', fontSize: '0.75rem', opacity: 0.7 }}>{link.url}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button onClick={() => handleDeleteLink(link.id)} style={{ padding: '0.25rem 0.5rem', color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}>删除</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {links.length === 0 ? (
              <p className="blog-muted">暂无外部链接，点击"编辑外部链接"添加</p>
            ) : (
              links.map((link, index) => (
                <div key={link.id} style={{ marginBottom: '1rem', padding: '0.5rem 0' }}>
                  <div>
                    <span style={{ color: 'var(--muted)', marginRight: '0.5rem' }}>{index + 1}.</span>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link)', fontWeight: 500, textDecoration: 'none' }}>
                      {link.label}
                    </a>
                  </div>
                  {link.description && <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.5rem', marginLeft: '1.5rem' }}>{link.description}</div>}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="blog-card" style={{ marginTop: '1rem' }}>
        <h3>推文</h3>
      </div>
    </div>
  )
}
