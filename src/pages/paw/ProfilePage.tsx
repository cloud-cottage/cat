import { useEffect, useState, type CSSProperties } from 'react'
import { getThemeClassName, getThemeColors, type Theme } from '../../themes'
import { useUserProfile } from './hooks/useUserProfile'
import { api, type User } from './lib/api'
import { Icon } from './components/Icon'
import { QRCodeComponent } from './components/QRCode'
import { ThemeModal } from './components/ThemeModal'
import { SocialModule } from './components/SocialModule'
import { MostfindModule } from './components/MostfindModule'
import { ProfileModule } from './components/ProfileModule'
import { LinksModule } from './components/LinksModule'
import { AssetModule } from './components/AssetModule'
import { useLanguage } from '../../i18n/useLanguage'
import { Modal } from './components/Modal'
import { TwitterTimeline } from './components/TwitterTimeline'

interface ProfilePageProps {
  username?: string
}

type AutoSaveField =
  | 'twitterHandle'
  | 'linkedInHandle'
  | 'youtubeHandle'
  | 'instagramHandle'

type LayoutMode = 'mobile' | 'tablet' | 'desktop'
type ModuleType = 'profile' | 'social' | 'twitter' | 'links' | 'mostfind' | 'asset'

const getLayoutMode = (width: number): LayoutMode => {
  if (width < 768) {
    return 'mobile'
  }

  if (width < 1024) {
    return 'tablet'
  }

  return 'desktop'
}

const moduleIcons: Record<ModuleType, string> = {
  profile: 'ri-user-3-line',
  social: 'ri-at-line',
  twitter: 'ri-twitter-x-line',
  links: 'ri-links-line',
  mostfind: 'ri-compass-3-line',
  asset: 'ri-stack-line'
}

const getGridLayoutStyles = (layoutMode: LayoutMode): CSSProperties => {
  if (layoutMode === 'mobile') {
    return {
      gridTemplateColumns: '1fr',
      gridAutoRows: 'minmax(160px, auto)',
      gap: '1rem'
    }
  }

  if (layoutMode === 'tablet') {
    return {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gridAutoRows: 'minmax(180px, auto)',
      gap: '1rem'
    }
  }

  return {
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gridTemplateRows: 'repeat(9, 180px)',
    gap: '1rem',
    minHeight: '900px'
  }
}

const getModulePosition = (type: ModuleType, layoutMode: LayoutMode): CSSProperties => {
  if (layoutMode === 'mobile') {
    return {
      gridColumn: '1 / -1'
    }
  }

  if (layoutMode === 'tablet') {
    switch (type) {
      case 'profile':
        return { gridColumn: '1 / 2', gridRow: '1 / 3' }
      case 'mostfind':
        return { gridColumn: '2 / 3', gridRow: '1 / 2' }
      case 'social':
        return { gridColumn: '2 / 3', gridRow: '2 / 3' }
      case 'twitter':
        return { gridColumn: '1 / 2', gridRow: '3 / 4' }
      case 'links':
        return { gridColumn: '2 / 3', gridRow: '3 / 6' }
      case 'asset':
        return { gridColumn: '1 / 2', gridRow: '4 / 6' }
      default:
        return { gridColumn: '1 / -1' }
    }
  }

  switch (type) {
    case 'profile':
      return { gridColumn: '1 / 3', gridRow: '1 / 3' }
    case 'social':
      return { gridColumn: '1 / 3', gridRow: '3 / 4' }
    case 'twitter':
      return { gridColumn: '1 / 3', gridRow: '4 / 5' }
    case 'mostfind':
      return { gridColumn: '3 / 7', gridRow: '1 / 2' }
    case 'links':
      return { gridColumn: '3 / 7', gridRow: '2 / 10' }
    case 'asset':
      return { gridColumn: '1 / 3', gridRow: '5 / 10' }
    default:
      return { gridColumn: '1 / -1' }
  }
}

