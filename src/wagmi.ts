import { createConfig, http } from 'wagmi'
import { mainnet, polygon, arbitrum, optimism } from 'wagmi/chains'
import { createStorage } from 'wagmi'

export const chains = [mainnet, polygon, arbitrum, optimism] as const

// 创建持久化存储
const storage = createStorage({ storage: localStorage })

export const wagmiConfig = createConfig({
  chains,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
  ssr: false,
  storage, // 启用持久化存储
})
