import React from 'react'
import type { Link } from '../lib/api'

interface LinksModuleProps {
  links: Link[]
}

export const LinksModule: React.FC<LinksModuleProps> = ({
  links
}) => {
  return (
    <>
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
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>�</div>
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
  )
}