const ProfilePage: React.FC<ProfilePageProps> = ({ username: propUsername }) => {
  const { loading, user, links, currentTheme, setCurrentTheme, isOwner, refreshUser } = useUserProfile({ username: propUsername })
  const { t } = useLanguage()
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => getLayoutMode(typeof window === 'undefined' ? 1280 : window.innerWidth))
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
  
  // 自动保存函数
  const handleAutoSave = async (field: AutoSaveField, value: string) => {
    if (!user?.username) return;
    
    try {
      console.log(`自动保存 ${field}:`, value);
      
      const updateData: Pick<User, AutoSaveField> = {
        twitterHandle: user.twitterHandle || '',
        linkedInHandle: user.linkedInHandle || '',
        youtubeHandle: user.youtubeHandle || '',
        instagramHandle: user.instagramHandle || ''
      }
      updateData[field] = value
      
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
      const updateData: Partial<{
        nickname: string
        bio: string
      }> = {};
      
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
  const applyTheme = async (theme: Theme) => {
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
    const themeColors = getThemeColors(currentTheme, isDarkMode)
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(themeClass);
    
    // 应用主题CSS变量
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', themeColors.primary);
    root.style.setProperty('--theme-secondary', themeColors.secondary);
    root.style.setProperty('--theme-bg', themeColors.bg);
    root.style.setProperty('--theme-surface', themeColors.surface);
    
    // 计算RGB值用于透明度
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
        '0, 0, 0';
    };
    
    root.style.setProperty('--theme-primary-rgb', hexToRgb(themeColors.primary));
    
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
  }, [currentTheme, isDarkMode]);

  // 响应式设计
  useEffect(() => {
    const handleResize = () => {
      setLayoutMode(getLayoutMode(window.innerWidth))
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
  const themeColors = getCurrentThemeColors()
  const currentLanguageInfo = getCurrentLanguage()
  const actionButtonStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    minHeight: '44px',
    padding: layoutMode === 'mobile' ? '0.75rem 1rem' : '0.8rem 1.1rem',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
    color: '#ffffff',
    boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
    fontSize: '0.9rem',
    fontWeight: 600,
    backdropFilter: 'blur(14px)'
  }
  const utilityButtonStyle: CSSProperties = {
    ...actionButtonStyle,
    background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)',
    color: isDarkMode ? '#ffffff' : '#111827',
    boxShadow: 'none'
  }
  
  // 简单的模块数组
  const modules: Array<{ id: string; name: string; content: string; type: ModuleType }> = [
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
      type: 'links'
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
    <div id="paw-app" style={{
      padding: layoutMode === 'mobile' ? '1rem 0 5rem' : '2rem 0 6rem',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #2a1b33 0%, #362639 40%, #221724 100%)'
    }}>
      <div id="paw-container" className={`${themeClass}`} style={{
        width: '100%',
        maxWidth: '800px',      // DPR=2 时显示为 1600px
        minWidth: layoutMode === 'mobile' ? '0' : '320px',
        margin: '0 auto',
        minHeight: '100vh',
        background: themeColors.bg,
        color: isDarkMode ? '#ffffff' : '#000000',
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        flexGrow: 0,
        paddingTop: layoutMode === 'mobile' ? '1rem' : '1.5rem',
        paddingBottom: layoutMode === 'mobile' ? '1.25rem' : '2rem',
        borderRadius: layoutMode === 'mobile' ? '28px' : '40px',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: isDarkMode ? '0 30px 80px rgba(0,0,0,0.36)' : '0 30px 80px rgba(15,23,42,0.12)',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle at top right, rgba(var(--theme-primary-rgb), 0.24), transparent 35%), radial-gradient(circle at bottom left, rgba(var(--theme-primary-rgb), 0.18), transparent 38%)'
        }}
      />
      {/* 页眉容器 */}
      <div id="paw-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: layoutMode === 'mobile' ? 'stretch' : 'center',
        flexDirection: layoutMode === 'mobile' ? 'column' : 'row',
        gap: '1rem',
        padding: layoutMode === 'mobile' ? '0 1rem' : '0 2rem',
        marginBottom: '1.5rem',
        zIndex: 1000,
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <button
            onClick={() => setShowCatPawModal(true)}
            title={t('clickToViewMore')}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '22px',
              border: '1px solid rgba(255,255,255,0.14)',
              background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.72)',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 24px rgba(0,0,0,0.14)',
              backdropFilter: 'blur(14px)'
            }}
          >
            <Icon name="paw" size={32} />
          </button>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--theme-primary)'
            }}>
              CAT PROFILE
            </span>
            <div style={{
              fontSize: layoutMode === 'mobile' ? '1rem' : '1.1rem',
              fontWeight: 700
            }}>
              你的链上身份聚合器
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: isDarkMode ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.68)'
            }}>
              整合社交身份、链接入口和公开链上足迹
            </div>
          </div>
        </div>

        {isOwner && (
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            justifyContent: layoutMode === 'mobile' ? 'flex-start' : 'flex-end'
          }}>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              style={{
                ...utilityButtonStyle,
                width: '44px',
                minWidth: '44px',
                padding: 0
              }}
              title={isDarkMode ? '切换到日间模式' : '切换到夜间模式'}
            >
              {isDarkMode ? <i className="ri-moon-line"></i> : <i className="ri-sun-line"></i>}
            </button>

            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              style={actionButtonStyle}
            >
              <i className="ri-palette-line"></i>
              主题
            </button>

            <button
              onClick={toggleLanguage}
              style={utilityButtonStyle}
              title={`当前语言: ${currentLanguageInfo.name} (点击切换)`}
            >
              <i className={currentLanguageInfo.icon}></i>
              {currentLanguageInfo.name}
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              style={utilityButtonStyle}
              title={t('share')}
            >
              <i className="ri-share-box-line"></i>
              分享
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
        padding: layoutMode === 'mobile' ? '0 1rem' : '0 2rem',
        width: '100%',  // 确保占满容器宽度
        boxSizing: 'border-box',  // 包含padding在宽度内
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div className={`grid-container ${themeClass}`} style={{
            display: 'grid',
            width: '100%',  // 确保网格容器占满可用宽度
            boxSizing: 'border-box',  // 包含padding在宽度内
            ...getGridLayoutStyles(layoutMode)
          }}>
                    {modules.map((module, index) => {
            const position = getModulePosition(module.type, layoutMode);

            return (
              <div
                key={`simple-${module.id}-${index}`}
                className="module"
                style={{
                  ...position,
                  background: `linear-gradient(180deg, rgba(255,255,255,${isDarkMode ? 0.1 : 0.78}) 0%, rgba(var(--theme-primary-rgb), ${isDarkMode ? 0.14 : 0.1}) 100%)`,
                  padding: layoutMode === 'mobile' ? '1rem' : '1.2rem',
                  borderRadius: layoutMode === 'mobile' ? '24px' : '28px',
                  position: 'relative',
                  overflow: 'hidden',
                  border: `1px solid rgba(${isDarkMode ? '255,255,255' : '15,23,42'}, ${isDarkMode ? 0.1 : 0.08})`,
                  boxShadow: isDarkMode ? '0 18px 40px rgba(0,0,0,0.24)' : '0 18px 40px rgba(15,23,42,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.9rem'
                }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: 'radial-gradient(circle at top right, rgba(255,255,255,0.16), transparent 35%)'
                }} />
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.9rem',
                  height: '100%'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'var(--theme-primary)'
                      }}>
                        <i className={moduleIcons[module.type]}></i>
                        <span>{module.name}</span>
                      </div>
                      <p style={{
                        margin: 0,
                        fontSize: '0.88rem',
                        color: isDarkMode ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.62)'
                      }}>
                        {module.content}
                      </p>
                    </div>
                  </div>
                
                {module.type === 'profile' && (
                  <div 
                    style={{ 
                      position: 'relative',
                      height: '100%'
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
                    
                    <ProfileModule 
                      user={user!}
                      isOwner={isOwner}
                      onAvatarClick={openProfileModal}
                    />
                  </div>
                )}
                
                {module.type === 'social' && (
                  <div style={{ height: '100%' }}>
                    <SocialModule
                      user={user}
                      isOwner={isOwner}
                      handleAutoSave={handleAutoSave}
                    />
                  </div>
                )}
                
                {module.type === 'links' && (
                  <div 
                    style={{ 
                      position: 'relative',
                      height: '100%'
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
                    
                    <LinksModule 
                      links={links}
                    />
                  </div>
                )}
                
                {module.type === 'mostfind' && (
                  <MostfindModule 
                    user={user}
                    isOwner={isOwner}
                    isMostfindEditing={isMostfindEditing}
                    setIsMostfindEditing={setIsMostfindEditing}
                  />
                )}
                
                {module.type === 'asset' && (
                  <AssetModule 
                    isOwner={isOwner}
                    isAssetEditing={isAssetEditing}
                    setIsAssetEditing={setIsAssetEditing}
                  />
                )}
                
                {module.type === 'twitter' && (
                  <div 
                    style={{ 
                      position: 'relative',
                      height: '100%'
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
                    
                    {user?.twitterHandle ? (
                      <div style={{ 
                        marginTop: '0.25rem',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        height: '100%'
                      }}>
                        <TwitterTimeline twitterHandle={user.twitterHandle} />
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        borderRadius: '18px',
                        border: '1px dashed rgba(var(--theme-primary-rgb), 0.35)',
                        background: 'rgba(var(--theme-primary-rgb), 0.08)',
                        color: isDarkMode ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.62)',
                        textAlign: 'center',
                        padding: '1rem'
                      }}>
                        连接 X 账号后，这里会展示最近动态。
                      </div>
                    )}
                  </div>
                )}
                </div>
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
              onThemeChange={(theme: Theme) => setCurrentTheme(theme)}
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
      <div id="paw-floating-tools"
        style={{
          position: 'fixed',
          bottom: layoutMode === 'mobile' ? '12px' : '20px',
          right: layoutMode === 'mobile' ? '12px' : '20px',
          zIndex: 1000,
          display: layoutMode === 'mobile' ? 'none' : 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'flex-end'
        }}
      >
        {/* 创建页面按钮 */}
        <button
          onClick={() => setShowCreatePageModal(true)}
          style={{
            ...actionButtonStyle,
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

export default ProfilePage
