import { THEMES } from '../../themes'

interface ThemeSelectorProps {
  currentTheme: typeof THEMES[0]
  onThemeChange: (theme: typeof THEMES[0]) => void
  onClose: () => void
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  currentTheme, 
  onThemeChange, 
  onClose 
}) => {
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
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {THEMES.map((theme) => {
            const isCurrentTheme = currentTheme.id === theme.id
            
            return (
              <div
                key={theme.id}
                onClick={() => {
                  onThemeChange(theme)
                  onClose()
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
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onClose}
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
        </div>
      </div>
    </div>
  )
}
