import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function BlogHome() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      let address: string | undefined
      if (typeof window.okxwallet !== 'undefined') {
        console.log('Using OKX Wallet')
        const accounts = await window.okxwallet.request({ method: 'eth_requestAccounts' }) as string[]
        address = accounts[0]
      } else if (typeof window.ethereum !== 'undefined') {
        console.log('Fallback to ethereum provider')
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[]
        address = accounts[0]
      } else {
        alert('请安装 OKX Wallet 或其他支持的钱包')
        return
      }
      console.log('Got address:', address)
      if (!address) {
        alert('钱包未返回地址')
        return
      }
      
      localStorage.setItem('siwe_token', 'token_' + Date.now())
      localStorage.setItem('wallet_address', address)
      
      setTimeout(() => {
        navigate('/setup')
      }, 300)
    } catch (e) {
      console.error('Connect error:', e)
      alert('钱包连接或登录失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="blog-container">
      <div className="blog-card">
        <h1 className="blog-title">猫猫之家</h1>
        <p className="blog-muted">用 Web3 钱包登录，创建你的个人主页</p>
        
        <div className="blog-form" style={{ marginTop: '1.5rem' }}>
          <button onClick={handleConnect} disabled={isLoading} className="btn-primary">
            {isLoading ? '连接中...' : '连接钱包'}
          </button>
        </div>
      </div>
    </div>
  )
}
