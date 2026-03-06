import React from 'react'
import type { User } from '../lib/api'

interface ProfileModuleProps {
  user: User
  isOwner: boolean
  onAvatarClick?: () => void
}

export const ProfileModule: React.FC<ProfileModuleProps> = ({ 
  user, 
  isOwner, 
  onAvatarClick 
}) => {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '2rem',
      textAlign: 'center'
    }}>
      {/* 头像区域 */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
        <img
          src={getUserAvatarUrl(user.avatarUrl)}
          alt={`${user.username} 的头像`}
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid rgba(255,255,255,0.3)',
            cursor: isOwner ? 'pointer' : 'default'
          }}
          onClick={onAvatarClick}
        />
        
        {/* 签名认证印章 - 像邮戳压在邮票上 */}
        <div style={{
          position: 'absolute',
          bottom: '5px',
          right: '5px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          border: '2px solid rgba(255,255,255,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          color: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          transform: 'rotate(-15deg)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          zIndex: 10
        }}
        title="Web3 签名认证"
        onClick={() => {
          // 这里可以添加签名验证逻辑
          console.log('验证签名认证')
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'rotate(-15deg) scale(1.1)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'rotate(-15deg) scale(1)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
        }}
        >
          ✓
        </div>
        
        {/* 印章装饰环 */}
        <div style={{
          position: 'absolute',
          bottom: '3px',
          right: '3px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: '1px dashed rgba(255,255,255,0.4)',
          pointerEvents: 'none',
          transform: 'rotate(-15deg)'
        }} />
      </div>

      {/* 用户名 */}
      <h1 style={{ 
        color: 'white', 
        margin: '0 0 0.5rem 0',
        fontSize: '2rem',
        fontWeight: 'bold',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}>
        {user.username}
      </h1>
      
      {/* 昵称 */}
      {user.nickname && (
        <h2 style={{
          color: 'rgba(255,255,255,0.9)',
          margin: '0 0 1rem 0',
          fontSize: '1.2rem',
          fontWeight: 'normal'
        }}>
          {user.nickname}
        </h2>
      )}
      
      {/* 简介 */}
      {user.bio && (
        <p style={{ 
          color: 'rgba(255,255,255,0.9)', 
          margin: '0 0 1.5rem 0',
          fontSize: '1.1rem',
          maxWidth: '600px',
          lineHeight: 1.5
        }}>
          {user.bio}
        </p>
      )}

      {/* 社交媒体链接 */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {user.twitterHandle && (
          <a
            href={`https://twitter.com/${user.twitterHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              fontSize: '1.2rem',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            🐦
          </a>
        )}
      </div>
    </div>
  )
}

// 辅助函数
function getUserAvatarUrl(avatarUrl?: string): string {
  if (!avatarUrl) {
    return 'https://api.dicebear.com/7.x/avataaars/svg?seed=default&backgroundColor=b6e3f4'
  }
  
  // 如果是完整的 URL，直接返回
  if (avatarUrl.startsWith('http')) {
    return avatarUrl
  }
  
  // 否则认为是 IPFS 链接
  return `https://ipfs.io/ipfs/${avatarUrl}`
}
