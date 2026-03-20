import { useEffect, useState } from 'react'
import { getThemeClassName } from '../../themes'
import { useUserProfile } from './hooks/useUserProfile'
import { getThemeColors } from '../../themes'
import { api, getUserAvatarUrl } from './lib/api'
import { Icon } from './components/Icon'
import { QRCodeComponent } from './components/QRCode'
import { ThemeModal } from './components/ThemeModal'
import { SocialModule } from './components/SocialModule'
import { useLanguage } from '../../i18n/useLanguage'
import { Modal } from './components/Modal'
import { TwitterTimeline } from './components/TwitterTimeline'

interface Web3ProfileProps {
  username?: string
}

export const Web3ProfileSimple: React.FC<Web3ProfileProps> = ({ username: propUsername }) => {
  const { loading, user, links, currentTheme, setCurrentTheme, isOwner, refreshUser } = useUserProfile({ username: propUsername })
  const { t } = useLanguage()
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState('zh-CN') // 默认简体中文
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showLinksModal, setShowLinksModal] = useState(false)
  const [profileForm, setProfileForm] = useState({
    username: '',
    nickname: '',
    bio: ''
  })
  const [linksForm, setLinksForm] = useState({
    links: [] as Array<{ id: string; label: string; url: string }>
  })
  const [isDarkMode, setIsDarkMode] = useState(true) // 默认深色模式
  const [copySuccess, setCopySuccess] = useState(false)
  const [applyingTheme, setApplyingTheme] = useState(false)
  const [showCatPawModal, setShowCatPawModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showExploreModal, setShowExploreModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showCreatePageModal, setShowCreatePageModal] = useState(false)
  
  // 各模块独立的编辑状态
  const [isMostfindEditing, setIsMostfindEditing] = useState(false)
  const [isAssetEditing, setIsAssetEditing] = useState(false)
  const [isTwitterEditing, setIsTwitterEditing] = useState(false)
  
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
  }

  // 自动保存函数
  const handleAutoSave = async (field: string, value: string) => {
    if (!user?.username) return;
    
    try {
      console.log(`自动保存 ${field}:`, value);
      
      const updateData: any = {};
      updateData[field] = value;
      
      await api.updateUser(user.username, updateData);
      console.log(`自动保存 ${field} 成功`);
    } catch (error) {
      console.error(`自动保存 ${field} 失败:`, error);
    }
  };

  // 获取当前主题颜色
  const getCurrentThemeColors = () => {
    if (!currentTheme) return { primary: '#FF6B35', secondary: '#00D9FF', bg: '#0A0E27', surface: '#1A1F3A' };
    return getThemeColors(currentTheme, isDarkMode);
  };

  // 语言配置
  const languages = [
    { code: 'zh-CN', name: '简体中文', icon: 'ri-translate-2' },
    { code: 'zh-TW', name: '繁体中文', icon: 'ri-translate' },
    { code: 'vi', name: '越南语', icon: 'ri-global-line' },
    { code: 'en', name: 'English', icon: 'ri-english-input' }
  ];

  // 切换语言
  const toggleLanguage = () => {
    const currentIndex = languages.findIndex(lang => lang.code === currentLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    setCurrentLanguage(languages[nextIndex].code);
  };

  // 获取当前语言信息
  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  };

  // 打开 Profile 编辑模态框
  const openProfileModal = () => {
    setProfileForm({
      username: user?.username || '',
      nickname: user?.nickname || '',
      bio: user?.bio || ''
    });
    setShowProfileModal(true);
  };

  // 保存 Profile 更改
  const saveProfileChanges = async () => {
    try {
      const updateData: any = {};
      
      if (profileForm.nickname !== user?.nickname) {
        updateData.nickname = profileForm.nickname;
      }
      
      if (profileForm.bio !== user?.bio) {
        updateData.bio = profileForm.bio;
      }
      
      if (Object.keys(updateData).length > 0) {
        await api.updateUser(user?.username || '', updateData);
        console.log('Profile 更新成功');
        // 刷新用户数据
        await refreshUser();
      }
      
      setShowProfileModal(false);
    } catch (error) {
      console.error('Profile 更新失败:', error);
    }
  };

  // 打开 Links 编辑模态框
  const openLinksModal = () => {
    setLinksForm({
      links: links.map(link => ({
        id: link.id || '',
        label: link.label || '',
        url: link.url || ''
      }))
    });
    setShowLinksModal(true);
  };

  // 保存 Links 更改
  const saveLinksChanges = async () => {
    try {
      // 转换为 Link 类型，添加缺失的属性
      const formattedLinks = linksForm.links.map(link => ({
        id: link.id,
        userId: user?.id || '',
        label: link.label,
        url: link.url,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      // 使用 updateLinks 方法更新所有链接
      await api.updateLinks(user?.username || '', formattedLinks);
      
      console.log('Links 更新成功');
      // 刷新用户数据
      await refreshUser();
      setShowLinksModal(false);
    } catch (error) {
      console.error('Links 更新失败:', error);
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

  // 同步编辑表单数据
  useEffect(() => {
    if (user) {
      // Profile 数据现在在模态框中处理
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
      <div id="paw-body" style={{ 
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
      <div id="paw-body" style={{ 
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
      id: 'twitter', 
      name: '推特动态', 
      content: user?.twitterHandle ? `@${user.twitterHandle}` : '未设置',
      type: 'twitter'
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
      name: '我经常在这里', 
      content: '活跃平台',
      type: 'mostfind'
    },
    { 
      id: 'asset', 
      name: '公开资产', 
      content: '数字资产',
      type: 'asset'
    }
  ];
  
  return (
    <div id="root" style={{
      paddingTop: '40px',     // DPR=2 时显示为 80px
      backgroundColor: '#362639'
    }}>
      <div id="paw-container" className={`${themeClass}`} style={{
        width: '100%',
        maxWidth: '800px',      // DPR=2 时显示为 1600px
        minWidth: '400px',      // DPR=2 时显示为 800px
        margin: '0 auto',
        minHeight: '100vh',
        background: getCurrentThemeColors().bg,
        color: isDarkMode ? '#ffffff' : '#000000',
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        flexGrow: 0,
        paddingTop: '40px',     // DPR=2 时显示为 80px
        borderRadius: '40px'     // DPR=2 时显示为 80px
      }}
      onMouseEnter={(e) => {
        // 显示主题切换按钮
        const themeToggle = e.currentTarget.querySelector('.theme-toggle') as HTMLElement;
        if (themeToggle) {
          themeToggle.style.opacity = '1';
          themeToggle.style.pointerEvents = 'auto';
        }
      }}
      onMouseLeave={(e) => {
        // 隐藏主题切换按钮
        const themeToggle = e.currentTarget.querySelector('.theme-toggle') as HTMLElement;
        if (themeToggle) {
          themeToggle.style.opacity = '0';
          themeToggle.style.pointerEvents = 'none';
        }
      }}
    >
      {/* 主题切换按钮 - 悬停时显示 */}
      <div
        className="theme-toggle"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '40px',
          height: '40px',
          background: getCurrentThemeColors().primary,
          color: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '16px',
          opacity: '0',
          pointerEvents: 'none',
          transition: 'all 0.2s ease',
          zIndex: 1000,
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}
        onClick={() => setShowThemeSelector(!showThemeSelector)}
        title="切换主题"
      >
        <i className="ri-edit-line"></i>
      </div>
      {/* 页眉容器 */}
      <div id="paw-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 2rem',
        marginBottom: '2rem',
        zIndex: 1000
      }}>
        {/* 左侧：猫爪按钮 */}
        <button
          className="cat-paw-btn cat-btn"
          onClick={() => setShowCatPawModal(true)}
          title={t('clickToViewMore')}
        >
          <Icon name="paw" size={40} />
        </button>

        {/* 右侧：编辑模式按钮组 */}
        {isOwner && (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            {/* 主题切换按钮 */}
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
              {isDarkMode ? <i className="ri-moon-line"></i> : <i className="ri-sun-line"></i>}
            </button>
            
            {/* 主题选择按钮 */}
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
            
            {/* 语言切换按钮 */}
            <button
              className="cat-btn"
              onClick={toggleLanguage}
              style={{
                padding: '0.75rem 1rem',
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
              title={`当前语言: ${getCurrentLanguage().name} (点击切换)`}
            >
              <i className={getCurrentLanguage().icon} style={{ fontSize: '16px', marginRight: '0.5rem' }}></i>
            </button>
            
            {/* 分享按钮 */}
            <button
              className="cat-btn"
              onClick={() => setShowShareModal(true)}
              title={t('share')}
            >
              <i className="ri-share-box-fill" style={{ fontSize: '24px' }}></i>
            </button>
          </div>
        )}
      </div>

      
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

      {/* 主体内容 */}
      <div id="paw-body" style={{
        flex: 1,
        padding: '0 2rem',
        width: '100%',  // 确保占满容器宽度
        boxSizing: 'border-box'  // 包含padding在宽度内
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div className={`grid-container ${themeClass}`} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gridTemplateRows: 'repeat(9, 280px)',
            gap: '1rem',
            minHeight: '900px',
            width: '100%',  // 确保网格容器占满可用宽度
            boxSizing: 'border-box'  // 包含padding在宽度内
          }}>
                    {modules.map((module, index) => {
            // 根据 default 主题的网格布局设置网格位置
            const getPosition = (type: string) => {
              // 将现有板块映射到 default 主题的网格位置（填满6列网格）
              switch (type) {
                case 'profile':
                  return { 
                    gridColumn: '1 / 3',  // 从第1列到第3列（占2列）
                    gridRow: '1 / 3'      // 从第1行到第3行（占2行）
                  };  
                case 'social':
                  return { 
                    gridColumn: '1 / 3',  // 从第1列到第3列（占2列）
                    gridRow: '3 / 4'      // 从第3行到第4行（占1行）
                  };  
                case 'twitter':
                  return { 
                    gridColumn: '1 / 3',  // 从第1列到第3列（占2列）
                    gridRow: '4 / 5'      // 从第4行到第5行（占1行）
                  };  
                case 'mostfind':
                  return { 
                    gridColumn: '3 / 7',  // 从第3列到第7列（占4列）
                    gridRow: '1 / 2'      // 从第1行到第2行（占1行）
                  };  
                case 'links':
                  return { 
                    gridColumn: '3 / 7',  // 从第3列到第7列（占4列）
                    gridRow: '2 / 10'     // 从第2行到第10行（占8行）
                  };  
                case 'asset':
                  return { 
                    gridColumn: '1 / 3',  // 从第1列到第3列（占2列）
                    gridRow: '5 / 10'     // 从第5行到第10行（占5行）
                  };  
                default:
                  return { 
                    gridColumn: '1 / 7',  // 从第1列到第7列（占全宽）
                    gridRow: '6 / 10'     // 从第6行到第10行（占4行）
                  };  
              }
            };

            const position = getPosition(module.type);

            return (
              <div
                key={`simple-${module.id}-${index}`}
                className="module"
                style={{
                  ...position,
                  background: 'rgba(255,255,255,0.1)',
                  padding: '1rem',
                  borderRadius: '8px',
                  position: 'relative'
                }}>
                <h3>{module.name}</h3>
                
                {module.type === 'profile' && (
                  <div 
                    style={{ 
                      textAlign: 'center',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      // 显示编辑符号
                      const editIcon = e.currentTarget.querySelector('.edit-icon') as HTMLElement;
                      if (editIcon) {
                        editIcon.style.opacity = '1';
                        editIcon.style.pointerEvents = 'auto';
                      }
                    }}
                    onMouseLeave={(e) => {
                      // 隐藏编辑符号
                      const editIcon = e.currentTarget.querySelector('.edit-icon') as HTMLElement;
                      if (editIcon) {
                        editIcon.style.opacity = '0';
                        editIcon.style.pointerEvents = 'none';
                      }
                    }}
                  >
                    {/* 编辑符号 - 悬停时显示 */}
                    <div
                      className="edit-icon"
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        background: 'var(--theme-primary)',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '12px',
                        opacity: '0',
                        pointerEvents: 'none',
                        transition: 'all 0.2s ease',
                        zIndex: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openProfileModal();
                      }}
                      title="编辑资料"
                    >
                      <i className="ri-edit-line"></i>
                    </div>
                    
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
                      <h2 style={{
                        margin: 0,
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        color: 'var(--theme-primary)',
                        marginBottom: '1rem',
                        paddingRight: '3rem' // 为关闭按钮留出空间
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
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '0.5rem',
                          marginTop: '0.5rem'
                        }}>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            opacity: 0.6 
                          }}>
                            {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                          </span>
                          <button
                            onClick={copyWalletAddress}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--theme-primary)',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              padding: '0.25rem',
                              borderRadius: '4px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--theme-primary)'
                              e.currentTarget.style.color = 'white'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                              e.currentTarget.style.color = 'var(--theme-primary)'
                            }}
                            title="复制钱包地址"
                          >
                            {copySuccess ? '✓' : '📋'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {module.type === 'social' && (
                  <SocialModule
                    user={user}
                    isOwner={isOwner}
                    handleAutoSave={handleAutoSave}
                  />
                )}
                
                {module.type === 'links' && (
                  <>
                    {/* 编辑符号 */}
                    <div
                      className="edit-icon"
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        background: 'var(--theme-primary)',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '12px',
                        opacity: '0',
                        pointerEvents: 'none',
                        transition: 'all 0.2s ease',
                        zIndex: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openLinksModal();
                      }}
                      title="编辑链接"
                    >
                      <i className="ri-edit-line"></i>
                    </div>
                    
                    {/* 链接列表 */}
                    {links.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '2rem 1rem',
                        fontSize: '0.875rem',
                        color: 'rgba(var(--theme-primary-rgb), 0.6)',
                        background: 'var(--theme-surface)',
                        borderRadius: '12px',
                        border: '1px solid rgba(var(--theme-primary-rgb), 0.1)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>🔗</div>
                        <div>暂无链接</div>
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}>
                        {links.map((link) => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '1rem',
                              padding: '1rem',
                              borderRadius: '12px',
                              background: 'var(--theme-surface)',
                              border: '1px solid rgba(var(--theme-primary-rgb), 0.1)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              transition: 'all 0.3s ease',
                              position: 'relative',
                              overflow: 'hidden',
                              textDecoration: 'none',
                              color: 'inherit'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                            }}
                          >
                            {/* 左侧图标容器 */}
                            <div style={{
                              position: 'relative',
                              width: '3rem',
                              height: '3.6rem',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.75rem',
                              background: 'linear-gradient(135deg, rgba(var(--theme-primary-rgb), 0.1) 0%, rgba(var(--theme-primary-rgb), 0.05) 100%)',
                              borderRadius: '10px',
                              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.05)',
                              border: '1px solid rgba(var(--theme-primary-rgb), 0.15)'
                            }}>
                              {link.icon || '🔗'}
                            </div>
                            
                            {/* 右侧内容区域 */}
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.375rem',
                              flex: 1,
                              minWidth: 0,
                              paddingTop: '0.25rem'
                            }}>
                              {/* 第一行：label */}
                              <div style={{
                                fontSize: '1.0625rem',
                                fontWeight: '600',
                                color: 'var(--theme-primary)',
                                lineHeight: '1.3',
                                letterSpacing: '-0.01em'
                              }}>
                                {link.label}
                              </div>
                              
                              {/* 第二行：url */}
                              <div style={{
                                fontSize: '0.8125rem',
                                color: 'rgba(var(--theme-primary-rgb), 0.8)',
                                lineHeight: '1.3',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <i className="ri-link" style={{ fontSize: '0.75rem', opacity: 0.6 }}></i>
                                {link.url}
                              </div>
                              
                              {/* 第三行：description */}
                              {link.description && (
                                <div style={{
                                  fontSize: '0.8125rem',
                                  color: 'rgba(var(--theme-primary-rgb), 0.65)',
                                  lineHeight: '1.3',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  fontStyle: 'italic'
                                }}>
                                  {link.description}
                                </div>
                              )}
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </>
                )}
                
                {module.type === 'mostfind' && (
                  <>
                    {/* 编辑符号 */}
                    <div
                      className="edit-icon"
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        background: 'var(--theme-primary)',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '12px',
                        opacity: '0',
                        pointerEvents: 'none',
                        transition: 'all 0.2s ease',
                        zIndex: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMostfindEditing(!isMostfindEditing);
                      }}
                      title={isMostfindEditing ? "关闭编辑" : "编辑活跃平台"}
                    >
                      {isMostfindEditing ? <i className="ri-close-circle-line"></i> : <i className="ri-edit-line"></i>}
                    </div>
                    
                    {/* Twitter 链接卡片 */}
                    <a
                      href={`https://twitter.com/${user?.twitterHandle || user?.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        padding: '1rem',
                        borderRadius: '12px',
                        background: 'var(--theme-surface)',
                        border: '1px solid rgba(var(--theme-primary-rgb), 0.1)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        textDecoration: 'none',
                        color: 'inherit'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}
                    >
                      {/* 左侧图标容器 */}
                      <div style={{
                        position: 'relative',
                        width: '3rem',
                        height: '3.6rem',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.75rem',
                        background: 'linear-gradient(135deg, rgba(var(--theme-primary-rgb), 0.1) 0%, rgba(var(--theme-primary-rgb), 0.05) 100%)',
                        borderRadius: '10px',
                        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(var(--theme-primary-rgb), 0.15)'
                      }}>
                        <i className="ri-twitter-x-line" style={{ fontSize: '1.75rem' }}></i>
                      </div>
                      
                      {/* 右侧内容区域 */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.375rem',
                        flex: 1,
                        minWidth: 0,
                        paddingTop: '0.25rem'
                      }}>
                        {/* 第一行：label */}
                        <div style={{
                          fontSize: '1.0625rem',
                          fontWeight: '600',
                          color: 'var(--theme-primary)',
                          lineHeight: '1.3',
                          letterSpacing: '-0.01em'
                        }}>
                          当前活跃：推特 / Twitter
                        </div>
                        
                        {/* 第二行：url */}
                        <div style={{
                          fontSize: '0.8125rem',
                          color: 'rgba(var(--theme-primary-rgb), 0.8)',
                          lineHeight: '1.3',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <i className="ri-link" style={{ fontSize: '0.75rem', opacity: 0.6 }}></i>
                          @0xCatKing
                        </div>
                        
                        {/* 第三行：description */}
                        <div style={{
                          fontSize: '0.8125rem',
                          color: 'rgba(var(--theme-primary-rgb), 0.65)',
                          lineHeight: '1.3',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontStyle: 'italic'
                        }}>
                          在推特上关注我，获取最新动态
                        </div>
                      </div>
                    </a>
                  </>
                )}
                
                {module.type === 'asset' && (
                  <div 
                    style={{ 
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      // 显示编辑符号
                      const editIcon = e.currentTarget.querySelector('.edit-icon') as HTMLElement;
                      if (editIcon) {
                        editIcon.style.opacity = '1';
                        editIcon.style.pointerEvents = 'auto';
                      }
                    }}
                    onMouseLeave={(e) => {
                      // 隐藏编辑符号
                      const editIcon = e.currentTarget.querySelector('.edit-icon') as HTMLElement;
                      if (editIcon) {
                        editIcon.style.opacity = '0';
                        editIcon.style.pointerEvents = 'none';
                      }
                    }}
                  >
                    {/* 编辑符号 - 悬停时显示 */}
                    <div
                      className="edit-icon"
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        background: 'var(--theme-primary)',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '12px',
                        opacity: '0',
                        pointerEvents: 'none',
                        transition: 'all 0.2s ease',
                        zIndex: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAssetEditing) {
                          // 关闭编辑模式
                          setIsAssetEditing(false);
                        } else {
                          // 进入编辑模式
                          setIsAssetEditing(true);
                        }
                      }}
                      title={isAssetEditing ? "关闭编辑" : "编辑数字资产"}
                    >
                      {isAssetEditing ? <i className="ri-close-circle-line"></i> : <i className="ri-edit-line"></i>}
                    </div>
                    
                    <p>{module.content}</p>
                    <div style={{ 
                      marginTop: '0.5rem', 
                      fontSize: '0.875rem', 
                      opacity: isAssetEditing ? 1 : 0.8 
                    }}>
                      <div>• NFT 收藏</div>
                      <div>• 代币资产</div>
                      <div>• DeFi 仓位</div>
                      <div>• 链上身份</div>
                    </div>
                    <div style={{ 
                      marginTop: '1rem', 
                      textAlign: 'center'
                    }}>
                      <button
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'var(--theme-primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        查看详情
                      </button>
                    </div>
                  </div>
                )}
                
                {module.type === 'twitter' && (
                  <div 
                    style={{ 
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      // 显示编辑符号
                      const editIcon = e.currentTarget.querySelector('.edit-icon') as HTMLElement;
                      if (editIcon) {
                        editIcon.style.opacity = '1';
                        editIcon.style.pointerEvents = 'auto';
                      }
                    }}
                    onMouseLeave={(e) => {
                      // 隐藏编辑符号
                      const editIcon = e.currentTarget.querySelector('.edit-icon') as HTMLElement;
                      if (editIcon) {
                        editIcon.style.opacity = '0';
                        editIcon.style.pointerEvents = 'none';
                      }
                    }}
                  >
                    {/* 编辑符号 - 悬停时显示 */}
                    <div
                      className="edit-icon"
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        background: 'var(--theme-primary)',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '12px',
                        opacity: '0',
                        pointerEvents: 'none',
                        transition: 'all 0.2s ease',
                        zIndex: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isTwitterEditing) {
                          // 关闭编辑模式
                          setIsTwitterEditing(false);
                        } else {
                          // 进入编辑模式
                          setIsTwitterEditing(true);
                        }
                      }}
                      title={isTwitterEditing ? "关闭编辑" : "编辑推特动态"}
                    >
                      {isTwitterEditing ? <i className="ri-close-circle-line"></i> : <i className="ri-edit-line"></i>}
                    </div>
                    
                    <p>{module.content}</p>
                    
                    {/* 如果用户设置了 Twitter Handle，显示 Twitter 时间线 */}
                    {user?.twitterHandle && (
                      <div style={{ 
                        marginTop: '1rem',
                        maxWidth: '100%',
                        overflow: 'hidden'
                      }}>
                        <TwitterTimeline twitterHandle={user.twitterHandle} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            )}
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <div id="paw-footer" style={{
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(0,0,0,0.1)',
        marginTop: '2rem'
      }}>
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
              onThemeChange={(theme: any) => setCurrentTheme(theme)}
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

      {/* 二维码显示 - 右下角页脚 */}
      <div id="paw-footer"
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

      {/* Profile 编辑模态框 */}
      <Modal
  show={showProfileModal}
  onClose={() => setShowProfileModal(false)}
  title="编辑个人资料"
>
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem'
  }}>
    <div>
      <label style={{ 
        display: 'block', 
        marginBottom: '0.4rem',
        color: 'var(--theme-primary)',
        fontWeight: '500',
        fontSize: '0.9rem'
      }}>
        用户名
      </label>
      <input
        type="text"
        value={profileForm.username}
        disabled
        style={{
          width: '100%',
          padding: '0.6rem',
          border: '1px solid #ccc',
          borderRadius: '6px',
          background: '#f5f5f5',
          color: '#666',
          fontSize: '0.9rem',
          cursor: 'not-allowed'
        }}
      />
      <small style={{ 
        color: '#666', 
        fontSize: '0.75rem',
        marginTop: '0.2rem',
        display: 'block'
      }}>
        用户名一旦设定无法修改
      </small>
    </div>

    <div>
      <label style={{ 
        display: 'block', 
        marginBottom: '0.4rem',
        color: 'var(--theme-primary)',
        fontWeight: '500',
        fontSize: '0.9rem'
      }}>
        昵称
      </label>
      <input
        type="text"
        value={profileForm.nickname}
        onChange={(e) => setProfileForm({...profileForm, nickname: e.target.value})}
        placeholder="输入昵称"
        style={{
          width: '100%',
          padding: '0.6rem',
          border: '1px solid var(--theme-primary)',
          borderRadius: '6px',
          background: 'var(--theme-surface)',
          color: 'var(--theme-primary)',
          fontSize: '0.9rem'
        }}
      />
    </div>

    <div>
      <label style={{ 
        display: 'block', 
        marginBottom: '0.4rem',
        color: 'var(--theme-primary)',
        fontWeight: '500',
        fontSize: '0.9rem'
      }}>
        简介
      </label>
      <textarea
        value={profileForm.bio}
        onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
        placeholder="输入个人简介"
        rows={4}
        style={{
          width: '100%',
          padding: '0.6rem',
          border: '1px solid var(--theme-primary)',
          borderRadius: '6px',
          background: 'var(--theme-surface)',
          color: 'var(--theme-primary)',
          fontSize: '0.9rem',
          resize: 'vertical',
          minHeight: '80px'
        }}
      />
    </div>
  </div>

  <div style={{
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.8rem',
    marginTop: '1rem'
  }}>
    <button
      onClick={() => setShowProfileModal(false)}
      style={{
        padding: '0.6rem 1.2rem',
        background: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem'
      }}
    >
      取消
    </button>
    <button
      onClick={saveProfileChanges}
      style={{
        padding: '0.6rem 1.2rem',
        background: 'var(--theme-primary)',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem'
      }}
    >
      <i className="ri-save-line" style={{ marginRight: '0.4rem', fontSize: '0.9rem' }}></i>
      保存更改
    </button>
  </div>
</Modal>

      {/* Links 编辑模态框 */}
      <Modal
        show={showLinksModal}
        onClose={() => setShowLinksModal(false)}
        title="编辑链接"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.4rem',
              color: 'var(--theme-primary)',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>
              链接列表
            </label>
            <div style={{ 
              maxHeight: '300px', 
              overflowY: 'auto',
              border: '1px solid var(--theme-primary)',
              borderRadius: '6px',
              background: 'var(--theme-surface)',
              padding: '0.5rem'
            }}>
              {linksForm.links.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#666', 
                  padding: '2rem',
                  fontSize: '0.9rem'
                }}>
                  暂无链接，请添加链接
                </div>
              ) : (
                linksForm.links.map((link, index) => (
                  <div key={link.id || index} style={{ 
                    marginBottom: '0.5rem',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: '#f9f9f9'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => {
                          const newLinks = [...linksForm.links];
                          newLinks[index].label = e.target.value;
                          setLinksForm({ links: newLinks });
                        }}
                        placeholder="链接标题"
                        style={{
                          flex: 1,
                          padding: '0.4rem',
                          border: '1px solid var(--theme-primary)',
                          borderRadius: '4px',
                          background: 'var(--theme-surface)',
                          color: 'var(--theme-primary)',
                          fontSize: '0.9rem',
                          marginRight: '0.5rem'
                        }}
                      />
                      <button
                        onClick={() => {
                          const newLinks = linksForm.links.filter((_, i) => i !== index);
                          setLinksForm({ links: newLinks });
                        }}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        删除
                      </button>
                    </div>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => {
                        const newLinks = [...linksForm.links];
                        newLinks[index].url = e.target.value;
                        setLinksForm({ links: newLinks });
                      }}
                      placeholder="链接地址 (https://...)"
                      style={{
                        width: '100%',
                        padding: '0.4rem',
                        border: '1px solid var(--theme-primary)',
                        borderRadius: '4px',
                        background: 'var(--theme-surface)',
                        color: 'var(--theme-primary)',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <button
              onClick={() => {
                const newLinks = [...linksForm.links, { id: Date.now().toString(), label: '', url: '' }];
                setLinksForm({ links: newLinks });
              }}
              style={{
                padding: '0.6rem 1.2rem',
                background: 'var(--theme-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              <i className="ri-add-line" style={{ marginRight: '0.4rem', fontSize: '0.9rem' }}></i>
              添加链接
            </button>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.8rem',
          marginTop: '1rem'
        }}>
          <button
            onClick={() => setShowLinksModal(false)}
            style={{
              padding: '0.6rem 1.2rem',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            取消
          </button>
          <button
            onClick={saveLinksChanges}
            style={{
              padding: '0.6rem 1.2rem',
              background: 'var(--theme-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            <i className="ri-save-line" style={{ marginRight: '0.4rem', fontSize: '0.9rem' }}></i>
            保存更改
          </button>
        </div>
      </Modal>
      </div>
    </div>
  </div>
)
}
