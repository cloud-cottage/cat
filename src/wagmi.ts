import { createConfig, http } from 'wagmi'
import { mainnet, polygon, arbitrum, optimism } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'
import { createStorage } from 'wagmi'

export const chains = [mainnet, polygon, arbitrum, optimism] as const

// 从环境变量获取 WalletConnect Project ID
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '66bf4af48b36ff6103c4177f6f1439a2'

// 创建持久化存储
const storage = createStorage({ storage: localStorage })

export const wagmiConfig = createConfig({
  chains,
  connectors: [
    walletConnect({ 
      projectId,
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'light',
        themeVariables: {
          '--wcm-z-index': '9999'
        }
      }
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
  ssr: false,
  storage, // 启用持久化存储
})
