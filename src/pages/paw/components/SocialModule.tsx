import React, { useState } from 'react'
import type { User } from '../lib/api'

interface SocialModuleProps {
  user: User
  isOwner: boolean
  handleAutoSave: (field: string, value: string) => void
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
    instagramHandle: user?.instagramHandle || ''
  })
  const [showAddSocial, setShowAddSocial] = useState(false)
  const [newSocialForm, setNewSocialForm] = useState({ platform: '', username: '' })

  const saveNewSocial = async () => {
    if (newSocialForm.platform && newSocialForm.username) {
      try {
        const updateData: any = {}
        const platformMap: Record<string, string> = {
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
    setShowEditModal(false)
  }

  return (
    <>
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
              setShowEditModal(true)
            }}
            title="编辑社交媒体"
          >
            <i className="ri-edit-line"></i>
          </div>
        )}
        
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* 只显示可点击的图标 */}
          {user?.twitterHandle && (
            <a
              href={`https://twitter.com/${user.twitterHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#1DA1F2',
                color: 'white',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(29, 161, 242, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              title="Twitter"
            >
              <i className="ri-twitter-x-fill" style={{ fontSize: '10px' }}></i>
            </a>
          )}
          
          {user?.youtubeHandle && (
            <a
              href={`https://youtube.com/@${user.youtubeHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#FF0000',
                color: 'white',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 0, 0, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              title="YouTube"
            >
              <i className="ri-youtube-fill" style={{ fontSize: '10px' }}></i>
            </a>
          )}
          
          <a
            href={`https://github.com/${user?.username}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#333',
              color: 'white',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(51, 51, 51, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            title="GitHub"
          >
            <i className="ri-github-fill" style={{ fontSize: '20px' }}></i>
          </a>
          
          {user?.instagramHandle && (
            <a
              href={`https://instagram.com/${user.instagramHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)',
                color: 'white',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(225, 48, 108, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              title="Instagram"
            >
              <i className="ri-instagram-fill" style={{ fontSize: '10px' }}></i>
            </a>
          )}
          
          {user?.linkedInHandle && (
            <a
              href={`https://linkedin.com/in/${user.linkedInHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#0077B5',
                color: 'white',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 119, 181, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              title="LinkedIn"
            >
              <i className="ri-linkedin-box-fill" style={{ fontSize: '10px' }}></i>
            </a>
          )}
          
          {/* Telegram - 使用用户名作为默认 */}
          <a
            href={`https://t.me/${user?.username || user?.nickname}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#0088CC',
              color: 'white',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 136, 204, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            title="Telegram"
          >
            <i className="ri-telegram-fill" style={{ fontSize: '10px' }}></i>
          </a>
        </div>
      </div>

      {/* 编辑模态框 */}
      {showEditModal && (
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
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'var(--theme-primary)'
              }}>
                编辑社交媒体
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--theme-primary)',
                  padding: '0.5rem'
                }}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

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
          </div>
        </div>
      )}
    </>
  )
}
