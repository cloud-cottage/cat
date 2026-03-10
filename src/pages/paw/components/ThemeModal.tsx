import { THEMES, type Theme } from '../../../themes'
import { useState } from 'react'

interface ThemeModalProps {
  currentTheme: typeof THEMES[0]
  onThemeChange: (theme: typeof THEMES[0]) => void
  onClose: () => void
  onApplyTheme: (theme: Theme) => void
  applyingTheme: boolean
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ 
  currentTheme, 
  onThemeChange, 
  onClose,
  onApplyTheme,
  applyingTheme
}) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme)

  const handleThemeSelect = (theme: typeof THEMES[0]) => {
    setSelectedTheme(theme)
    onThemeChange(theme)
  }

  const handleApplyTheme = () => {
    if (selectedTheme) {
      onApplyTheme(selectedTheme)
    }
  }

  return (
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
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--theme-surface)',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        border: '1px solid rgba(var(--theme-primary-rgb), 0.2)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* 标题 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            margin: 0,
            color: 'var(--theme-primary)',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            🎨 选择主题
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--theme-primary)',
              padding: '0.5rem',
              borderRadius: '50%',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(var(--theme-primary-rgb), 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            ×
          </button>
        </div>

        {/* 主题九宫格 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {THEMES.map((theme: typeof THEMES[0]) => (
            <div
              key={theme.id}
              onClick={() => handleThemeSelect(theme)}
              style={{
                padding: '1rem',
                border: selectedTheme.id === theme.id ? '3px solid var(--theme-primary)' : '2px solid #ddd',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: selectedTheme.id === theme.id ? 'rgba(var(--theme-primary-rgb), 0.1)' : '#f8f9fa',
                boxShadow: selectedTheme.id === theme.id ? `0 4px 12px rgba(var(--theme-primary-rgb), 0.4)` : '0 2px 4px rgba(0,0,0,0.1)',
                transform: selectedTheme.id === theme.id ? 'scale(1.05)' : 'scale(1)',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                if (selectedTheme.id !== theme.id) {
                  e.currentTarget.style.background = 'rgba(var(--theme-primary-rgb), 0.6)'
                  e.currentTarget.style.transform = 'scale(1.02)'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedTheme.id !== theme.id) {
                  e.currentTarget.style.background = '#f8f9fa'
                  e.currentTarget.style.transform = 'scale(1)'
                }
              }}
            >
              {/* 主题预览 */}
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                margin: '0 auto 0.75rem',
                border: '2px solid rgba(0,0,0,0.1)'
              }} />
              
              {/* 主题名称 */}
              <div style={{ 
                fontSize: '0.9rem', 
                fontWeight: '600',
                color: selectedTheme.id === theme.id ? 'var(--theme-primary)' : '#333',
                marginBottom: '0.25rem'
              }}>
                {theme.name}
              </div>
              
              {/* 选中标识 */}
              {selectedTheme.id === theme.id && (
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: 'var(--theme-primary)', 
                  fontWeight: '700',
                  marginTop: '0.25rem'
                }}>
                  ✅ 已选择
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 操作按钮 */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          borderTop: '1px solid rgba(var(--theme-primary-rgb), 0.2)',
          paddingTop: '1.5rem'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.8rem 2rem',
              background: 'transparent',
              color: 'var(--theme-primary)',
              border: '1px solid var(--theme-primary)',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(var(--theme-primary-rgb), 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            取消
          </button>
          <button
            onClick={handleApplyTheme}
            disabled={!selectedTheme || applyingTheme}
            style={{
              padding: '0.8rem 2rem',
              background: selectedTheme && !applyingTheme ? 'var(--theme-primary)' : '#ccc',
              border: 'none',
              borderRadius: '25px',
              color: 'white',
              cursor: selectedTheme && !applyingTheme ? 'pointer' : 'not-allowed',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              opacity: applyingTheme ? 0.7 : 1
            }}
          >
            {applyingTheme ? '应用中...' : '应用主题'}
          </button>
        </div>
      </div>
    </div>
  )
}
