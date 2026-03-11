import { useEffect, useState } from 'react'
import { getThemeClassName, getThemeColors } from '../../themes'
import { useUserProfile } from './hooks/useUserProfile'
import { api, getUserAvatarUrl } from './lib/api'
import { ThemeModal } from './components/ThemeModal'
import { Icon } from './components/Icon'
import { QRCodeComponent } from './components/QRCode'
import { useLanguage } from '../../i18n/useLanguage'

interface Web3ProfileProps {
  username?: string
}

export const Web3ProfileSimple: React.FC<Web3ProfileProps> = ({ username: propUsername }) => {
  const { loading, user, links, currentTheme, setCurrentTheme, isOwner } = useUserProfile({ username: propUsername })
  const { t } = useLanguage()
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [newLinkForm, setNewLinkForm] = useState({ url: '', label: '' })
  const [showAddLink, setShowAddLink] = useState(false)
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [editLinkForm, setEditLinkForm] = useState({ url: '', label: '' })
  const [applyingTheme, setApplyingTheme] = useState(false)
  const [showCatPawModal, setShowCatPawModal] = useState(false)
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showExploreModal, setShowExploreModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showCreatePageModal, setShowCreatePageModal] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const [windowWidth, setWindowWidth] = useState(0)
  
  // 强制设置容器宽度 - 改为响应式
  useEffect(() => {
    const container = document.querySelector('.paw-container') as HTMLElement
    if (container) {
      // 设置响应式样式
      container.style.cssText = `
        width: 100% !important;
        max-width: 900px !important;
        min-width: 300px !important;
        margin: 0 auto !important;
        box-sizing: border-box !important;
        display: block !important;
        flex-shrink: 0 !important;
        flex-grow: 0 !important;
      `
      
      // 强制覆盖所有可能的样式
      container.setAttribute('style', `
        width: 100% !important;
        max-width: 900px !important;
        min-width: 300px !important;
        margin: 0 auto !important;
        box-sizing: border-box !important;
        display: block !important;
        flex-shrink: 0 !important;
        flex-grow: 0 !important;
      `)
    }
  }, [currentTheme])

  // 强制修复容器宽度 - 每次渲染都检查
  useEffect(() => {
    const forceFixWidth = () => {
      const container = document.querySelector('.paw-container') as HTMLElement
      if (container) {
        // 使用 offsetWidth 而不是 getBoundingClientRect() 来避免 devicePixelRatio 影响
        const width = container.offsetWidth
        setContainerWidth(width)
        
        // 检测翻倍问题并修复 - 使用 offsetWidth 作为主要判断
        if (width > 900) {
          // 强制设置正确的尺寸
          container.style.setProperty('width', '100%', 'important')
          container.style.setProperty('max-width', '900px', 'important')
          container.style.setProperty('min-width', '300px', 'important')
          container.style.setProperty('margin', '0 auto', 'important')
          container.style.setProperty('transform', 'none', 'important')
          container.style.setProperty('zoom', '1', 'important')
          
          // 完全覆盖样式
          container.style.cssText = `
            width: 100% !important;
            max-width: 900px !important;
            min-width: 300px !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
            display: block !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
            transform: none !important;
            zoom: 1 !important;
          `
          
          container.setAttribute('style', `
            width: 100% !important;
            max-width: 900px !important;
            min-width: 300px !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
            display: block !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
            transform: none !important;
            zoom: 1 !important;
          `)
          
          // 强制重排
          container.style.display = 'none'
          container.offsetHeight
          container.style.display = 'block'
          
          // 更新显示的宽度
          setTimeout(() => {
            const newWidth = container.offsetWidth
            setContainerWidth(newWidth)
          }, 10)
        }
      }
      
      // 修复按钮尺寸问题 - 使用 offsetWidth/offsetHeight
      const buttons = document.querySelectorAll('.cat-btn') as NodeListOf<HTMLElement>
      buttons.forEach((button) => {
        const btnWidth = button.offsetWidth
        const btnHeight = button.offsetHeight
        
        // 使用 offsetWidth 作为判断标准
        if (btnWidth > 50 || btnHeight > 40) {
          button.style.setProperty('width', '50px', 'important')
          button.style.setProperty('height', '40px', 'important')
          button.style.setProperty('min-width', '50px', 'important')
          button.style.setProperty('max-width', '50px', 'important')
          button.style.setProperty('min-height', '40px', 'important')
          button.style.setProperty('max-height', '40px', 'important')
          button.style.setProperty('transform', 'none', 'important')
          button.style.setProperty('zoom', '1', 'important')
        }
      })
      
      if (typeof window !== 'undefined') {
        setWindowWidth(window.innerWidth)
      }
    }

    // 立即执行一次
    forceFixWidth()
    
    // 监听各种可能的事件
    window.addEventListener('resize', forceFixWidth)
    window.addEventListener('orientationchange', forceFixWidth)
    
    // 更频繁的定时检查
    const interval = setInterval(forceFixWidth, 25)
    
    return () => {
      window.removeEventListener('resize', forceFixWidth)
      window.removeEventListener('orientationchange', forceFixWidth)
      clearInterval(interval)
    }
  }, [currentTheme])

  // 实时更新调试信息
  useEffect(() => {
    const updateWidths = () => {
      const container = document.querySelector('.paw-container') as HTMLElement
      if (container) {
        const width = container.getBoundingClientRect().width
        setContainerWidth(width)
        
        // 强制检查并修复宽度
        if (width > 900) {
          container.style.cssText = `
            width: 100% !important;
            max-width: 900px !important;
            min-width: 300px !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
            display: block !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
          `
          
          container.setAttribute('style', `
            width: 100% !important;
            max-width: 900px !important;
            min-width: 300px !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
            display: block !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
          `)
        }
      }
      if (typeof window !== 'undefined') {
        setWindowWidth(window.innerWidth)
      }
    }

    // 初始更新
    updateWidths()

    // 监听窗口大小变化
    const handleResize = () => {
      updateWidths()
    }

    window.addEventListener('resize', handleResize)
    
    // 定时更新（确保实时性）
    const interval = setInterval(updateWidths, 50)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearInterval(interval)
    }
  }, [currentTheme])
  
  // 持续监控容器宽度
  useEffect(() => {
    const interval = setInterval(() => {
      const container = document.querySelector('.paw-container') as HTMLElement
      if (container) {
        const currentWidth = container.getBoundingClientRect().width
        // 检查是否在合理范围内 (300px - 900px)
        if (currentWidth < 300 || currentWidth > 900) {
          container.style.cssText = `
            width: 100% !important;
            max-width: 900px !important;
            min-width: 300px !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
            display: block !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
          `
          
          // 强制覆盖所有可能的样式
          container.setAttribute('style', `
            width: 100% !important;
            max-width: 900px !important;
            min-width: 300px !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
            display: block !important;
            flex-shrink: 0 !important;
            flex-grow: 0 !important;
          `)
        }
      }
    }, 100) // 每 100ms 检查一次
    
    return () => clearInterval(interval)
  }, [currentTheme])

  // 使用 MutationObserver 监控样式变化
  useEffect(() => {
    const container = document.querySelector('.paw-container') as HTMLElement
    if (!container) return

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const currentWidth = container.getBoundingClientRect().width
          
          // 检查是否在合理范围内
          if (currentWidth < 300 || currentWidth > 900) {
            container.style.cssText = `
              width: 100% !important;
              max-width: 900px !important;
              min-width: 300px !important;
              margin: 0 auto !important;
              box-sizing: border-box !important;
              display: block !important;
              flex-shrink: 0 !important;
              flex-grow: 0 !important;
            `
            
            // 强制覆盖所有可能的样式
            container.setAttribute('style', `
              width: 100% !important;
              max-width: 900px !important;
              min-width: 300px !important;
              margin: 0 auto !important;
              box-sizing: border-box !important;
              display: block !important;
              flex-shrink: 0 !important;
              flex-grow: 0 !important;
            `)
          }
        }
      })
    })

    observer.observe(container, {
      attributes: true,
      attributeFilter: ['style']
    })

    return () => observer.disconnect()
  }, [currentTheme])
  
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

  // 获取当前主题颜色
  const getCurrentThemeColors = () => {
    if (!currentTheme) return { primary: '#FF6B35', secondary: '#00D9FF', bg: '#0A0E27', surface: '#1A1F3A' };
    return getThemeColors(currentTheme, isDarkMode);
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
        const updatedLinks = (links || []).map((link: any) => 
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
        const updatedLinks = (links || []).filter((link: any) => link.id !== linkId);
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
      const currentIndex = linkList.findIndex((link: any) => link.id === linkId);
      
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
      const currentIndex = linkList.findIndex((link: any) => link.id === linkId);
      
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

  // 应用主题功能
  const applyTheme = async (theme: any) => {
    try {
      setApplyingTheme(true);
      
      // 保存主题选择到数据库
      const updatedUser = await api.updateUser(user?.username || '', {
        themeId: theme.id,
        layout: {
          themeId: theme.id,
          modules: user?.layout?.modules || []
        }
      });
      
      console.log('主题保存成功:', updatedUser);
      
      // 应用主题
      setCurrentTheme(theme);
      setShowThemeSelector(false);
      
      // 显示成功提示
      alert('主题应用成功！');
    } catch (error) {
      console.error('主题应用失败:', error);
      alert('主题应用失败，请重试');
    } finally {
      setApplyingTheme(false);
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
    if (!currentTheme) return;
    
    const themeClass = getThemeClassName(currentTheme.id);
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(themeClass);
    
    // 应用主题CSS变量
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', currentTheme.colors.primary);
    root.style.setProperty('--theme-secondary', currentTheme.colors.secondary);
    root.style.setProperty('--theme-bg', currentTheme.colors.bg);
    root.style.setProperty('--theme-surface', currentTheme.colors.surface);
    
    // 计算RGB值用于透明度
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
        '0, 0, 0';
    };
    
    root.style.setProperty('--theme-primary-rgb', hexToRgb(currentTheme.colors.primary));
    
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
  }, [currentTheme]);

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
      <div className="paw-container" style={{ 
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
      <div className="paw-container" style={{ 
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
    <div className={`paw-container ${themeClass}`} style={{ 
      width: '100%',
      maxWidth: '900px',
      minWidth: '300px',
      margin: '0 auto',
      minHeight: '100vh',
      background: getCurrentThemeColors().bg,
      color: isDarkMode ? '#ffffff' : '#000000',
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem',
      position: 'relative',
      boxSizing: 'border-box',
      display: 'block',
      flexShrink: 0,
      flexGrow: 0
    }}>
      {/* 调试信息 */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'red',
        color: 'white',
        padding: '10px',
        fontSize: '14px',
        zIndex: 99999,
        borderRadius: '4px',
        border: '2px solid white'
      }}>
        调试: paw-container 最大宽度应为 900px<br/>
        最小宽度应为 300px<br/>
        当前实际宽度: {containerWidth}px<br/>
        窗口宽度: {windowWidth}px<br/>
        设备像素比: {typeof window !== 'undefined' ? window.devicePixelRatio : '未知'}<br/>
        浏览器缩放: {typeof window !== 'undefined' ? Math.round(window.outerWidth / window.innerWidth * 100) + '%' : '未知'}<br/>
        容器CSS宽度: {(() => {
          if (typeof window !== 'undefined') {
            const container = document.querySelector('.paw-container') as HTMLElement
            if (container) {
              const styles = window.getComputedStyle(container)
              return styles.width
            }
          }
          return '未知'
        })()}<br/>
        容器offsetWidth: {(() => {
          if (typeof window !== 'undefined') {
            const container = document.querySelector('.paw-container') as HTMLElement
            if (container) {
              return container.offsetWidth + 'px'
            }
          }
          return '未知'
        })()}
      </div>
      {/* 猫爪按钮 */}
      <button
        className="cat-paw-btn cat-btn"
        onClick={() => setShowCatPawModal(true)}
        title={t('clickToViewMore')}
      >
        <Icon name="paw" size={40} />
      </button>

      {/* 编辑模式按钮 */}
      {isOwner && (
        <>
          {/* 调试信息 */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              position: 'absolute',
              top: '60px',
              right: '20px',
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '0.5rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              zIndex: 1001
            }}>
              isOwner: {isOwner ? 'true' : 'false'}<br/>
              isEditingMode: {isEditingMode ? 'true' : 'false'}<br/>
              user: {user?.username || 'null'}
            </div>
          )}
          <div style={{ 
            position: 'absolute', 
            top: '20px', 
            right: '20px',
            display: 'flex',
            gap: '0.5rem',
            zIndex: 1000
          }}>
            <button
              className="cat-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{
                background: isDarkMode ? '#2c3e50' : '#f39c12',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
              }}
              title={isDarkMode ? '切换到日间模式' : '切换到夜间模式'}
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>
            {isEditingMode && (
              <button
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: getCurrentThemeColors().primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                }}
              >
                🎨 切换主题
              </button>
            )}
            <button
              className="cat-btn"
              onClick={() => setIsEditingMode(!isEditingMode)}
              title={t('editMode')}
            >
              <Icon name="edit" size={24} />
            </button>
            <button
              className="cat-btn"
              onClick={() => setShowShareModal(true)}
              title={t('share')}
            >
              <Icon name="share" size={24} />
            </button>
          </div>
        </>
      )}

      {/* 猫爪模态框 */}
      {showCatPawModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            maxWidth: '400px',
            textAlign: 'center',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowCatPawModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666',
                padding: '0.5rem',
                borderRadius: '50%',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
                e.currentTarget.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#666';
              }}
            >
              ×
            </button>
            
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem'
            }}>
              🐾
            </div>
            
            <h2 style={{
              margin: '0 0 1rem 0',
              color: '#333',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              你的链上身份聚合器
            </h2>
            
            <p style={{
              margin: '0',
              color: '#666',
              fontSize: '1rem',
              lineHeight: '1.5'
            }}>
              整合你的Web3身份，展示完整的数字足迹
            </p>
          </div>
        </div>
      )}

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
                      ) : isEditingMode ? (
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          background: 'rgba(108, 117, 125, 0.2)', 
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontStyle: 'italic'
                        }}>
                          Twitter: 未设置
                        </span>
                      ) : null}
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
                      ) : isEditingMode ? (
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          background: 'rgba(108, 117, 125, 0.2)', 
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontStyle: 'italic'
                        }}>
                          LinkedIn: 未设置
                        </span>
                      ) : null}
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
                      ) : isEditingMode ? (
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          background: 'rgba(108, 117, 125, 0.2)', 
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontStyle: 'italic'
                        }}>
                          YouTube: 未设置
                        </span>
                      ) : null}
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
                      ) : isEditingMode ? (
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          background: 'rgba(108, 117, 125, 0.2)', 
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontStyle: 'italic'
                        }}>
                          Instagram: 未设置
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}
                
                {module.type === 'links' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <p>{module.content}</p>
                      {isEditingMode && (
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
                      )}
                    </div>
                    
                    {showAddLink && isEditingMode && (
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
                            {editingLinkId === link.id && isEditingMode ? (
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
                                  {isEditingMode && (
                                    <>
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
                                    </>
                                  )}
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
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="theme-link"
              style={{ 
                color: 'var(--theme-primary)', 
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'inherit'
              }}
            >
              {t('privacy')}
            </button>
            <a
              href="https://t.me/xCatKing"
              target="_blank"
              rel="noopener noreferrer"
              className="theme-link"
              style={{ color: 'var(--theme-primary)', textDecoration: 'none' }}
            >
              {t('report')}
            </a>
            <button
              onClick={() => setShowExploreModal(true)}
              className="theme-link"
              style={{ 
                color: 'var(--theme-primary)', 
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'inherit'
              }}
            >
              {t('explore')}
            </button>
          </div>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.7rem', opacity: 0.6 }}>
            Powered by CAT - Your Web3 Paws
          </p>
          
          {/* 主题选择器模态框 */}
          {showThemeSelector && (
            <ThemeModal
              currentTheme={currentTheme}
              onThemeChange={(theme) => setCurrentTheme(theme)}
              onClose={() => setShowThemeSelector(false)}
              onApplyTheme={applyTheme}
              applyingTheme={applyingTheme}
            />
          )}
        </div>

      {/* 分享模态框 */}
      {showShareModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              color: '#333',
              margin: '0 0 1.5rem 0',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              {t('shareTitle')}
            </h2>
            
            <p style={{ 
              color: '#666',
              margin: '0 0 2rem 0',
              fontSize: '1rem',
              lineHeight: '1.5'
            }}>
              {t('shareDescription')}
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <input
                type="text"
                readOnly
                value={typeof window !== 'undefined' ? `${window.location.protocol}//${user?.username || 'username'}.catcat.meme` : ''}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  width: '100%',
                  backgroundColor: '#f8f9fa',
                  textAlign: 'center'
                }}
                onClick={(e) => e.currentTarget.select()}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  const url = typeof window !== 'undefined' ? `${window.location.protocol}//${user?.username || 'username'}.catcat.meme` : '';
                  navigator.clipboard.writeText(url);
                  alert('链接已复制到剪贴板！');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                {t('copyLink')}
              </button>
              
              <button
                onClick={() => setShowShareModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 二维码显示 - 右下角 */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'flex-end'
        }}
      >
        {/* 创建页面按钮 */}
        <button
          className="cat-btn"
          onClick={() => setShowCreatePageModal(true)}
          style={{
            marginBottom: '10px'
          }}
          title={t('createOwnPage')}
        >
          {t('createOwnPage')}
        </button>
        
        {/* 二维码 */}
        <div
          title={t('viewOnMobile')}
        >
          <QRCodeComponent 
            url={typeof window !== 'undefined' ? window.location.href : ''} 
            size={160} 
          />
          {/* 二维码下方文字 */}
          <div style={{
            textAlign: 'center',
            fontSize: '12px',
            color: isDarkMode ? '#ffffff' : '#666666',
            marginTop: '8px',
            fontFamily: 'system-ui, sans-serif',
            opacity: 0.8
          }}>
            View on mobile
          </div>
        </div>
      </div>

      {/* 探索模态框 */}
      {showExploreModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              color: '#333',
              margin: '0 0 1.5rem 0',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              {t('exploreTitle')}
            </h2>
            
            <div style={{
              width: '100%',
              height: '200px',
              backgroundColor: '#f5f5f5',
              margin: '0 0 2rem 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              color: '#666',
              borderRadius: '8px'
            }}>
              Content placeholder
            </div>

            <button
              onClick={() => setShowExploreModal(false)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}

      {/* 隐私条款模态框 */}
      {showPrivacyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ 
              color: '#333',
              margin: '0 0 1.5rem 0',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              {t('privacyTitle')}
            </h2>
            
            <div style={{
              color: '#666',
              lineHeight: '1.6',
              fontSize: '0.95rem',
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              {t('privacyContent')}
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}

      {/* 创建页面模态框 */}
      {showCreatePageModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ 
              color: '#333',
              margin: '0 0 1.5rem 0',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              {t('createOwnPageTitle')}
            </h2>
            
            <div style={{
              color: '#666',
              lineHeight: '1.6',
              fontSize: '0.95rem',
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              {t('createOwnPageContent')}
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <a
                href="https://degens.traders"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  background: '#007bff',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0056b3';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#007bff';
                }}
              >
                degens.traders
              </a>
              
              <a
                href="https://nftartists.io"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  background: '#28a745',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#218838';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#28a745';
                }}
              >
                NFT artists
              </a>
              
              <a
                href="https://protocol.builders"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  background: '#6f42c1',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#5a3733';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#6f42c1';
                }}
              >
                protocol builders
              </a>
              
              <a
                href="https://memecoin-launchers.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  background: '#dc3545',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#c82333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#dc3545';
                }}
              >
                memecoin launchers
              </a>
              
              <a
                href="https://web3creators.io"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  background: '#17a2b8',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#138496';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#17a2b8';
                }}
              >
                Web3 creators
              </a>
            </div>

            <button
              onClick={() => setShowCreatePageModal(false)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                width: '100%'
              }}
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
