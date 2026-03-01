import { createConfig, http } from 'wagmi'
import { mainnet, polygon, arbitrum, optimism } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

export const chains = [mainnet, polygon, arbitrum, optimism] as const

// 从环境变量获取 WalletConnect Project ID
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '3a0af7defd9c5b478f77ddff2585c8453fabca8a66281ae6a7347bc19d408'

export const wagmiConfig = createConfig({
  chains,
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ 
      projectId // 需要在 WalletConnect Cloud 获取
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
})
