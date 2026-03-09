import { useEffect, useState } from 'react'
import { getThemeClassName, THEMES } from '../themes'
import { useUserProfile } from './hooks/useUserProfile'
import { api, getUserAvatarUrl } from './lib/api'

interface Web3ProfileProps {
  username?: string
}

export const Web3ProfileSimple: React.FC<Web3ProfileProps> = ({ username: propUsername }) => {
  const { loading, user, links, currentTheme, setCurrentTheme } = useUserProfile({ username: propUsername })
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [newLinkForm, setNewLinkForm] = useState({ url: '', label: '' })
  const [showAddLink, setShowAddLink] = useState(false)
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [editLinkForm, setEditLinkForm] = useState({ url: '', label: '' })
  
  // 复制钱包地址功能
  const copyWalletAddress = async () => {
    if (user?.walletAddress) {
      try {
        await navigator.clipboard.writeText(user.walletAddress);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  };

  // 添加新链接
  const addNewLink = async () => {
    if (newLinkForm.url && newLinkForm.label) {
      try {
        const newLink = {
          id: Date.now().toString(),
          userId: user?.id || '',
          url: newLinkForm.url,
          label: newLinkForm.label,
          order: (links?.length || 0) + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await api.updateLinks(user?.username || '', [...(links || []), newLink]);
        setNewLinkForm({ url: '', label: '' });
        setShowAddLink(false);
        window.location.reload();
      } catch (error) {
        console.error('添加链接失败:', error);
        alert('添加链接失败，请重试');
      }
    }
  };

  // 开始编辑链接
  const startEditLink = (link: any) => {
    setEditingLinkId(link.id);
    setEditLinkForm({ url: link.url, label: link.label });
  };

  // 保存编辑的链接
  const saveEditLink = async () => {
    if (editingLinkId && editLinkForm.url && editLinkForm.label) {
      try {
        const updatedLinks = (links || []).map(link => 
          link.id === editingLinkId 
            ? { ...link, ...editLinkForm, updatedAt: new Date().toISOString() }
            : link
        );
        
        await api.updateLinks(user?.username || '', updatedLinks);
        setEditingLinkId(null);
        setEditLinkForm({ url: '', label: '' });
        window.location.reload();
      } catch (error) {
        console.error('更新链接失败:', error);
        alert('更新链接失败，请重试');
      }
    }
  };

  // 取消编辑链接
  const cancelEditLink = () => {
    setEditingLinkId(null);
    setEditLinkForm({ url: '', label: '' });
  };

  // 删除链接
  const deleteLink = async (linkId: string) => {
    if (confirm('确定要删除这个链接吗？')) {
      try {
        const updatedLinks = (links || []).filter(link => link.id !== linkId);
        await api.updateLinks(user?.username || '', updatedLinks);
        window.location.reload();
      } catch (error) {
        console.error('删除链接失败:', error);
        alert('删除链接失败，请重试');
      }
    }
  };

  // 上移链接
  const moveLinkUp = async (linkId: string) => {
    try {
      const linkList = [...(links || [])];
      const currentIndex = linkList.findIndex(link => link.id === linkId);
      
      if (currentIndex > 0) {
        // 交换位置
        [linkList[currentIndex], linkList[currentIndex - 1]] = 
        [linkList[currentIndex - 1], linkList[currentIndex]];
        
        // 更新order字段
        const updatedLinks = linkList.map((link, index) => ({
          ...link,
          order: index + 1,
          updatedAt: new Date().toISOString()
        }));
        
        await api.updateLinks(user?.username || '', updatedLinks);
        window.location.reload();
      }
    } catch (error) {
      console.error('移动链接失败:', error);
      alert('移动链接失败，请重试');
    }
  };

  // 下移链接
  const moveLinkDown = async (linkId: string) => {
    try {
      const linkList = [...(links || [])];
      const currentIndex = linkList.findIndex(link => link.id === linkId);
      
      if (currentIndex < linkList.length - 1) {
        // 交换位置
        [linkList[currentIndex], linkList[currentIndex + 1]] = 
        [linkList[currentIndex + 1], linkList[currentIndex]];
        
        // 更新order字段
        const updatedLinks = linkList.map((link, index) => ({
          ...link,
          order: index + 1,
          updatedAt: new Date().toISOString()
        }));
        
        await api.updateLinks(user?.username || '', updatedLinks);
        window.location.reload();
      }
    } catch (error) {
      console.error('移动链接失败:', error);
      alert('移动链接失败，请重试');
    }
  };
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    nickname: user?.nickname || '',
    bio: user?.bio || '',
    twitterHandle: user?.twitterHandle || '',
    linkedInHandle: user?.linkedInHandle || '',
    youtubeHandle: user?.youtubeHandle || '',
    instagramHandle: user?.instagramHandle || ''
  })
  
  // 同步编辑表单数据
  useEffect(() => {
    if (user) {
      setEditForm({
        nickname: user.nickname || '',
        bio: user.bio || '',
        twitterHandle: user.twitterHandle || '',
        linkedInHandle: user.linkedInHandle || '',
        youtubeHandle: user.youtubeHandle || '',
        instagramHandle: user.instagramHandle || ''
      });
    }
  }, [user]);

  // 应用主题到body元素
  useEffect(() => {
    const themeClass = getThemeClassName(currentTheme.id);
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(themeClass);
    
    // 添加加载动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
      document.head.removeChild(style);
    };
  }, [currentTheme.id]);

  // 响应式设计
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      const gridContainer = document.querySelector('.grid-container');
      
      if (gridContainer) {
        if (isMobile) {
          // 移动端：单列布局
          (gridContainer as HTMLElement).style.gridTemplateColumns = '1fr';
          (gridContainer as HTMLElement).style.gridTemplateRows = 'repeat(4, auto)';
          (gridContainer as HTMLElement).style.gap = '1rem';
          (gridContainer as HTMLElement).style.padding = '0.5rem';
        } else if (isTablet) {
          // 平板：双列布局
          (gridContainer as HTMLElement).style.gridTemplateColumns = 'repeat(2, 1fr)';
          (gridContainer as HTMLElement).style.gridTemplateRows = 'repeat(2, auto)';
          (gridContainer as HTMLElement).style.gap = '1rem';
          (gridContainer as HTMLElement).style.padding = '1rem';
        } else {
          // 桌面：原始布局
          (gridContainer as HTMLElement).style.gridTemplateColumns = 'repeat(6, 1fr)';
          (gridContainer as HTMLElement).style.gridTemplateRows = 'repeat(9, 280px)';
          (gridContainer as HTMLElement).style.gap = '1rem';
          (gridContainer as HTMLElement).style.padding = '1rem';
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  if (loading) {
    return (
      <div className="blog-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '1.2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid var(--theme-primary)', 
            borderTop: '3px solid transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          加载中...
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="blog-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '1.2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            opacity: 0.5
          }}>
            👤
          </div>
          <div style={{ 
            color: 'var(--theme-primary)',
            marginBottom: '1rem'
          }}>
            用户不存在
          </div>
          <div style={{ 
            fontSize: '0.875rem', 
            opacity: 0.7 
          }}>
            请检查用户名是否正确
          </div>
        </div>
      </div>
    )
  }

  const themeClass = getThemeClassName(currentTheme.id);
  
  // 简单的模块数组
  const modules = [
    { 
      id: 'profile', 
      name: '用户资料', 
      content: `${user?.nickname || user?.username}`,
      type: 'profile'
    },
    { 
      id: 'social', 
      name: '社交媒体', 
      content: '社交链接',
      type: 'social'
    },
    { 
      id: 'links', 
      name: '注册链接', 
      content: `共 ${links.length} 个链接`,
      type: 'links',
      data: links
    },
    { 
      id: 'mostfind', 
      name: '我活跃在', 
      content: '活跃平台',
      type: 'mostfind'
    }
  ];
  
  return (
    <div className={`blog-container ${themeClass}`} style={{ 
      width: '1800px',
      maxWidth: '100%',
      margin: '0 auto',
      minHeight: '100vh',
      padding: '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="grid-container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridTemplateRows: 'repeat(9, 280px)',
          gap: '1rem',
          minHeight: '900px'
        }}>
          {modules.map((module, index) => {
            // 根据模块类型和屏幕尺寸设置网格位置
            const getPosition = (type: string) => {
              const isMobile = window.innerWidth < 768;
              const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
              
              if (isMobile) {
                // 移动端：单列布局
                switch (type) {
                  case 'profile':
                    return { gridColumn: '1 / 2', gridRow: '1 / 2' };
                  case 'social':
                    return { gridColumn: '1 / 2', gridRow: '2 / 3' };
                  case 'links':
                    return { gridColumn: '1 / 2', gridRow: '3 / 4' };
                  case 'mostfind':
                    return { gridColumn: '1 / 2', gridRow: '4 / 5' };
                  default:
                    return { gridColumn: '1 / 2', gridRow: '5 / 6' };
                }
              } else if (isTablet) {
                // 平板：双列布局
                switch (type) {
                  case 'profile':
                    return { gridColumn: '1 / 2', gridRow: '1 / 2' };
                  case 'social':
                    return { gridColumn: '2 / 3', gridRow: '1 / 2' };
                  case 'links':
                    return { gridColumn: '1 / 2', gridRow: '2 / 3' };
                  case 'mostfind':
                    return { gridColumn: '2 / 3', gridRow: '2 / 3' };
                  default:
                    return { gridColumn: '1 / 2', gridRow: '3 / 4' };
                }
              } else {
                // 桌面：原始布局
                switch (type) {
                  case 'profile':
                    return { gridColumn: '1 / 4', gridRow: '1 / 3' };
                  case 'social':
                    return { gridColumn: '4 / 7', gridRow: '1 / 3' };
                  case 'links':
                    return { gridColumn: '1 / 4', gridRow: '3 / 5' };
                  case 'mostfind':
                    return { gridColumn: '4 / 7', gridRow: '3 / 5' };
                  default:
                    return { gridColumn: '1 / 3', gridRow: '5 / 7' };
                }
              }
            };

            const position = getPosition(module.type);

            return (
              <div
                key={`simple-${module.id}-${index}`}
                style={{
                  ...position,
                  background: 'rgba(255,255,255,0.1)',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                <h3>{module.name}</h3>
                
                {module.type === 'profile' && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      {getUserAvatarUrl(user) ? (
                        <img 
                          src={getUserAvatarUrl(user!)} 
                          alt={user?.username}
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '3px solid var(--theme-primary)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%)',
                          margin: '0 auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem',
                          color: 'white',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}>
                          {user?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      {isEditing ? (
                        <div style={{ marginBottom: '1rem' }}>
                          <input
                            type="text"
                            value={editForm.nickname}
                            onChange={(e) => setEditForm({...editForm, nickname: e.target.value})}
                            placeholder="昵称"
                            style={{
                              padding: '0.5rem',
                              border: '1px solid var(--theme-primary)',
                              borderRadius: '4px',
                              background: 'var(--theme-surface)',
                              color: 'var(--theme-primary)',
                              fontSize: '1rem',
                              width: '100%',
                              marginBottom: '0.5rem'
                            }}
                          />
                          <textarea
                            value={editForm.bio}
                            onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                            placeholder="个人简介"
                            rows={3}
                            style={{
                              padding: '0.5rem',
                              border: '1px solid var(--theme-primary)',
                              borderRadius: '4px',
                              background: 'var(--theme-surface)',
                              color: 'var(--theme-primary)',
                              fontSize: '0.875rem',
                              width: '100%',
                              marginBottom: '0.5rem',
                              resize: 'vertical'
                            }}
                          />
                          <input
                            type="text"
                            value={editForm.twitterHandle}
                            onChange={(e) => setEditForm({...editForm, twitterHandle: e.target.value})}
                            placeholder="Twitter 用户名"
                            style={{
                              padding: '0.5rem',
                              border: '1px solid var(--theme-primary)',
                              borderRadius: '4px',
                              background: 'var(--theme-surface)',
                              color: 'var(--theme-primary)',
                              fontSize: '0.875rem',
                              width: '100%',
                              marginBottom: '0.5rem'
                            }}
                          />
                          <input
                            type="text"
                            value={editForm.linkedInHandle}
                            onChange={(e) => setEditForm({...editForm, linkedInHandle: e.target.value})}
                            placeholder="LinkedIn 用户名"
                            style={{
                              padding: '0.5rem',
                              border: '1px solid var(--theme-primary)',
                              borderRadius: '4px',
                              background: 'var(--theme-surface)',
                              color: 'var(--theme-primary)',
                              fontSize: '0.875rem',
                              width: '100%',
                              marginBottom: '0.5rem'
                            }}
                          />
                          <input
                            type="text"
                            value={editForm.youtubeHandle}
                            onChange={(e) => setEditForm({...editForm, youtubeHandle: e.target.value})}
                            placeholder="YouTube 用户名"
                            style={{
                              padding: '0.5rem',
                              border: '1px solid var(--theme-primary)',
                              borderRadius: '4px',
                              background: 'var(--theme-surface)',
                              color: 'var(--theme-primary)',
                              fontSize: '0.875rem',
                              width: '100%',
                              marginBottom: '0.5rem'
                            }}
                          />
                          <input
                            type="text"
                            value={editForm.instagramHandle}
                            onChange={(e) => setEditForm({...editForm, instagramHandle: e.target.value})}
                            placeholder="Instagram 用户名"
                            style={{
                              padding: '0.5rem',
                              border: '1px solid var(--theme-primary)',
                              borderRadius: '4px',
                              background: 'var(--theme-surface)',
                              color: 'var(--theme-primary)',
                              fontSize: '0.875rem',
                              width: '100%',
                              marginBottom: '0.5rem'
                            }}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={async () => {
                                try {
                                  setIsSaving(true);
                                  console.log('保存用户资料:', editForm);
                                  
                                  // 调用API保存用户资料
                                  const updatedUser = await api.updateUser(user?.username || '', {
                                    nickname: editForm.nickname,
                                    bio: editForm.bio,
                                    twitterHandle: editForm.twitterHandle,
                                    linkedInHandle: editForm.linkedInHandle,
                                    youtubeHandle: editForm.youtubeHandle,
                                    instagramHandle: editForm.instagramHandle
                                  });
                                  
                                  console.log('保存成功:', updatedUser);
                                  setIsEditing(false);
                                  
                                  // TODO: 刷新用户数据或更新本地状态
                                  window.location.reload();
                                } catch (error) {
                                  console.error('保存失败:', error);
                                  alert('保存失败，请重试');
                                } finally {
                                  setIsSaving(false);
                                }
                              }}
                              disabled={isSaving}
                              style={{
                                padding: '0.5rem 1rem',
                                background: isSaving ? '#ccc' : 'var(--theme-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                opacity: isSaving ? 0.7 : 1
                              }}
                            >
                              {isSaving ? '保存中...' : '保存'}
                            </button>
                            <button
                              onClick={() => {
                                setEditForm({
                                  nickname: user?.nickname || '',
                                  bio: user?.bio || '',
                                  twitterHandle: user?.twitterHandle || '',
                                  linkedInHandle: user?.linkedInHandle || '',
                                  youtubeHandle: user?.youtubeHandle || '',
                                  instagramHandle: user?.instagramHandle || ''
                                });
                                setIsEditing(false);
                              }}
                              disabled={isSaving}
                              style={{
                                padding: '0.5rem 1rem',
                                background: 'transparent',
                                color: 'var(--theme-primary)',
                                border: '1px solid var(--theme-primary)',
                                borderRadius: '4px',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                opacity: isSaving ? 0.5 : 1
                              }}
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h2 style={{ 
                            margin: '0 0 0.5rem 0', 
                            fontSize: '1.5rem', 
                            color: 'var(--theme-primary)',
                            fontWeight: '600'
                          }}>
                            {user?.nickname || user?.username}
                          </h2>
                          {user?.nickname && user?.username && (
                            <p style={{ 
                              margin: '0 0 0.5rem 0', 
                              fontSize: '0.875rem', 
                              opacity: 0.7 
                            }}>
                              @{user.username}
                            </p>
                          )}
                          {user?.bio && (
                            <p style={{ 
                              margin: '0 0 0.5rem 0', 
                              fontSize: '0.875rem', 
                              opacity: 0.8,
                              lineHeight: '1.4'
                            }}>
                              {user.bio}
                            </p>
                          )}
                          {user?.walletAddress && (
                            <div 
                              onClick={copyWalletAddress}
                              style={{ 
                                margin: '0', 
                                fontSize: '0.75rem', 
                                opacity: 0.6,
                                fontFamily: 'monospace',
                                background: 'rgba(var(--theme-primary-rgb), 0.1)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '0.8';
                                e.currentTarget.style.background = 'rgba(var(--theme-primary-rgb), 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '0.6';
                                e.currentTarget.style.background = 'rgba(var(--theme-primary-rgb), 0.1)';
                              }}
                            >
                              <span>{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</span>
                              <span style={{ 
                                fontSize: '0.875rem',
                                opacity: copySuccess ? 1 : 0.5,
                                transition: 'opacity 0.2s ease'
                              }}>
                                {copySuccess ? '✓' : '📋'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* 编辑按钮 */}
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'var(--theme-secondary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          marginTop: '0.5rem'
                        }}
                      >
                        ✏️ 编辑资料
                      </button>
                    )}
                  </div>
                )}
                
                {module.type === 'social' && (
                  <div>
                    <p>{module.content}</p>
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {user?.twitterHandle ? (
                        <a
                          href={`https://twitter.com/${user.twitterHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            padding: '0.25rem 0.5rem', 
                            background: 'rgba(29, 161, 242, 0.2)', 
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            textDecoration: 'none',
                            color: 'var(--theme-primary)',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(29, 161, 242, 0.3)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(29, 161, 242, 0.2)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          🐦 Twitter: @{user.twitterHandle}
                        </a>
                      ) : (
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          background: 'rgba(108, 117, 125, 0.2)', 
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontStyle: 'italic'
                        }}>
                          Twitter: 未设置
                        </span>
                      )}
                      <a
                        href={`https://github.com/${user?.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          padding: '0.25rem 0.5rem', 
                          background: 'rgba(51, 51, 51, 0.2)', 
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          textDecoration: 'none',
                          color: 'var(--theme-primary)',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(51, 51, 51, 0.3)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(51, 51, 51, 0.2)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        🐙 GitHub: {user?.username || '未设置'}
                      </a>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        background: 'rgba(142, 36, 170, 0.2)', 
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                      }}>
                        📡 Farcaster: {user?.username || '未设置'}
                      </span>
                      {user?.linkedInHandle ? (
                        <a
                          href={`https://linkedin.com/in/${user.linkedInHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            padding: '0.25rem 0.5rem', 
                            background: 'rgba(0, 119, 181, 0.2)', 
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            textDecoration: 'none',
                            color: 'var(--theme-primary)',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 119, 181, 0.3)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 119, 181, 0.2)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          💼 LinkedIn: @{user.linkedInHandle}
                        </a>
                      ) : (
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          background: 'rgba(108, 117, 125, 0.2)', 
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontStyle: 'italic'
                        }}>
                          LinkedIn: 未设置
                        </span>
                      )}
                      {user?.youtubeHandle ? (
                        <a
                          href={`https://youtube.com/@${user.youtubeHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            padding: '0.25rem 0.5rem', 
                            background: 'rgba(255, 0, 0, 0.2)', 
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            textDecoration: 'none',
                            color: 'var(--theme-primary)',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 0, 0, 0.3)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 0, 0, 0.2)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          📺 YouTube: @{user.youtubeHandle}
                        </a>
                      ) : (
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          background: 'rgba(108, 117, 125, 0.2)', 
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontStyle: 'italic'
                        }}>
                          YouTube: 未设置
                        </span>
                      )}
                      {user?.instagramHandle ? (
                        <a
                          href={`https://instagram.com/${user.instagramHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            padding: '0.25rem 0.5rem', 
                            background: 'rgba(225, 48, 108, 0.2)', 
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            textDecoration: 'none',
                            color: 'var(--theme-primary)',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(225, 48, 108, 0.3)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(225, 48, 108, 0.2)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          📷 Instagram: @{user.instagramHandle}
                        </a>
                      ) : (
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          background: 'rgba(108, 117, 125, 0.2)', 
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontStyle: 'italic'
                        }}>
                          Instagram: 未设置
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {module.type === 'links' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <p>{module.content}</p>
                      <button
                        onClick={() => setShowAddLink(!showAddLink)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: 'var(--theme-primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        {showAddLink ? '取消' : '+ 添加链接'}
                      </button>
                    </div>
                    
                    {showAddLink && (
                      <div style={{
                        padding: '0.5rem',
                        background: 'rgba(var(--theme-primary-rgb), 0.1)',
                        borderRadius: '4px',
                        marginBottom: '0.5rem'
                      }}>
                        <input
                          type="text"
                          placeholder="链接标题"
                          value={newLinkForm.label}
                          onChange={(e) => setNewLinkForm({...newLinkForm, label: e.target.value})}
                          style={{
                            padding: '0.25rem',
                            border: '1px solid var(--theme-primary)',
                            borderRadius: '4px',
                            background: 'var(--theme-surface)',
                            color: 'var(--theme-primary)',
                            fontSize: '0.75rem',
                            width: '100%',
                            marginBottom: '0.25rem'
                          }}
                        />
                        <input
                          type="url"
                          placeholder="链接地址 (https://...)"
                          value={newLinkForm.url}
                          onChange={(e) => setNewLinkForm({...newLinkForm, url: e.target.value})}
                          style={{
                            padding: '0.25rem',
                            border: '1px solid var(--theme-primary)',
                            borderRadius: '4px',
                            background: 'var(--theme-surface)',
                            color: 'var(--theme-primary)',
                            fontSize: '0.75rem',
                            width: '100%',
                            marginBottom: '0.25rem'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button
                            onClick={addNewLink}
                            disabled={!newLinkForm.url || !newLinkForm.label}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: newLinkForm.url && newLinkForm.label ? 'var(--theme-primary)' : '#ccc',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            添加
                          </button>
                          <button
                            onClick={() => {
                              setNewLinkForm({ url: '', label: '' });
                              setShowAddLink(false);
                            }}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: 'transparent',
                              color: 'var(--theme-primary)',
                              border: '1px solid var(--theme-primary)',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {module.data && module.data.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        {module.data.map((link: any, linkIndex: number) => (
                          <div key={link.id || linkIndex} style={{ marginBottom: '0.25rem' }}>
                            {editingLinkId === link.id ? (
                              <div style={{
                                padding: '0.25rem',
                                background: 'rgba(var(--theme-primary-rgb), 0.1)',
                                borderRadius: '4px',
                                border: '1px solid var(--theme-primary)'
                              }}>
                                <input
                                  type="text"
                                  value={editLinkForm.label}
                                  onChange={(e) => setEditLinkForm({...editLinkForm, label: e.target.value})}
                                  style={{
                                    padding: '0.25rem',
                                    border: '1px solid var(--theme-primary)',
                                    borderRadius: '4px',
                                    background: 'var(--theme-surface)',
                                    color: 'var(--theme-primary)',
                                    fontSize: '0.75rem',
                                    width: '100%',
                                    marginBottom: '0.25rem'
                                  }}
                                />
                                <input
                                  type="url"
                                  value={editLinkForm.url}
                                  onChange={(e) => setEditLinkForm({...editLinkForm, url: e.target.value})}
                                  style={{
                                    padding: '0.25rem',
                                    border: '1px solid var(--theme-primary)',
                                    borderRadius: '4px',
                                    background: 'var(--theme-surface)',
                                    color: 'var(--theme-primary)',
                                    fontSize: '0.75rem',
                                    width: '100%',
                                    marginBottom: '0.25rem'
                                  }}
                                />
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                  <button
                                    onClick={saveEditLink}
                                    disabled={!editLinkForm.url || !editLinkForm.label}
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      background: editLinkForm.url && editLinkForm.label ? 'var(--theme-primary)' : '#ccc',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    保存
                                  </button>
                                  <button
                                    onClick={cancelEditLink}
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      background: 'transparent',
                                      color: 'var(--theme-primary)',
                                      border: '1px solid var(--theme-primary)',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    取消
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                border: '1px solid rgba(var(--theme-primary-rgb), 0.2)',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(var(--theme-primary-rgb), 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                              >
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ 
                                    fontSize: '0.875rem', 
                                    opacity: 0.8,
                                    color: 'var(--theme-primary)',
                                    textDecoration: 'none',
                                    flex: 1
                                  }}
                                >
                                  🔗 {link.label || link.title || '无标题'}
                                </a>
                                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                  <button
                                    onClick={() => moveLinkUp(link.id)}
                                    disabled={linkIndex === 0}
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      background: linkIndex === 0 ? '#ccc' : 'var(--theme-secondary)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: linkIndex === 0 ? 'not-allowed' : 'pointer',
                                      fontSize: '0.75rem',
                                      opacity: linkIndex === 0 ? 0.5 : 1
                                    }}
                                  >
                                    ↑
                                  </button>
                                  <button
                                    onClick={() => moveLinkDown(link.id)}
                                    disabled={linkIndex === module.data.length - 1}
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      background: linkIndex === module.data.length - 1 ? '#ccc' : 'var(--theme-secondary)',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: linkIndex === module.data.length - 1 ? 'not-allowed' : 'pointer',
                                      fontSize: '0.75rem',
                                      opacity: linkIndex === module.data.length - 1 ? 0.5 : 1
                                    }}
                                  >
                                    ↓
                                  </button>
                                  <button
                                    onClick={() => startEditLink(link)}
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      background: 'transparent',
                                      color: 'var(--theme-primary)',
                                      border: '1px solid var(--theme-primary)',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    编辑
                                  </button>
                                  <button
                                    onClick={() => deleteLink(link.id)}
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      background: 'rgba(255, 0, 0, 0.1)',
                                      color: '#d32f2f',
                                      border: '1px solid rgba(255, 0, 0, 0.3)',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    删除
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {module.type === 'mostfind' && (
                  <div>
                    <p>{module.content}</p>
                    <div style={{ 
                      marginTop: '0.5rem', 
                      fontSize: '0.875rem', 
                      opacity: 0.8 
                    }}>
                      <div>• Web3社区</div>
                      <div>• 开发者平台</div>
                      <div>• 创作者生态</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="theme-text-muted" style={{ 
          textAlign: 'center', 
          padding: '1rem',
          fontSize: '0.75rem',
          borderTop: '1px solid rgba(var(--theme-primary-rgb), 0.2)',
          marginTop: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <a
              href="/privacy"
              className="theme-link"
              style={{ color: 'var(--theme-primary)', textDecoration: 'none' }}
            >
              隐私政策
            </a>
            <a
              href="/terms"
              className="theme-link"
              style={{ color: 'var(--theme-primary)', textDecoration: 'none' }}
            >
              使用条款
            </a>
            <a
              href="https://github.com/cloud-cottage/cat"
              target="_blank"
              rel="noopener noreferrer"
              className="theme-link"
              style={{ color: 'var(--theme-primary)', textDecoration: 'none' }}
            >
              GitHub
            </a>
          </div>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.7rem', opacity: 0.6 }}>
            Powered by CAT - Your Web3 Paws
          </p>
          
          {/* 主题切换按钮 */}
          <div style={{ marginTop: '1rem' }}>
            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--theme-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              🎨 切换主题
            </button>
          </div>
          
          {/* 主题选择器 */}
          {showThemeSelector && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'var(--theme-surface)',
              borderRadius: '8px',
              border: '1px solid rgba(var(--theme-primary-rgb), 0.2)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ 
                margin: '0 0 1rem 0', 
                color: 'var(--theme-primary)',
                fontSize: '1rem'
              }}>
                选择主题
              </h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '0.5rem'
              }}>
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setCurrentTheme(theme);
                      setShowThemeSelector(false);
                    }}
                    style={{
                      padding: '0.75rem',
                      background: currentTheme.id === theme.id 
                        ? 'var(--theme-primary)' 
                        : 'transparent',
                      color: currentTheme.id === theme.id 
                        ? 'white' 
                        : 'var(--theme-primary)',
                      border: `1px solid var(--theme-primary)`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (currentTheme.id !== theme.id) {
                        e.currentTarget.style.background = 'rgba(var(--theme-primary-rgb), 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentTheme.id !== theme.id) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
