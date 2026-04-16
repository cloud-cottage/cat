import React from 'react'

interface AssetModuleProps {
  isOwner: boolean
  isAssetEditing: boolean
  setIsAssetEditing: (editing: boolean) => void
}

export const AssetModule: React.FC<AssetModuleProps> = ({
  isOwner,
  isAssetEditing,
  setIsAssetEditing
}) => {
  const assetItems = [
    {
      title: 'NFT 收藏',
      description: '展示收藏方向、头像资产和高辨识度作品。',
      icon: 'ri-image-line'
    },
    {
      title: '代币资产',
      description: '让常用仓位和公开持仓更容易被看见。',
      icon: 'ri-coin-line'
    },
    {
      title: 'DeFi 仓位',
      description: '汇总协议参与、LP 和收益策略。',
      icon: 'ri-exchange-funds-line'
    },
    {
      title: '链上身份',
      description: '把 ENS、Badge 和链上信誉集中展示。',
      icon: 'ri-shield-star-line'
    }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.45rem 0.75rem',
          borderRadius: '999px',
          background: 'rgba(var(--theme-primary-rgb), 0.1)',
          color: 'var(--theme-primary)',
          fontSize: '0.78rem',
          fontWeight: 700
        }}>
          <i className="ri-scan-2-line"></i>
          公开展示 4 类资产
        </div>

        {isOwner && (
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.75rem',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(var(--theme-primary-rgb), 0.2)',
              color: 'var(--theme-primary)',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
            onClick={() => setIsAssetEditing(!isAssetEditing)}
            title={isAssetEditing ? '关闭编辑' : '编辑数字资产'}
          >
            <i className={isAssetEditing ? 'ri-close-circle-line' : 'ri-edit-line'}></i>
            {isAssetEditing ? '完成' : '编辑'}
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gap: '0.75rem'
      }}>
        {assetItems.map((item) => (
          <div
            key={item.title}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '0.9rem 1rem',
              borderRadius: '18px',
              border: '1px solid rgba(var(--theme-primary-rgb), 0.16)',
              background: isAssetEditing ? 'rgba(var(--theme-primary-rgb), 0.12)' : 'rgba(var(--theme-primary-rgb), 0.08)',
              boxShadow: '0 8px 18px rgba(0,0,0,0.08)'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: 'rgba(var(--theme-primary-rgb), 0.14)',
                color: 'var(--theme-primary)'
              }}
            >
              <i className={item.icon}></i>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--theme-primary)'
              }}>
                {item.title}
              </div>
              <div style={{
                fontSize: '0.82rem',
                lineHeight: 1.6,
                color: 'rgba(var(--theme-primary-rgb), 0.78)'
              }}>
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: 'auto', 
        textAlign: 'center'
      }}>
        <button
          style={{
            padding: '0.7rem 1.1rem',
            background: 'var(--theme-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 700,
            transition: 'all 0.2s ease',
            boxShadow: '0 10px 22px rgba(var(--theme-primary-rgb), 0.28)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          查看详情
        </button>
      </div>
    </div>
  )
}
