import { useState } from 'react'
import { type User, canChangeUsername, validateNickname } from '../lib/api'

interface SettingsModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onSave: (updatedUser: User) => Promise<void>
}

export const SettingsModal = ({ user, isOpen, onClose, onSave }: SettingsModalProps) => {
  const [formData, setFormData] = useState<User>({ ...user })
  const [saving, setSaving] = useState(false)
  const [nicknameError, setNicknameError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证昵称
    if (!validateNickname(formData.nickname || '')) {
      setNicknameError('昵称长度不能超过8个中文字符')
      return
    }
    
    // 检查用户名修改限制
    if (formData.username !== user.username && !canChangeUsername(user)) {
      alert('用户名每年只能修改一次，请明年再试')
      return
    }
    
    setSaving(true)
    
    try {
      // 如果修改了用户名，更新修改次数和年份
      let updatedUser = { ...formData }
      if (formData.username !== user.username) {
        const currentYear = new Date().getFullYear()
        updatedUser.usernameChangeCount = (user.usernameChangeCount || 0) + 1
        updatedUser.lastUsernameChangeYear = currentYear
      }
      
      await onSave(updatedUser)
      onClose()
    } catch (error) {
      console.error('保存设置失败:', error)
      alert('保存设置失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof User, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }))
    
    // 清除昵称错误
    if (field === 'nickname') {
      setNicknameError('')
    }
  }

  const canEditUsername = canChangeUsername(user)

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '2rem',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* 标题 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            margin: 0,
            color: '#333',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            ⚙️ 设置
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
              padding: '0.5rem',
              borderRadius: '50%',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.1)'
              e.currentTarget.style.color = '#333'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none'
              e.currentTarget.style.color = '#666'
            }}
          >
            ✕
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit}>
          {/* 网址 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>
              网址
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                disabled={!canEditUsername}
                placeholder="输入用户名"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  background: canEditUsername ? 'rgba(255, 255, 255, 0.8)' : 'rgba(240, 240, 240, 0.8)',
                  color: canEditUsername ? '#333' : '#999',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  if (canEditUsername) {
                    e.currentTarget.style.borderColor = '#667eea'
                    e.currentTarget.style.outline = 'none'
                  }
                }}
                onBlur={(e) => {
                  if (canEditUsername) {
                    e.currentTarget.style.borderColor = '#ddd'
                  }
                }}
              />
              <span style={{
                color: '#666',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap'
              }}>
                .catcat.meme
              </span>
            </div>
            {!canEditUsername && (
              <div style={{
                marginTop: '0.5rem',
                fontSize: '0.8rem',
                color: '#999'
              }}>
                用户名每年只能修改一次，请明年再试
              </div>
            )}
          </div>

          {/* 昵称 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>
              昵称
            </label>
            <input
              type="text"
              value={formData.nickname || ''}
              onChange={(e) => handleChange('nickname', e.target.value)}
              placeholder="输入昵称（最多8个中文字符）"
              maxLength={16}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: nicknameError ? '1px solid #ff6b6b' : '1px solid #ddd',
                borderRadius: '10px',
                fontSize: '1rem',
                background: 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = nicknameError ? '#ff6b6b' : '#667eea'
                e.currentTarget.style.outline = 'none'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = nicknameError ? '#ff6b6b' : '#ddd'
              }}
            />
            {nicknameError && (
              <div style={{
                marginTop: '0.5rem',
                fontSize: '0.8rem',
                color: '#ff6b6b'
              }}>
                {nicknameError}
              </div>
            )}
            <div style={{
              marginTop: '0.5rem',
              fontSize: '0.8rem',
              color: '#999'
            }}>
              当前长度：{formData.nickname ? formData.nickname.length : 0} 字符（中文字符算1个，其他字符算0.5个）
            </div>
          </div>

          {/* 推特账号 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>
              推特账号
            </label>
            <input
              type="text"
              value={formData.twitterHandle || ''}
              onChange={(e) => handleChange('twitterHandle', e.target.value)}
              placeholder="输入推特账号（不含@符号）"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '10px',
                fontSize: '1rem',
                background: 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea'
                e.currentTarget.style.outline = 'none'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ddd'
              }}
            />
          </div>

          {/* 个人简介 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>
              个人简介
            </label>
            <textarea
              value={formData.bio || ''}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="介绍一下你自己..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '10px',
                fontSize: '1rem',
                background: 'rgba(255, 255, 255, 0.8)',
                resize: 'vertical',
                minHeight: '80px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea'
                e.currentTarget.style.outline = 'none'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ddd'
              }}
            />
          </div>

          {/* 主题选择 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>
              主题颜色
            </label>
            <select
              value={formData.themeId}
              onChange={(e) => handleChange('themeId', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '10px',
                fontSize: '1rem',
                background: 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea'
                e.currentTarget.style.outline = 'none'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#ddd'
              }}
            >
              <option value={1}>🌅 日出橙</option>
              <option value={2}>🌊 海洋蓝</option>
              <option value={3}>🌸 樱花粉</option>
              <option value={4}>🌿 森林绿</option>
              <option value={5}>🌙 午夜紫</option>
            </select>
          </div>

          {/* 按钮 */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            marginTop: '2rem'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #ddd',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.8)',
                color: '#666',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.05)'
                e.currentTarget.style.borderColor = '#999'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'
                e.currentTarget.style.borderColor = '#ddd'
              }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '10px',
                background: saving ? 'rgba(102, 126, 234, 0.6)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              {saving ? '保存中...' : '完成设置'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
