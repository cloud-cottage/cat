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
  return (
    <div 
      style={{ 
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        // 显示编辑符号
        const editIcon = e.currentTarget.querySelector('.edit-icon') as HTMLElement
        if (editIcon) {
          editIcon.style.opacity = '1'
          editIcon.style.pointerEvents = 'auto'
        }
      }}
      onMouseLeave={(e) => {
        // 隐藏编辑符号
        const editIcon = e.currentTarget.querySelector('.edit-icon') as HTMLElement
        if (editIcon) {
          editIcon.style.opacity = '0'
          editIcon.style.pointerEvents = 'none'
        }
      }}
    >
      {/* 编辑符号 - 悬停时显示 */}
      {isOwner && (
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
            e.stopPropagation()
            if (isAssetEditing) {
              // 关闭编辑模式
              setIsAssetEditing(false)
            } else {
              // 进入编辑模式
              setIsAssetEditing(true)
            }
          }}
          title={isAssetEditing ? "关闭编辑" : "编辑数字资产"}
        >
          {isAssetEditing ? <i className="ri-close-circle-line"></i> : <i className="ri-edit-line"></i>}
        </div>
      )}
      
      <div style={{ 
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
            fontSize: '0.875rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--theme-primary-rgb), 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          查看详情
        </button>
      </div>
    </div>
  )
}
