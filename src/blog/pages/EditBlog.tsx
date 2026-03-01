import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { api, type Link } from '../lib/api'

interface Post {
  id: string
  title: string
  content: string
  order: number
}

export default function EditBlog() {
  const { user } = useParams()
  const { address, isConnected } = useAccount()
  const navigate = useNavigate()
  
  const [links, setLinks] = useState<Link[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'links' | 'posts'>('links')

  useEffect(() => {
    if (!isConnected || !address) {
      navigate('/')
      return
    }

    loadUserData()
  }, [user, isConnected, address, navigate])

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      const userData = await api.getUserByUsername(user!)
      if (userData) {
        setLinks(userData.links || [])
        // 暂时没有 posts，使用空数组
        setPosts([])
      }
    } catch (err) {
      console.error('Failed to load user data:', err)
      setError('加载数据失败')
    } finally {
      setIsLoading(false)
    }
  }

  const saveUserData = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // 先更新链接
      await api.updateLinks(user!, links.sort((a, b) => a.order - b.order))
      
      // 保存成功后跳转到展示页面
      window.location.href = `https://${user}.catcat.meme/`
    } catch (err) {
      console.error('Failed to save user data:', err)
      setError('保存失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const addLink = () => {
    const newLink: Link = {
      id: Date.now().toString(),
      label: '新链接',
      url: '',
      order: links.length,
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

  const addPost = () => {
    const newPost: Post = {
      id: Date.now().toString(),
      title: '新文章',
      content: '',
      order: posts.length
    }
    setPosts([...posts, newPost])
  }

  const updatePost = (id: string, field: keyof Post, value: string) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, [field]: value } : post
    ))
  }

  const deletePost = (id: string) => {
    setPosts(posts.filter(post => post.id !== id))
  }

  const movePost = (id: string, direction: 'up' | 'down') => {
    const index = posts.findIndex(post => post.id === id)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= posts.length) return

    const newPosts = [...posts]
    const [movedPost] = newPosts.splice(index, 1)
    newPosts.splice(newIndex, 0, movedPost)
    
    // 更新 order 字段
    return newPosts.map((post, i) => ({ ...post, order: i }))
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

  return (
    <div className="blog-container">
      <div className="blog-card">
        {/* 头部 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #444'
        }}>
          <h1 className="blog-title">编辑博客</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => window.location.href = `https://${user}.catcat.meme/`}
              className="btn-secondary"
            >
              预览
            </button>
            <button 
              onClick={saveUserData}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div style={{ 
            marginBottom: '1rem', 
            padding: '0.75rem', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: '6px',
            color: '#ef4444',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {/* 标签页 */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          borderBottom: '1px solid #444'
        }}>
          <button 
            onClick={() => setActiveTab('links')}
            style={{
              padding: '0.5rem 1rem',
              background: activeTab === 'links' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'links' ? 'white' : 'var(--fg)',
              border: '1px solid var(--accent)',
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer'
            }}
          >
            链接管理
          </button>
          <button 
            onClick={() => setActiveTab('posts')}
            style={{
              padding: '0.5rem 1rem',
              background: activeTab === 'posts' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'posts' ? 'white' : 'var(--fg)',
              border: '1px solid var(--accent)',
              borderRadius: '6px 6px 0 0',
              cursor: 'pointer'
            }}
          >
            文章管理
          </button>
        </div>

        {/* 内容区域 */}
        {activeTab === 'links' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>链接管理</h3>
              <button onClick={addLink} className="btn-secondary">
                + 添加链接
              </button>
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
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>文章管理</h3>
              <button onClick={addPost} className="btn-secondary">
                + 添加文章
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {posts.map((post, index) => (
                <div 
                  key={post.id}
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
                      value={post.title}
                      onChange={(e) => updatePost(post.id, 'title', e.target.value)}
                      placeholder="文章标题"
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
                        onClick={() => movePost(post.id, 'up')}
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
                        onClick={() => movePost(post.id, 'down')}
                        disabled={index === posts.length - 1}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#666',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: index === posts.length - 1 ? 'not-allowed' : 'pointer',
                          opacity: index === posts.length - 1 ? 0.5 : 1
                        }}
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
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
                  <textarea
                    value={post.content}
                    onChange={(e) => updatePost(post.id, 'content', e.target.value)}
                    placeholder="文章内容（支持 Markdown）"
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: 'var(--surface)',
                      border: '1px solid #666',
                      borderRadius: '4px',
                      color: 'var(--fg)',
                      fontSize: '0.9rem',
                      resize: 'vertical',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
