import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { walletConnect } from 'wagmi/connectors'

// 从环境变量获取 Project ID
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '66bf4af48b36ff6103c4177f6f1439a2'

export default function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    console.log('WalletConnect: handleConnect called')
    setIsConnecting(true)
    try {
      console.log('WalletConnect: calling connect')
      await connect({ connector: walletConnect({ projectId }) })
      console.log('WalletConnect: connect successful')
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  if (isConnected && address) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button 
          onClick={handleDisconnect}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          断开
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      style={{
        padding: '0.75rem 1.5rem',
        background: '#3b99fc',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: isConnecting ? 'not-allowed' : 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        opacity: isConnecting ? 0.6 : 1,
        transition: 'all 0.2s'
      }}
    >
      {isConnecting ? '连接中...' : '连接钱包'}
    </button>
  )
}
