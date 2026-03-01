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
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingLinks, setIsEditingLinks] = useState(false)
  const [twitterHandle, setTwitterHandle] = useState<string>('')
  const [bio, setBio] = useState<string>('')
  const [newLink, setNewLink] = useState({ label: '', url: '', description: '' })
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [urlError, setUrlError] = useState(false)
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
        setTwitterHandle(userData.user.twitterHandle || '')
        setBio(userData.user.bio || '')
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
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    try {
      const updatedUser = await api.updateUser(user.username, { 
        twitterHandle, 
        bio 
      })
      setUser(updatedUser)
      setIsEditingProfile(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    }
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
    
    const newDbLink: Link = {
      id: 'id_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36),
      userId: user.id,
      label: newLink.label,
      url: processed,
      description: newLink.description,
      order: links.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const updatedLinks = [...links, newDbLink]
    setLinks(updatedLinks)
    setNewLink({ label: '', url: '', description: '' })
    
    try {
      await api.updateLinks(user.username, updatedLinks)
    } catch (error) {
      console.error('Error adding link:', error)
      // 回滚
      setLinks(links)
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    if (!user) return
    const updatedLinks = links.filter(l => l.id !== linkId)
    setLinks(updatedLinks)
    
    try {
      await api.updateLinks(user.username, updatedLinks)
    } catch (error) {
      console.error('Error deleting link:', error)
      // 回滚
      setLinks(links)
    }
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
    
    const reorderedLinks = newLinks.map((l, i) => ({ ...l, order: i, updatedAt: new Date().toISOString() }))
    setLinks(reorderedLinks)
    setDraggedIndex(null)
    
    try {
      await api.updateLinks(user.username, reorderedLinks)
    } catch (error) {
      console.error('Error reordering links:', error)
      // 回滚
      setLinks(links)
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
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
            color: '#ffc107'
          }}>
            ⚠️ 建议连接钱包以获得更好的体验和安全性
          </div>
        )}
        
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
