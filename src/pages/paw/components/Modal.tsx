import React from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  show: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
  width?: string
}

export const Modal: React.FC<ModalProps> = ({
  show,
  onClose,
  title,
  children,
  maxWidth = '500px',
  width = '90%'
}) => {
  if (!show) return null

  const modalContent = (
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
        background: 'var(--theme-surface)',
        padding: '2rem',
        borderRadius: '12px',
        maxWidth: maxWidth,
        width: width,
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: 'var(--theme-primary)',
            padding: '0.4rem',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--theme-primary)'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--theme-primary)'
          }}
          title="关闭"
        >
          <i className="ri-close-line"></i>
        </button>

        {/* 标题 */}
        <h2 style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: '600',
          color: 'var(--theme-primary)',
          marginBottom: '1.5rem',
          paddingRight: '3rem' // 为关闭按钮留出空间
        }}>
          {title}
        </h2>

        {/* 内容 */}
        <div>
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
