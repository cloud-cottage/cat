import React from 'react'

interface MostfindModuleProps {
  isOwner: boolean
  isMostfindEditing: boolean
  setIsMostfindEditing: (editing: boolean) => void
}

export const MostfindModule: React.FC<MostfindModuleProps> = ({
  isOwner,
  isMostfindEditing,
  setIsMostfindEditing
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
            if (isMostfindEditing) {
              // 关闭编辑模式
              setIsMostfindEditing(false)
            } else {
              // 进入编辑模式
              setIsMostfindEditing(true)
            }
          }}
          title={isMostfindEditing ? "关闭编辑" : "编辑活跃平台"}
        >
          {isMostfindEditing ? <i className="ri-close-circle-line"></i> : <i className="ri-edit-line"></i>}
        </div>
      )}
      
      <div style={{ 
        opacity: isMostfindEditing ? 1 : 0.8 
      }}>
        <div>• 活跃平台</div>
        <div>• 互动数据</div>
        <div>• 影响力分析</div>
        <div>• 趋势追踪</div>
      </div>
    </div>
  )
}
