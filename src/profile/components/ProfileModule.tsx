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
