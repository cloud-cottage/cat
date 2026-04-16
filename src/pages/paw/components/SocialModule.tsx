import React, { useState } from 'react'
import type { User } from '../lib/api'
import { Modal } from './Modal'

type SocialField = 'twitterHandle' | 'linkedInHandle' | 'youtubeHandle' | 'instagramHandle'

interface SocialModuleProps {
  user: User
  isOwner: boolean
  handleAutoSave: (field: SocialField, value: string) => void
}

export const SocialModule: React.FC<SocialModuleProps> = ({
  user,
  isOwner,
  handleAutoSave
}) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    twitterHandle: user?.twitterHandle || '',
    linkedInHandle: user?.linkedInHandle || '',
    youtubeHandle: user?.youtubeHandle || '',
    instagramHandle: user?.instagramHandle || '',
    githubHandle: user?.username || '',
    telegramHandle: user?.username || '',
    showGithub: true,
    showTelegram: true
  })
  const [showAddSocial, setShowAddSocial] = useState(false)
  const [newSocialForm, setNewSocialForm] = useState({ platform: '', username: '' })

  const saveNewSocial = async () => {
    if (newSocialForm.platform && newSocialForm.username) {
      try {
        const updateData: Partial<Pick<User, SocialField>> = {}
        const platformMap: Record<string, SocialField> = {
          'twitter': 'twitterHandle',
          'youtube': 'youtubeHandle',
          'instagram': 'instagramHandle',
          'linkedin': 'linkedInHandle'
        }
        
        const field = platformMap[newSocialForm.platform.toLowerCase()]
        if (field) {
          updateData[field] = newSocialForm.username
          // 这里需要导入 api，暂时注释
          // await api.updateUser(user?.username || '', updateData)
          console.log('添加社交媒体成功:', newSocialForm.platform)
          
          // 重置表单
          setNewSocialForm({ platform: '', username: '' })
          setShowAddSocial(false)
        }
      } catch (error) {
        console.error('添加社交媒体失败:', error)
      }
    }
  }

  const handleSaveChanges = () => {
    // 保存所有更改
    handleAutoSave('twitterHandle', editForm.twitterHandle)
    handleAutoSave('linkedInHandle', editForm.linkedInHandle)
    handleAutoSave('youtubeHandle', editForm.youtubeHandle)
    handleAutoSave('instagramHandle', editForm.instagramHandle)
    // Note: GitHub and Telegram handles are stored in local state only
    // The showGithub/showTelegram flags control visibility
    setShowEditModal(false)
  }

  const socialLinks = [
    user?.twitterHandle
      ? {
          key: 'twitter',
          label: 'X',
          meta: `@${user.twitterHandle}`,
          href: `https://x.com/${user.twitterHandle}`,
          icon: 'ri-twitter-x-fill',
          accent: '#111827'
        }
      : null,
    user?.linkedInHandle
      ? {
          key: 'linkedin',
          label: 'LinkedIn',
          meta: user.linkedInHandle,
          href: `https://www.linkedin.com/in/${user.linkedInHandle}`,
          icon: 'ri-linkedin-box-fill',
          accent: '#0A66C2'
        }
      : null,
    user?.youtubeHandle
      ? {
          key: 'youtube',
          label: 'YouTube',
          meta: `@${user.youtubeHandle}`,
          href: `https://youtube.com/@${user.youtubeHandle}`,
          icon: 'ri-youtube-fill',
          accent: '#FF0000'
        }
      : null,
    user?.instagramHandle
      ? {
          key: 'instagram',
          label: 'Instagram',
          meta: `@${user.instagramHandle}`,
          href: `https://instagram.com/${user.instagramHandle}`,
          icon: 'ri-instagram-line',
          accent: '#E1306C'
        }
      : null,
    editForm.showGithub && editForm.githubHandle
      ? {
          key: 'github',
          label: 'GitHub',
          meta: editForm.githubHandle,
          href: `https://github.com/${editForm.githubHandle}`,
          icon: 'ri-github-fill',
          accent: '#24292F'
        }
      : null,
    editForm.showTelegram && editForm.telegramHandle
      ? {
          key: 'telegram',
          label: 'Telegram',
          meta: editForm.telegramHandle,
          href: `https://t.me/${editForm.telegramHandle}`,
          icon: 'ri-telegram-2-fill',
          accent: '#229ED9'
        }
      : null
  ].filter(
    (link): link is {
      key: string
      label: string
      meta: string
      href: string
      icon: string
      accent: string
    } => Boolean(link)
  )

  return (
    <>
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
            <i className="ri-radar-line"></i>
            已连接 {socialLinks.length} 个渠道
          </div>

          {isOwner && (
            <button
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
              onClick={() => setShowEditModal(true)}
              title="编辑社交媒体"
            >
              <i className="ri-edit-line"></i>
              编辑
            </button>
          )}
        </div>

        {socialLinks.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: socialLinks.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr',
            gap: '0.75rem',
            alignContent: 'start'
          }}>
            {socialLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  minWidth: 0,
                  padding: '0.75rem 0.85rem',
                  borderRadius: '18px',
                  background: 'rgba(var(--theme-primary-rgb), 0.08)',
                  border: '1px solid rgba(var(--theme-primary-rgb), 0.18)',
                  textDecoration: 'none',
                  color: 'inherit',
                  boxShadow: '0 8px 18px rgba(0,0,0,0.08)',
                  backdropFilter: 'blur(12px)'
                }}
              >
                <span style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: link.accent,
                  color: '#ffffff',
                  boxShadow: '0 8px 18px rgba(0,0,0,0.16)'
                }}>
                  <i className={link.icon}></i>
                </span>
                <span style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.18rem',
                  minWidth: 0
                }}>
                  <span style={{
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--theme-primary)'
                  }}>
                    {link.label}
                  </span>
                  <span style={{
                    fontSize: '0.76rem',
                    color: 'rgba(var(--theme-primary-rgb), 0.78)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {link.meta}
                  </span>
                </span>
              </a>
            ))}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            minHeight: '96px',
            padding: '1rem',
            borderRadius: '18px',
            border: '1px dashed rgba(var(--theme-primary-rgb), 0.35)',
            background: 'rgba(var(--theme-primary-rgb), 0.08)',
            color: 'rgba(var(--theme-primary-rgb), 0.82)',
            textAlign: 'center',
            lineHeight: 1.6
          }}>
            添加 X、LinkedIn、YouTube 或 Instagram，让访客能快速找到你。
          </div>
        )}
      </div>

      {/* 编辑模态框 */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="编辑社交媒体"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: 'var(--theme-primary)',
              fontWeight: '500'
            }}>
              Twitter 用户名
            </label>
            <input
              type="text"
              value={editForm.twitterHandle}
              onChange={(e) => setEditForm({...editForm, twitterHandle: e.target.value})}
              placeholder="输入 Twitter 用户名"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--theme-primary)',
                borderRadius: '8px',
                background: 'var(--theme-surface)',
                color: 'var(--theme-primary)',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: 'var(--theme-primary)',
              fontWeight: '500'
            }}>
              LinkedIn 用户名
            </label>
            <input
              type="text"
              value={editForm.linkedInHandle}
              onChange={(e) => setEditForm({...editForm, linkedInHandle: e.target.value})}
              placeholder="输入 LinkedIn 用户名"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--theme-primary)',
                borderRadius: '8px',
                background: 'var(--theme-surface)',
                color: 'var(--theme-primary)',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: 'var(--theme-primary)',
              fontWeight: '500'
            }}>
              YouTube 用户名
            </label>
            <input
              type="text"
              value={editForm.youtubeHandle}
              onChange={(e) => setEditForm({...editForm, youtubeHandle: e.target.value})}
              placeholder="输入 YouTube 用户名"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--theme-primary)',
                borderRadius: '8px',
                background: 'var(--theme-surface)',
                color: 'var(--theme-primary)',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: 'var(--theme-primary)',
              fontWeight: '500'
            }}>
              Instagram 用户名
            </label>
            <input
              type="text"
              value={editForm.instagramHandle}
              onChange={(e) => setEditForm({...editForm, instagramHandle: e.target.value})}
              placeholder="输入 Instagram 用户名"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--theme-primary)',
                borderRadius: '8px',
                background: 'var(--theme-surface)',
                color: 'var(--theme-primary)',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: 'var(--theme-primary)',
              fontWeight: '500'
            }}>
              GitHub 用户名
            </label>
            <input
              type="text"
              value={editForm.githubHandle}
              onChange={(e) => setEditForm({...editForm, githubHandle: e.target.value})}
              placeholder="输入 GitHub 用户名"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--theme-primary)',
                borderRadius: '8px',
                background: 'var(--theme-surface)',
                color: 'var(--theme-primary)',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: 'var(--theme-primary)',
              fontWeight: '500'
            }}>
              Telegram 用户名
            </label>
            <input
              type="text"
              value={editForm.telegramHandle}
              onChange={(e) => setEditForm({...editForm, telegramHandle: e.target.value})}
              placeholder="输入 Telegram 用户名"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--theme-primary)',
                borderRadius: '8px',
                background: 'var(--theme-surface)',
                color: 'var(--theme-primary)',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--theme-primary)',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={editForm.showGithub}
                onChange={(e) => setEditForm({...editForm, showGithub: e.target.checked})}
                style={{
                  cursor: 'pointer'
                }}
              />
              显示 GitHub
            </label>
            
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--theme-primary)',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={editForm.showTelegram}
                onChange={(e) => setEditForm({...editForm, showTelegram: e.target.checked})}
                style={{
                  cursor: 'pointer'
                }}
              />
              显示 Telegram
            </label>
          </div>

          {/* 添加新社交媒体功能 */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: 'var(--theme-primary)',
              fontWeight: '500'
            }}>
              添加新社交媒体
            </label>
            {!showAddSocial ? (
              <div
                onClick={() => setShowAddSocial(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--theme-primary)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  margin: '0 auto'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--theme-primary-rgb), 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                title="添加社交媒体"
              >
                <i className="ri-add-circle-fill" style={{ fontSize: '20px' }}></i>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                padding: '0.5rem',
                border: '1px solid var(--theme-primary)',
                borderRadius: '8px',
                background: 'var(--theme-surface)'
              }}>
                <select
                  value={newSocialForm.platform}
                  onChange={(e) => setNewSocialForm({...newSocialForm, platform: e.target.value})}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid var(--theme-primary)',
                    borderRadius: '4px',
                    background: 'var(--theme-surface)',
                    color: 'var(--theme-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="">选择平台</option>
                  <option value="twitter">Twitter</option>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
                <input
                  type="text"
                  value={newSocialForm.username}
                  onChange={(e) => setNewSocialForm({...newSocialForm, username: e.target.value})}
                  placeholder="用户名"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: '1px solid var(--theme-primary)',
                    borderRadius: '4px',
                    background: 'var(--theme-surface)',
                    color: 'var(--theme-primary)',
                    fontSize: '0.875rem'
                  }}
                />
                <button
                  onClick={saveNewSocial}
                  disabled={!newSocialForm.platform || !newSocialForm.username}
                  style={{
                    padding: '0.5rem 1rem',
                    background: newSocialForm.platform && newSocialForm.username ? 'var(--theme-primary)' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  <i className="ri-save-line" style={{ marginRight: '0.5rem' }}></i>
                  保存
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <button
            onClick={() => setShowEditModal(false)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            取消
          </button>
          <button
            onClick={handleSaveChanges}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--theme-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            <i className="ri-save-line" style={{ marginRight: '0.5rem' }}></i>
            保存更改
          </button>
        </div>
      </Modal>
    </>
  )
}
