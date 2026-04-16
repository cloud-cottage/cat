import React from 'react'
import { getTwitterAvatarUrl, getUserAvatarUrl, type User } from '../lib/api'

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
  const avatarSrc =
    (user.twitterHandle ? getTwitterAvatarUrl(user.twitterHandle) : '') ||
    getUserAvatarUrl(user) ||
    '/default-avatar.png'
  const displayName = user.nickname || user.username
  const walletLabel = user.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : '未绑定钱包'
  const profileTags = [
    { icon: 'ri-wallet-3-line', label: walletLabel },
    user.twitterHandle
      ? {
          icon: 'ri-twitter-x-line',
          label: `@${user.twitterHandle}`,
          href: `https://x.com/${user.twitterHandle}`
        }
      : null,
    { icon: 'ri-shield-check-line', label: 'Signed' }
  ].filter(Boolean) as Array<{ icon: string; label: string; href?: string }>

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      textAlign: 'center',
      gap: '1rem'
    }}>
      {/* 头像区域 */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{
          position: 'absolute',
          inset: '-12px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--theme-primary-rgb), 0.28) 0%, transparent 70%)',
          filter: 'blur(10px)'
        }} />
        <img
          src={avatarSrc}
          alt={`${user.username} 的头像`}
          referrerPolicy="no-referrer"
          style={{
            width: '132px',
            height: '132px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '4px solid rgba(255,255,255,0.3)',
            cursor: isOwner ? 'pointer' : 'default',
            boxShadow: '0 18px 36px rgba(0,0,0,0.28)',
            position: 'relative',
            zIndex: 1
          }}
          onClick={onAvatarClick}
          onError={(event) => {
            if (event.currentTarget.dataset.fallbackApplied === 'true') {
              return
            }

            event.currentTarget.dataset.fallbackApplied = 'true'
            event.currentTarget.src = '/default-avatar.png'
          }}
        />
        
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '2px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          border: '2px solid rgba(255,255,255,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          color: 'white',
          boxShadow: '0 10px 20px rgba(0,0,0,0.28)',
          transform: 'rotate(-15deg)',
          zIndex: 10
        }}
        title="Web3 签名认证"
        >
          ✓
        </div>
        
        <div style={{
          position: 'absolute',
          bottom: '6px',
          right: '0px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '1px dashed rgba(255,255,255,0.4)',
          pointerEvents: 'none',
          transform: 'rotate(-15deg)'
        }} />
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        alignItems: 'center'
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.35rem 0.75rem',
          borderRadius: '999px',
          background: 'rgba(var(--theme-primary-rgb), 0.14)',
          color: 'var(--theme-primary)',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase'
        }}>
          Onchain Identity
        </span>
        <h1 style={{ 
          color: 'white', 
          margin: 0,
          fontSize: '2rem',
          fontWeight: 'bold',
          letterSpacing: '-0.03em',
          textShadow: '0 2px 10px rgba(0,0,0,0.25)'
        }}>
          {displayName}
        </h1>
        {user.nickname && (
          <p style={{
            color: 'rgba(255,255,255,0.72)',
            margin: 0,
            fontSize: '0.95rem'
          }}>
            @{user.username}
          </p>
        )}
        <p style={{ 
          color: 'rgba(255,255,255,0.88)', 
          margin: 0,
          fontSize: '1rem',
          maxWidth: '32ch',
          lineHeight: 1.6
        }}>
          {user.bio || '把你的社交身份、链接入口和链上足迹聚合成一张清晰的个人名片。'}
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {profileTags.map((tag) => (
          tag.href ? (
            <a
              key={`${tag.icon}-${tag.label}`}
              href={tag.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 0.85rem',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: 'rgba(255,255,255,0.92)',
                textDecoration: 'none',
                fontSize: '0.82rem',
                backdropFilter: 'blur(12px)'
              }}
            >
              <i className={tag.icon}></i>
              {tag.label}
            </a>
          ) : (
            <div
              key={`${tag.icon}-${tag.label}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 0.85rem',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: 'rgba(255,255,255,0.92)',
                fontSize: '0.82rem',
                backdropFilter: 'blur(12px)'
              }}
            >
              <i className={tag.icon}></i>
              {tag.label}
            </div>
          )
        ))}
      </div>

      {isOwner && (
        <div style={{
          fontSize: '0.78rem',
          color: 'rgba(255,255,255,0.68)'
        }}>
          点击头像即可更新资料
        </div>
      )}
    </div>
  )
}
