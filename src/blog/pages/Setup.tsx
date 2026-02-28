import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, generateUser } from '../lib/db'

export default function Setup() {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('siwe_token')
    if (!token) {
      navigate('/')
    }
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) {
      alert('请设置用户名')
      return
    }
    if (/^\d/.test(username)) {
      alert('用户名不能以数字开头')
      return
    }
    
    setIsLoading(true)
    try {
      const existingUser = db.getUserByUsername(username)
      if (existingUser) {
        localStorage.setItem('current_username', username)
        window.location.href = `https://${username}.catcat.meme`
        return
      }
      
      const newUser = generateUser(username)
      db.createUser(newUser)
      localStorage.setItem('current_username', username)
      window.location.href = `https://${username}.catcat.meme`
    } catch {
      alert('保存失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="blog-container">
      <div className="blog-card">
        <h1 className="blog-title">欢迎来到猫猫之家</h1>
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
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? '保存中...' : '打开博客'}
          </button>
        </form>
      </div>
    </div>
  )
}
