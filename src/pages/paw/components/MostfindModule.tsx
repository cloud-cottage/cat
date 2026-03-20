import React from 'react'

interface MostfindModuleProps {
  user?: any
  isOwner: boolean
  isMostfindEditing: boolean
  setIsMostfindEditing: (editing: boolean) => void
}

export const MostfindModule: React.FC<MostfindModuleProps> = ({
  user,
  isOwner,
  isMostfindEditing,
  setIsMostfindEditing
}) => {
  return (
    <>
      {/* 编辑符号 */}
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
            setIsMostfindEditing(!isMostfindEditing)
          }}
          title={isMostfindEditing ? "关闭编辑" : "编辑活跃平台"}
        >
          {isMostfindEditing ? <i className="ri-close-circle-line"></i> : <i className="ri-edit-line"></i>}
        </div>
      )}
      
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
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
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
  )
}
