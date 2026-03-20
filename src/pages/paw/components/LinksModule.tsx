import React from 'react'
import type { Link } from '../lib/api'
import { detectIconFromUrl, detectTitleFromUrl } from '../lib/api'

interface LinksModuleProps {
  links: Link[]
  isEditing: boolean
  isOwner: boolean
  onAddLink: () => void
  onEditLink: (link: Link) => void
  onDeleteLink: (id: string) => void
}

export const LinksModule: React.FC<LinksModuleProps> = ({
  links,
  isEditing,
  isOwner,
  onAddLink,
  onEditLink,
  onDeleteLink
}) => {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '2rem'
    }}>
      {/* 标题和添加按钮 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          color: 'white',
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          🔗 链接集合
        </h2>
        {isOwner && (
          <button
            onClick={onAddLink}
            style={{
              background: 'rgba(33, 150, 243, 0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            + 链接
          </button>
        )}
      </div>

      {/* 链接列表 */}
      {links.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: 'rgba(255,255,255,0.7)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <p style={{ margin: 0, fontSize: '1.2rem' }}>
            {isOwner ? '点击上方按钮添加你的第一个链接' : '暂无链接'}
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem' 
        }}>
          {links.map((link, index) => (
            <a
              key={`${link.id}-${index}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '12px',
                padding: '1rem',
                textDecoration: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                background: 'rgba(255,255,255,0.2)'
              }}>
                {link.icon || detectIconFromUrl(link.url) || '🔗'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: '600', 
                  marginBottom: '0.25rem',
                  fontSize: '1rem'
                }}>
                  {link.label || detectTitleFromUrl(link.url)}
                </div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  opacity: 0.8,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {link.url}
                </div>
              </div>
              {isEditing && (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      onEditLink(link)
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.7rem'
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      onDeleteLink(link.id)
                    }}
                    style={{
                      background: 'rgba(244, 67, 54, 0.8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.25rem',
                      cursor: 'pointer',
                      fontSize: '0.7rem'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
