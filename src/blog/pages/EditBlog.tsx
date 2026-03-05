import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { api, type User, type Link, type LinkGroup, PREDEFINED_ICONS } from '../lib/api'
import WalletConnect from '../../components/WalletConnect'

// 主题配置
const themes = [
  { id: 1, name: '钻石手', description: '清爽简约，专注内容' },
  { id: 2, name: 'HODL蓝', description: '长期持有，信仰坚定' },
  { id: 3, name: '草莓熊', description: '温柔浪漫，少女心' },
  { id: 4, name: '赛博橙', description: '未来科技，霓虹风格' },
  { id: 5, name: '韭菜绿', description: '自然清新，护眼舒适' },
  { id: 6, name: '拿铁棕', description: '温暖治愈，ins 风格' },
  { id: 7, name: '神秘紫', description: '神秘优雅，高级感' },
  { id: 8, name: '深海蓝', description: '清新宁静，夏日气息' },
  { id: 9, name: '黄金橙', description: '活力满满，怀旧情怀' }
]

export default function EditBlog() {
  console.log('EditBlog component mounted')
  // 从 URL 路径获取用户名
  const getUsernameFromPath = () => {
    const pathname = window.location.pathname
    const hostname = window.location.hostname
    
    // 如果是子域名形式 (username.catcat.meme/edit)
    if (hostname.endsWith('.catcat.meme') && hostname !== 'catcat.meme') {
      return hostname.replace('.catcat.meme', '')
    }
    
    // 如果是路径形式 (/username/edit)
    if (pathname.endsWith('/edit')) {
      const parts = pathname.split('/').filter(Boolean)
      return parts[parts.length - 2] // 获取 /username/edit 中的 username
    }
    
    return null
  }
  
  const user = getUsernameFromPath()
  const { address, isConnected } = useAccount()
  const navigate = useNavigate()
  
  console.log('EditBlog initial state:', { user, address, isConnected })
  
  const [links, setLinks] = useState<Link[]>([])
  const [groups, setGroups] = useState<LinkGroup[]>([])
  const [userData, setUserData] = useState<User | null>(null)
  const [themeId, setThemeId] = useState<number>(1)
  const [twitterHandle, setTwitterHandle] = useState<string>('')
  const [bio, setBio] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'links' | 'settings'>('links')

  useEffect(() => {
    console.log('EditBlog useEffect:', { user, isConnected, address })
    
    if (!user) {
      console.log('No user parameter, navigating to home')
      navigate('/')
      return
    }

    const loadUserData = async () => {
      try {
        setIsLoading(true)
        console.log('开始加载用户数据，用户名:', user)
        const userData = await api.getUserByUsername(user!)
        console.log('获取到的用户数据:', userData)
        
        if (userData) {
          setLinks(userData.links || [])
          setGroups(userData.groups || [])
          setUserData(userData.user)
          setThemeId(userData.user.themeId || 1)
          setTwitterHandle(userData.user.twitterHandle || '')
          setBio(userData.user.bio || '')
          console.log('用户数据加载成功:', { 
            themeId: userData.user.themeId, 
            linksCount: userData.links?.length || 0,
            groupsCount: userData.groups?.length || 0,
            twitterHandle: userData.user.twitterHandle,
            bio: userData.user.bio
          })
        } else {
          console.log('用户不存在，将创建新用户')
        }
      } catch (err) {
        console.error('Failed to load user data:', err)
        setError('加载数据失败')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [user, address])

  // 超时处理
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('Loading timeout, forcing stop')
        setIsLoading(false)
      }
    }, 5000) // 5秒超时

    return () => clearTimeout(timer)
  }, [isLoading])

  const saveLinks = async () => {
    try {
      setIsLoading(true)
      setError('')
      console.log('保存链接数据:', links)
      
      await api.updateLinks(user!, links)
      console.log('链接保存成功')
      setError('链接保存成功')
    } catch (err) {
      console.error('保存链接失败:', err)
      setError('保存链接失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const addLink = () => {
    const newLink: Link = {
      id: Date.now().toString(),
      label: '新链接',
      url: '',
      description: '',
      group: '',
      icon: 'link',
      order: links.length + 1,
      userId: user!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setLinks([...links, newLink])
  }

  const updateLink = (id: string, field: keyof Link, value: string | number) => {
    setLinks(links.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ))
  }

  const deleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id))
  }

  const moveLink = (id: string, direction: 'up' | 'down') => {
    const index = links.findIndex(link => link.id === id)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= links.length) return

    const newLinks = [...links]
    const [movedLink] = newLinks.splice(index, 1)
    newLinks.splice(newIndex, 0, movedLink)
    
    // 更新 order 字段
    return newLinks.map((link, i) => ({ ...link, order: i }))
  }

  // 分组管理函数
  const addGroup = () => {
    if (groups.length >= 8) {
      setError('最多只能创建8个分组')
      return
    }
    const newGroup: LinkGroup = {
      id: Date.now().toString(),
      userId: user!,
      name: '新分组',
      order: groups.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setGroups([...groups, newGroup])
  }

  const updateGroup = (id: string, field: keyof LinkGroup, value: string | number) => {
    setGroups(groups.map(group => 
      group.id === id ? { ...group, [field]: value } : group
    ))
  }

  const deleteGroup = (id: string) => {
    setGroups(groups.filter(group => group.id !== id))
  }

  const moveGroup = (id: string, direction: 'up' | 'down') => {
    const index = groups.findIndex(group => group.id === id)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= groups.length) return

    const newGroups = [...groups]
    const [movedGroup] = newGroups.splice(index, 1)
    newGroups.splice(newIndex, 0, movedGroup)
    
    // 更新 order 字段
    return newGroups.map((group, i) => ({ ...group, order: i + 1 }))
  }

  const saveGroups = async () => {
    try {
      setIsLoading(true)
      setError('')
      console.log('保存分组数据:', groups)
      
      await api.updateGroups(user!, groups)
      console.log('分组保存成功')
      setError('分组保存成功')
    } catch (err) {
      console.error('保存分组失败:', err)
      setError('保存分组失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const updatedUser = {
        ...userData!,
        twitterHandle,
        bio,
        themeId,
        updatedAt: new Date().toISOString()
      }
      
      await api.updateUser(user!, updatedUser)
      setUserData(updatedUser)
      console.log('设置保存成功')
      setError('设置保存成功')
    } catch (err) {
      console.error('保存设置失败:', err)
      setError('保存设置失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="blog-container">
        <div className="blog-card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            加载中...
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected || !address) {
    return (
      <div className="blog-container">
        <div className="blog-card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>需要连接钱包</h2>
            <p style={{ marginBottom: '2rem', color: 'var(--muted)' }}>
              请连接你的钱包以访问编辑功能
            </p>
            <div style={{ marginBottom: '2rem' }}>
              <WalletConnect />
            </div>
            <button 
              onClick={() => window.location.href = `https://${user}.catcat.meme/`}
              className="btn-secondary"
            >
              返回博客
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-container">
      <div className="blog-card">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>编辑博客</h1>
          <p style={{ margin: 0, color: 'var(--muted)' }}>用户: {user}</p>
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            background: 'var(--error-bg)',
            border: '1px solid var(--error)',
            borderRadius: '6px',
            color: 'var(--error)',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        {/* 标签页切换 */}
        <div style={{ display: 'flex', marginBottom: '2rem', borderBottom: '1px solid #444' }}>
          <button 
            onClick={() => setActiveTab('links')}
            style={{
              padding: '0.5rem 1rem',
              background: activeTab === 'links' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'links' ? 'var(--bg)' : 'var(--fg)',
              border: '1px solid var(--accent)',
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer'
            }}
          >
            链接管理
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '0.5rem 1rem',
              background: activeTab === 'settings' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'settings' ? 'var(--bg)' : 'var(--fg)',
              border: '1px solid var(--accent)',
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer'
            }}
          >
            设置
          </button>
        </div>

        {/* 内容区域 */}
        {activeTab === 'links' && (
          <div>
            {/* 分组管理 */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>分组管理 (最多8个)</h3>
                <button onClick={addGroup} className="btn-secondary" disabled={groups.length >= 8}>
                  + 添加分组
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {groups.map((group, index) => (
                  <div 
                    key={group.id}
                    style={{
                      padding: '0.75rem',
                      background: 'var(--surface)',
                      border: '1px solid #666',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <input
                      type="text"
                      value={group.name}
                      onChange={(e) => updateGroup(group.id, 'name', e.target.value)}
                      placeholder="分组名称"
                      style={{
                        flex: 1,
                        padding: '0.4rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--fg)',
                        fontSize: '0.9rem'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button 
                        onClick={() => moveGroup(group.id, 'up')}
                        disabled={index === 0}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: 'var(--muted)',
                          border: 'none',
                          borderRadius: '4px',
                          color: 'var(--fg)',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          opacity: index === 0 ? 0.5 : 1
                        }}
                      >
                        ↑
                      </button>
                      <button 
                        onClick={() => moveGroup(group.id, 'down')}
                        disabled={index === groups.length - 1}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: 'var(--muted)',
                          border: 'none',
                          borderRadius: '4px',
                          color: 'var(--fg)',
                          cursor: index === groups.length - 1 ? 'not-allowed' : 'pointer',
                          opacity: index === groups.length - 1 ? 0.5 : 1
                        }}
                      >
                        ↓
                      </button>
                      <button 
                        onClick={() => deleteGroup(group.id)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#ff4444',
                          border: 'none',
                          borderRadius: '4px',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={saveGroups}
                disabled={isLoading}
                className="btn-primary"
                style={{ marginTop: '1rem' }}
              >
                {isLoading ? '保存中...' : '保存分组'}
              </button>
            </div>

            {/* 链接管理 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>链接管理</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={addLink} className="btn-secondary">
                  + 添加链接
                </button>
                <button 
                  onClick={saveLinks}
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? '保存中...' : '保存链接'}
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {links.map((link, index) => (
                <div 
                  key={link.id}
                  style={{
                    padding: '1rem',
                    background: 'var(--bg)',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                      placeholder="链接标题"
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        background: 'var(--surface)',
                        border: '1px solid #666',
                        borderRadius: '4px',
                        color: 'var(--fg)',
                        fontSize: '0.9rem'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        onClick={() => moveLink(link.id, 'up')}
                        disabled={index === 0}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#666',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          opacity: index === 0 ? 0.5 : 1
                        }}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveLink(link.id, 'down')}
                        disabled={index === links.length - 1}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#666',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: index === links.length - 1 ? 'not-allowed' : 'pointer',
                          opacity: index === links.length - 1 ? 0.5 : 1
                        }}
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => deleteLink(link.id)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                    placeholder="https://example.com"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: 'var(--surface)',
                      border: '1px solid #666',
                      borderRadius: '4px',
                      color: 'var(--fg)',
                      fontSize: '0.9rem'
                    }}
                  />
                  <select
                    value={link.group || ''}
                    onChange={(e) => updateLink(link.id, 'group', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: 'var(--surface)',
                      border: '1px solid #666',
                      borderRadius: '4px',
                      color: 'var(--fg)',
                      fontSize: '0.9rem',
                      marginTop: '0.5rem'
                    }}
                  >
                    <option value="">选择分组</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={link.icon || 'link'}
                    onChange={(e) => updateLink(link.id, 'icon', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: 'var(--surface)',
                      border: '1px solid #666',
                      borderRadius: '4px',
                      color: 'var(--fg)',
                      fontSize: '0.9rem',
                      marginTop: '0.5rem'
                    }}
                  >
                    {PREDEFINED_ICONS.map(icon => (
                      <option key={icon.id} value={icon.id}>
                        {icon.emoji} {icon.name}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={link.description || ''}
                    onChange={(e) => updateLink(link.id, 'description', e.target.value)}
                    placeholder="链接说明（可选）"
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: 'var(--surface)',
                      border: '1px solid #666',
                      borderRadius: '4px',
                      color: 'var(--fg)',
                      fontSize: '0.9rem',
                      marginTop: '0.5rem',
                      resize: 'vertical'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>博客设置</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--fg)' }}>
                  个人简介
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="介绍一下自己..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: 'var(--surface)',
                    border: '1px solid #666',
                    borderRadius: '4px',
                    color: 'var(--fg)',
                    fontSize: '0.9rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--fg)' }}>
                  Twitter 用户名
                </label>
                <input
                  type="text"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                  placeholder="username (不含@)"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: 'var(--surface)',
                    border: '1px solid #666',
                    borderRadius: '4px',
                    color: 'var(--fg)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--fg)' }}>
                  主题风格
                </label>
                <select
                  value={themeId}
                  onChange={(e) => setThemeId(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: 'var(--surface)',
                    border: '1px solid #666',
                    borderRadius: '4px',
                    color: 'var(--fg)',
                    fontSize: '0.9rem'
                  }}
                >
                  {themes.map(theme => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name} - {theme.description}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                onClick={saveSettings}
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? '保存中...' : '保存设置'}
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #444' }}>
          <button 
            onClick={() => window.location.href = `https://${user}.catcat.meme/`}
            className="btn-secondary"
          >
            返回博客
          </button>
        </div>
      </div>
    </div>
  )
}
