import { useState } from 'react'
import { useAccount } from 'wagmi'
import { api, validateUsername } from '../../paw/lib/api'
import WalletConnect from '../../components/WalletConnect'

export default function Setup() {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { address, isConnected } = useAccount()

  console.log('Setup render:', { isConnected, address, username })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !address) {
      setError('请先连接钱包')
      return
    }
    
    if (!username.trim()) {
      setError('请输入用户名')
      return
    }
    
    // 验证用户名
    const validation = validateUsername(username.trim())
    if (!validation.valid) {
      setError(validation.reason || '用户名无效')
      return
    }
    
    setIsLoading(true)
    setError('')
    try {
      console.log('Creating user:', { username, address })
      // 检查用户是否已存在
      const existingUser = await api.getUserByUsername(username.trim())
      if (existingUser) {
        localStorage.setItem('current_username', username.trim())
        // 跳转到用户子域名
        window.location.href = `https://${username.trim()}.catcat.meme/`
        return
      }
      
      // 创建新用户，使用钱包地址
      await api.createUser(username.trim(), address)
      localStorage.setItem('current_username', username.trim())
      // 跳转到用户子域名
      window.location.href = `https://${username.trim()}.catcat.meme/`
    } catch (err) {
      console.error('Setup error:', err)
      setError('保存失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="blog-container">
      <div className="blog-card">
        <h1 className="blog-title">欢迎来到猫猫之家</h1>
        
        {/* 钱包连接区域 */}
        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg)', borderRadius: '8px', border: '1px solid #444' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--fg)' }}>连接钱包</h3>
          <WalletConnect />
        </div>

        {/* 错误提示 */}
        {error && (
          <div style={{ 
            marginBottom: '1rem', 
            padding: '0.75rem', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: '6px',
            color: '#ef4444',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {/* 用户名设置表单 */}
        <form className="blog-form" onSubmit={handleSubmit}>
          <div className="blog-field">
            <label>用户名（将作为你的博客地址）</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="blog-input"
              placeholder="alice" 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading || !isConnected} 
            className="btn-primary"
            style={{ 
              opacity: (isLoading || !isConnected) ? 0.6 : 1,
              cursor: (isLoading || !isConnected) ? 'not-allowed' : 'pointer'
            }}
            onClick={() => console.log('Button clicked!')}
          >
            {isLoading ? '保存中...' : '打开博客'}
          </button>
        </form>

        {/* 状态提示 */}
        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#888' }}>
          {isConnected && address ? 
            `✅ 钱包已连接: ${address.slice(0, 6)}...${address.slice(-4)}` 
            : '⚠️ 请先连接钱包以创建博客'
          }
        </div>
      </div>
    </div>
  )
}
