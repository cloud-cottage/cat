interface ExploreModalProps {
  show: boolean
  onClose: () => void
  currentTheme: { id: number }
}

export const ExploreModal: React.FC<ExploreModalProps> = ({ show, onClose, currentTheme }) => {
  if (!show) return null

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
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        border: '1px solid rgba(var(--theme-primary-rgb), 0.2)',
      }}>
        <h2 style={{ 
          color: 'var(--theme-primary)',
          margin: '0 0 1rem 0',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          🌟 探索社区
        </h2>
        <p style={{ 
          color: currentTheme.id === 4 ? 'rgba(255,255,255,0.9)' : '#666',
          margin: '0 0 2rem 0',
          lineHeight: 1.5
        }}>
          这里将展示整个社区最活跃的用户介绍，敬请期待！
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(var(--theme-primary-rgb), 0.2)',
              border: '1px solid rgba(var(--theme-primary-rgb), 0.4)',
              borderRadius: '8px',
              color: 'var(--theme-primary)',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
