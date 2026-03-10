import { THEMES, type Theme } from '../../../themes'
import { useState } from 'react'

interface ThemeSelectorProps {
  currentTheme: typeof THEMES[0]
  onThemeChange: (theme: typeof THEMES[0]) => void
  onClose?: () => void
  onCustomThemeCreate?: (theme: any) => void
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange, onClose, onCustomThemeCreate }) => {

  const [showCustomCreator, setShowCustomCreator] = useState(false)
  const [customTheme, setCustomTheme] = useState({
    name: '',
    primary: '#FF6B35',
    secondary: '#00D9FF',
    bg: '#0A0E27',
    surface: '#1A1F3A'
  })

  const handleCreateCustomTheme = () => {
    if (!customTheme.name?.trim()) {
      alert('请输入主题名称')
      return
    }

    const newTheme: Theme = {
      id: Date.now(), // 临时ID
      name: customTheme.name,
      className: `theme-custom-${Date.now()}`,
      colors: {
        primary: customTheme.primary,
        secondary: customTheme.secondary,
        bg: customTheme.bg,
        surface: customTheme.surface
      }
    }

    onCustomThemeCreate?.(newTheme)
    setCustomTheme({
      name: '',
      primary: '#FF6B35',
      secondary: '#00D9FF',
      bg: '#0A0E27',
      surface: '#1A1F3A'
    })
    setShowCustomCreator(false)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--theme-surface)',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        border: '1px solid rgba(var(--theme-primary-rgb), 0.2)',
      }}>
        <h2 style={{ 
          color: 'var(--theme-primary)',
          margin: '0 0 1.5rem 0',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          🎨 选择主题
        </h2>
        
        {!showCustomCreator ? (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {THEMES.map((theme: typeof THEMES[0]) => {
                const isCurrentTheme = currentTheme.id === theme.id
                
                return (
                  <div
                    key={theme.id}
                    onClick={() => {
                      onThemeChange(theme)
                      onClose?.()
                    }}
                    style={{
                      padding: '1rem',
                      border: isCurrentTheme ? '3px solid var(--theme-primary)' : '2px solid #ddd',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: isCurrentTheme ? 'rgba(var(--theme-primary-rgb), 0.4)' : '#f8f9fa',
                      boxShadow: isCurrentTheme ? `0 4px 12px rgba(var(--theme-primary-rgb), 0.4)` : '0 2px 4px rgba(0,0,0,0.1)',
                      transform: isCurrentTheme ? 'scale(1.05)' : 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentTheme) {
                        e.currentTarget.style.background = 'rgba(var(--theme-primary-rgb), 0.6)'
                        e.currentTarget.style.transform = 'scale(1.02)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentTheme) {
                        e.currentTarget.style.background = '#f8f9fa'
                        e.currentTarget.style.transform = 'scale(1)'
                      }
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))`,
                        marginBottom: '0.5rem'
                      }}
                    />
                    <div style={{ fontSize: '0.8rem', color: '#333', fontWeight: '600' }}>
                      {theme.name}
                    </div>
                    {isCurrentTheme && (
                      <div style={{ 
                        fontSize: '0.7rem', 
                        color: 'var(--theme-primary)', 
                        fontWeight: '700',
                        marginTop: '0.25rem'
                      }}>
                        已选择
                      </div>
                    )}
                  </div>
                )
              })}
              
              {/* 自定义主题卡片 */}
              <div
                onClick={() => setShowCustomCreator(true)}
                style={{
                  padding: '1rem',
                  border: '2px dashed #ddd',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: '#f8f9fa',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '120px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(var(--theme-primary-rgb), 0.1)'
                  e.currentTarget.style.borderColor = 'var(--theme-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8f9fa'
                  e.currentTarget.style.borderColor = '#ddd'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  🎨
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: '600', textAlign: 'center' }}>
                  自定义主题
                </div>
                <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.25rem' }}>
                  创建你的专属主题
                </div>
              </div>
            </div>
          </>
        ) : (
          /* 自定义主题创建界面 */
          <div style={{
            background: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem'
          }}>
            <h3 style={{ 
              color: 'var(--theme-primary)',
              margin: '0 0 1rem 0',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              🎨 创建自定义主题
            </h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                  主题名称
                </label>
                <input
                  type="text"
                  value={customTheme.name}
                  onChange={(e) => setCustomTheme({...customTheme, name: e.target.value})}
                  placeholder="给你的主题起个名字"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    主色调
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={customTheme.primary}
                      onChange={(e) => setCustomTheme({...customTheme, primary: e.target.value})}
                      style={{
                        width: '50px',
                        height: '35px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    />
                    <input
                      type="text"
                      value={customTheme.primary}
                      onChange={(e) => setCustomTheme({...customTheme, primary: e.target.value})}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    次要色调
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={customTheme.secondary}
                      onChange={(e) => setCustomTheme({...customTheme, secondary: e.target.value})}
                      style={{
                        width: '50px',
                        height: '35px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    />
                    <input
                      type="text"
                      value={customTheme.secondary}
                      onChange={(e) => setCustomTheme({...customTheme, secondary: e.target.value})}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    背景色
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={customTheme.bg}
                      onChange={(e) => setCustomTheme({...customTheme, bg: e.target.value})}
                      style={{
                        width: '50px',
                        height: '35px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    />
                    <input
                      type="text"
                      value={customTheme.bg}
                      onChange={(e) => setCustomTheme({...customTheme, bg: e.target.value})}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    表面色
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={customTheme.surface}
                      onChange={(e) => setCustomTheme({...customTheme, surface: e.target.value})}
                      style={{
                        width: '50px',
                        height: '35px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    />
                    <input
                      type="text"
                      value={customTheme.surface}
                      onChange={(e) => setCustomTheme({...customTheme, surface: e.target.value})}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* 主题预览 */}
              <div style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: customTheme.bg
              }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  主题预览
                </div>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: customTheme.primary
                  }} />
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: customTheme.secondary
                  }} />
                  <div style={{
                    padding: '0.5rem 1rem',
                    background: customTheme.surface,
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: customTheme.primary
                  }}>
                    {customTheme.name || '预览文本'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div style={{ textAlign: 'center' }}>
          {showCustomCreator ? (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setShowCustomCreator(false)}
                style={{
                  padding: '0.8rem 2rem',
                  background: '#6c757d',
                  border: 'none',
                  borderRadius: '25px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                返回
              </button>
              <button
                onClick={handleCreateCustomTheme}
                style={{
                  padding: '0.8rem 2rem',
                  background: 'var(--theme-primary)',
                  border: 'none',
                  borderRadius: '25px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                创建主题
              </button>
            </div>
          ) : (
            <button
              onClick={() => onClose?.()}
              style={{
                padding: '0.8rem 2rem',
                background: '#6c757d',
                border: 'none',
                borderRadius: '25px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
               取消
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
