import { useNavigate } from 'react-router-dom'
import WalletConnect from '../../components/WalletConnect'

export default function BlogHome() {
  const navigate = useNavigate()

  return (
    <div className="blog-container">
      <div className="blog-card">
        <h1 className="blog-title">猫猫之家</h1>
        <p className="blog-muted">用 Web3 钱包登录，创建你的个人主页</p>
        
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg)', borderRadius: '8px', border: '1px solid #444' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--fg)' }}>连接钱包</h3>
          <WalletConnect />
        </div>
        
        <div style={{ marginTop: '1rem' }}>
          <button 
            onClick={() => navigate('/setup')} 
            className="btn-primary"
          >
            进入设置
          </button>
        </div>
      </div>
    </div>
  )
}
