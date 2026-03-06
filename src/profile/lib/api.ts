const API_BASE = 'https://www.catcat.meme/api/user-kv'

// IPFS 配置
const IPFS_CONFIG = {
  gateway: 'https://ipfs.io/ipfs/',
  pinataApiKey: process.env.REACT_APP_PINATA_API_KEY || '',
  pinataSecret: process.env.REACT_APP_PINATA_SECRET || '',
  pinataUrl: 'https://api.pinata.cloud/pinning/pinFileToIPFS'
}

// IPFS 相关接口
export interface IPFSUploadResult {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

export interface IPFSFile {
  file: File
  cid?: string
  uploaded?: boolean
}

// 上传文件到 IPFS (使用 Pinata)
export const uploadToIPFS = async (file: File): Promise<IPFSUploadResult | null> => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(IPFS_CONFIG.pinataUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${IPFS_CONFIG.pinataApiKey}`,
        'pinata_secret_key': IPFS_CONFIG.pinataSecret
      },
      body: formData
    })
    
    if (!response.ok) {
      console.error('IPFS upload failed:', response.statusText)
      return null
    }
    
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error uploading to IPFS:', error)
    return null
  }
}

// 获取 IPFS 文件 URL
export const getIPFSUrl = (cid: string): string => {
  return `${IPFS_CONFIG.gateway}${cid}`
}

// 从 URL 获取 IPFS CID
export const extractCIDFromIPFSUrl = (url: string): string | null => {
  const match = url.match(/\/ipfs\/(Qm[a-zA-Z0-9]+)/)
  return match ? match[1] : null
}

export interface User {
  id: string
  walletAddress: string
  username: string
  nickname?: string  // 昵称，最多8个中文字符
  usernameChangeCount?: number  // 用户名修改次数
  lastUsernameChangeYear?: number  // 上次修改用户名的年份
  twitterHandle?: string
  themeId: number
  avatarUrl?: string
  bio?: string
  layout?: {
    themeId: number
    modules: Array<{
      id: string
      name: string
      component: 'profile' | 'links' | 'twitter'
      position: { x: number; y: number }
      size: { width: number; height: number }
    }>
  }
  createdAt: string
  updatedAt: string
}

export interface Link {
  id: string
  userId: string
  label: string
  url: string
  description?: string
  group?: string
  icon?: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface LinkGroup {
  id: string
  userId: string
  name: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface Icon {
  id: string
  name: string
  emoji?: string
  icoFile?: string
  category: string
}

// 预定义图标列表
export const PREDEFINED_ICONS: Icon[] = [
  // 社交媒体
  { id: 'twitter', name: 'Twitter', emoji: '🐦', category: '社交媒体' },
  { id: 'telegram', name: 'Telegram', emoji: '✈️', category: '社交媒体' },
  { id: 'discord', name: 'Discord', emoji: '💬', category: '社交媒体' },
  { id: 'instagram', name: 'Instagram', emoji: '📷', category: '社交媒体' },
  { id: 'facebook', name: 'Facebook', emoji: '📘', category: '社交媒体' },
  { id: 'github', name: 'GitHub', emoji: '�', category: '社交媒体' },
  { id: 'youtube', name: 'YouTube', emoji: '📺', category: '社交媒体' },
  { id: 'linkedin', name: 'LinkedIn', emoji: '💼', category: '社交媒体' },
  
  // ICO 文件图标示例
  { id: 'google', name: 'Google', icoFile: '/icons/google.ico', category: '工具网站' },
  { id: 'apple', name: 'Apple', icoFile: '/icons/apple.ico', category: '工具网站' },
  { id: 'microsoft', name: 'Microsoft', icoFile: '/icons/microsoft.ico', category: '工具网站' },
  { id: 'amazon', name: 'Amazon', icoFile: '/icons/amazon.ico', category: '商务' },
  { id: 'netflix', name: 'Netflix', icoFile: '/icons/netflix.ico', category: '内容平台' },
  { id: 'bitget', name: 'Bitget', icoFile: '/icons/bitget.ico', category: '商务' },
  { id: 'binance', name: 'Binance', icoFile: '/icons/binance.ico', category: '商务' },
  { id: 'okx', name: 'OKX', icoFile: '/icons/okx.ico', category: '商务' },
  { id: 'coinbase', name: 'Coinbase', emoji: '🔵', category: '商务' },
  { id: 'reddit', name: 'Reddit', emoji: '🤖', category: '社交媒体' },
  
  // 工具网站
  { id: 'website', name: '网站', emoji: '🌐', category: '工具网站' },
  { id: 'app', name: '应用', emoji: '📱', category: '工具网站' },
  { id: 'tool', name: '工具', emoji: '🔧', category: '工具网站' },
  { id: 'code', name: '代码', emoji: '💻', category: '工具网站' },
  { id: 'docs', name: '文档', emoji: '📄', category: '工具网站' },
  
  // 内容平台
  { id: 'blog', name: '博客', emoji: '📝', category: '内容平台' },
  { id: 'video', name: '视频', emoji: '🎥', category: '内容平台' },
  { id: 'music', name: '音乐', emoji: '🎵', category: '内容平台' },
  { id: 'photo', name: '图片', emoji: '🖼️', category: '内容平台' },
  { id: 'article', name: '文章', emoji: '📖', category: '内容平台' },
  
  // 商务
  { id: 'shop', name: '商店', emoji: '🛒', category: '商务' },
  { id: 'payment', name: '支付', emoji: '💳', category: '商务' },
  { id: 'bank', name: '银行', emoji: '🏦', category: '商务' },
  { id: 'crypto', name: '加密货币', emoji: '₿', category: '商务' },
  
  // 通用
  { id: 'link', name: '链接', emoji: '🔗', category: '通用' },
  { id: 'star', name: '收藏', emoji: '⭐', category: '通用' },
  { id: 'heart', name: '喜欢', emoji: '❤️', category: '通用' },
  { id: 'fire', name: '热门', emoji: '🔥', category: '通用' },
  { id: 'rocket', name: '火箭', emoji: '🚀', category: '通用' },
]

// 域名到图标的自动映射
export const DOMAIN_ICON_MAPPING: Record<string, string> = {
  // 社交媒体
  'twitter.com': 'twitter',
  'x.com': 'twitter',
  'telegram.org': 'telegram',
  't.me': 'telegram',
  'discord.com': 'discord',
  'discord.gg': 'discord',
  'instagram.com': 'instagram',
  'facebook.com': 'facebook',
  'github.com': 'github',
  'youtube.com': 'youtube',
  'youtu.be': 'youtube',
  'linkedin.com': 'linkedin',
  
  // 工具和科技公司
  'google.com': 'google',
  'google.cn': 'google',
  'apple.com': 'apple',
  'microsoft.com': 'microsoft',
  'amazon.com': 'amazon',
  'amazon.cn': 'amazon',
  'netflix.com': 'netflix',
  
  // 加密货币和金融
  'bitget.com': 'bitget',
  'binance.com': 'binance',
  'okx.com': 'okx',
  'coinbase.com': 'coinbase',
  'crypto.com': 'crypto',
  'metamask.io': 'crypto',
  
  // 其他常见网站
  'reddit.com': 'reddit',
  'medium.com': 'article',
  'substack.com': 'blog',
  'wordpress.org': 'blog',
  'blogger.com': 'blog',
}

// 域名到标题的自动映射
export const DOMAIN_TITLE_MAPPING: Record<string, string> = {
  // 社交媒体
  'twitter.com': 'Twitter',
  'x.com': 'X (Twitter)',
  'telegram.org': 'Telegram',
  't.me': 'Telegram',
  'discord.com': 'Discord',
  'discord.gg': 'Discord',
  'instagram.com': 'Instagram',
  'facebook.com': 'Facebook',
  'github.com': 'GitHub',
  'youtube.com': 'YouTube',
  'youtu.be': 'YouTube',
  'linkedin.com': 'LinkedIn',
  
  // 工具和科技公司
  'google.com': 'Google',
  'google.cn': 'Google',
  'apple.com': 'Apple',
  'microsoft.com': 'Microsoft',
  'amazon.com': 'Amazon',
  'amazon.cn': 'Amazon',
  'netflix.com': 'Netflix',
  
  // 加密货币和金融
  'bitget.com': 'Bitget',
  'binance.com': 'Binance',
  'okx.com': 'OKX',
  'coinbase.com': 'Coinbase',
  'crypto.com': 'Crypto.com',
  'metamask.io': 'MetaMask',
  
  // 其他常见网站
  'reddit.com': 'Reddit',
  'medium.com': 'Medium',
  'substack.com': 'Substack',
  'wordpress.org': 'WordPress',
  'blogger.com': 'Blogger',
}

// 根据URL自动检测图标
export const detectIconFromUrl = (url: string): string => {
  try {
    if (!url) return 'link'
    
    // 解析URL获取域名
    let domain: string
    try {
      const urlObj = new URL(url)
      domain = urlObj.hostname.toLowerCase()
    } catch {
      // 如果URL解析失败，尝试简单处理
      const match = url.match(/^(https?:\/\/)?([^\/]+)/i)
      domain = match ? match[2].toLowerCase() : url.toLowerCase()
    }
    
    // 移除 www. 前缀
    if (domain.startsWith('www.')) {
      domain = domain.substring(4)
    }
    
    // 查找完全匹配的域名
    if (DOMAIN_ICON_MAPPING[domain]) {
      return DOMAIN_ICON_MAPPING[domain]
    }
    
    // 查找部分匹配（例如，对于 subdomain.example.com，查找 example.com）
    const parts = domain.split('.')
    if (parts.length >= 2) {
      const rootDomain = parts.slice(-2).join('.')
      if (DOMAIN_ICON_MAPPING[rootDomain]) {
        return DOMAIN_ICON_MAPPING[rootDomain]
      }
    }
    
    // 特殊模式匹配
    if (domain.includes('github')) return 'github'
    if (domain.includes('twitter') || domain.includes('x.com')) return 'twitter'
    if (domain.includes('youtube')) return 'youtube'
    if (domain.includes('google')) return 'google'
    if (domain.includes('amazon')) return 'amazon'
    if (domain.includes('netflix')) return 'netflix'
    if (domain.includes('apple')) return 'apple'
    if (domain.includes('microsoft')) return 'microsoft'
    if (domain.includes('bitget')) return 'bitget'
    if (domain.includes('binance')) return 'binance'
    if (domain.includes('okx')) return 'okx'
    if (domain.includes('coinbase')) return 'coinbase'
    if (domain.includes('crypto')) return 'crypto'
    
    // 默认返回链接图标
    return 'link'
  } catch (error) {
    console.warn('Error detecting icon from URL:', error)
    return 'link'
  }
}

// 根据URL自动检测标题
export const detectTitleFromUrl = (url: string): string => {
  try {
    if (!url) return '新链接'
    
    // 解析URL获取域名
    let domain: string
    try {
      const urlObj = new URL(url)
      domain = urlObj.hostname.toLowerCase()
    } catch {
      // 如果URL解析失败，尝试简单处理
      const match = url.match(/^(https?:\/\/)?([^\/]+)/i)
      domain = match ? match[2].toLowerCase() : url.toLowerCase()
    }
    
    // 移除 www. 前缀
    if (domain.startsWith('www.')) {
      domain = domain.substring(4)
    }
    
    // 查找完全匹配的域名
    if (DOMAIN_TITLE_MAPPING[domain]) {
      return DOMAIN_TITLE_MAPPING[domain]
    }
    
    // 查找部分匹配（例如，对于 subdomain.example.com，查找 example.com）
    const parts = domain.split('.')
    if (parts.length >= 2) {
      const rootDomain = parts.slice(-2).join('.')
      if (DOMAIN_TITLE_MAPPING[rootDomain]) {
        return DOMAIN_TITLE_MAPPING[rootDomain]
      }
    }
    
    // 特殊模式匹配
    if (domain.includes('github')) return 'GitHub'
    if (domain.includes('twitter') || domain.includes('x.com')) return 'X (Twitter)'
    if (domain.includes('youtube')) return 'YouTube'
    if (domain.includes('google')) return 'Google'
    if (domain.includes('amazon')) return 'Amazon'
    if (domain.includes('netflix')) return 'Netflix'
    if (domain.includes('apple')) return 'Apple'
    if (domain.includes('microsoft')) return 'Microsoft'
    if (domain.includes('bitget')) return 'Bitget'
    if (domain.includes('binance')) return 'Binance'
    if (domain.includes('okx')) return 'OKX'
    if (domain.includes('coinbase')) return 'Coinbase'
    if (domain.includes('crypto')) return 'Crypto.com'
    if (domain.includes('meta')) return 'MetaMask'
    
    // 默认返回域名首字母大写
    const domainName = domain.split('.')[0]
    return domainName.charAt(0).toUpperCase() + domainName.slice(1)
  } catch (error) {
    console.warn('Error detecting title from URL:', error)
    return '新链接'
  }
}

// 根据推特handle获取头像URL
export const getTwitterAvatarUrl = (handle: string): string => {
  if (!handle) return ''
  // 移除@符号（如果用户输入了）
  const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle
  // 使用推特头像API，返回原始尺寸图片
  return `https://unavatar.io/twitter/${cleanHandle}`
}

// 获取用户头像URL (支持 IPFS)
export const getUserAvatarUrl = (user: User): string => {
  // 优先级：IPFS 头像 > 传统头像 > 推特头像
  if (user.avatarUrl) {
    return user.avatarUrl.startsWith('http') ? user.avatarUrl : `https://ipfs.io/ipfs/${user.avatarUrl}`
  }
  if (user.twitterHandle) {
    return getTwitterAvatarUrl(user.twitterHandle)
  }
  return ''
}

// 检查用户名是否可以修改
export const canChangeUsername = (user: User): boolean => {
  const currentYear = new Date().getFullYear()
  const lastChangeYear = user.lastUsernameChangeYear || 0
  
  // 如果今年没有修改过，或者从未修改过
  if (lastChangeYear !== currentYear) {
    return true
  }
  
  // 如果今年已经修改过，检查修改次数
  const changeCount = user.usernameChangeCount || 0
  return changeCount < 1  // 每年只能修改一次
}

// 验证昵称长度（最多8个中文字符）
export const validateNickname = (nickname: string): boolean => {
  if (!nickname) return true  // 空昵称允许
  
  // 计算中文字符长度
  const chineseCharCount = (nickname.match(/[\u4e00-\u9fa5]/g) || []).length
  const otherCharCount = nickname.length - chineseCharCount
  
  // 中文字符算1个，其他字符算0.5个，总长度不超过8
  const totalLength = chineseCharCount + (otherCharCount * 0.5)
  return totalLength <= 8
}

const genId = () => 'id_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36)

// 临时使用 localStorage 作为后备方案
const localStorageKey = (username: string) => `catcat_blog_${username}`

const setLocalData = (username: string, data: { user: User; links: Link[]; groups: LinkGroup[] }) => {
  try {
    localStorage.setItem(localStorageKey(username), JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

const getLocalData = (username: string): { user: User; links: Link[]; groups: LinkGroup[] } | null => {
  try {
    const data = localStorage.getItem(localStorageKey(username))
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export const api = {
  getUserByUsername: async (username: string): Promise<{ user: User; links: Link[]; groups: LinkGroup[] } | null> => {
    try {
      console.log('尝试从 API 获取用户数据:', username)
      const response = await fetch(`${API_BASE}/user?username=${encodeURIComponent(username)}`)
      
      if (response.status === 404) {
        console.log('API 返回 404，尝试从 localStorage 获取')
        return getLocalData(username)
      }
      
      if (!response.ok) {
        console.log('API 请求失败，使用 localStorage 后备方案')
        return getLocalData(username)
      }
      
      const data = await response.json()
      console.log('API 获取数据成功:', data)
      return data
    } catch (error) {
      console.error('API 请求出错，使用 localStorage 后备方案:', error)
      return getLocalData(username)
    }
  },

  createUser: async (username: string, walletAddress?: string): Promise<User> => {
    const newUser: User = {
      id: genId(),
      walletAddress: walletAddress || '0x0000',
      username,
      twitterHandle: '',
      themeId: 1,
      avatarUrl: '',
      bio: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      console.log('尝试创建用户:', username)
      const response = await fetch(`${API_BASE}/user?username=${encodeURIComponent(username)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: newUser,
          userLinks: []
        })
      })

      if (!response.ok) {
        console.log('API 创建用户失败，保存到 localStorage')
        const data = { user: newUser, links: [], groups: [] }
        setLocalData(username, data)
        return newUser
      }

      const result = await response.json()
      console.log('API 创建用户成功:', result)
      return result.user
    } catch (error) {
      console.error('API 创建用户出错，保存到 localStorage:', error)
      const data = { user: newUser, links: [], groups: [] }
      setLocalData(username, data)
      return newUser
    }
  },

  updateUser: async (username: string, user: Partial<User>): Promise<User> => {
    try {
      console.log('尝试更新用户:', username, user)
      const response = await fetch(`${API_BASE}/user?username=${encodeURIComponent(username)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user,
          userLinks: undefined
        })
      })

      if (!response.ok) {
        console.log('API 更新用户失败，更新 localStorage')
        const localData = getLocalData(username)
        if (localData) {
          const updatedUser = { ...localData.user, ...user, updatedAt: new Date().toISOString() }
          setLocalData(username, { user: updatedUser, links: localData.links, groups: localData.groups })
          return updatedUser
        }
        throw new Error('Failed to update user')
      }

      const result = await response.json()
      console.log('API 更新用户成功:', result)
      return result.user
    } catch (error) {
      console.error('API 更新用户出错，更新 localStorage:', error)
      const localData = getLocalData(username)
      if (localData) {
        const updatedUser = { ...localData.user, ...user, updatedAt: new Date().toISOString() }
        setLocalData(username, { user: updatedUser, links: localData.links, groups: localData.groups })
        return updatedUser
      }
      throw error
    }
  },

  updateLinks: async (username: string, userLinks: Link[]): Promise<void> => {
    try {
      console.log('尝试更新链接:', username, userLinks)
      const response = await fetch(`${API_BASE}/user?username=${encodeURIComponent(username)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: undefined,
          userLinks
        })
      })

      if (!response.ok) {
        console.log('API 更新链接失败，更新 localStorage')
        const localData = getLocalData(username)
        if (localData) {
          setLocalData(username, { user: localData.user, links: userLinks, groups: localData.groups })
        }
        return
      }

      console.log('API 更新链接成功')
    } catch (error) {
      console.error('API 更新链接出错，更新 localStorage:', error)
      const localData = getLocalData(username)
      if (localData) {
        setLocalData(username, { user: localData.user, links: userLinks, groups: localData.groups })
      }
    }
  },

  updateGroups: async (username: string, userGroups: LinkGroup[]): Promise<void> => {
    try {
      console.log('尝试更新分组:', username, userGroups)
      const response = await fetch(`${API_BASE}/user?username=${encodeURIComponent(username)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: undefined,
          userLinks: undefined,
          userGroups
        })
      })

      if (!response.ok) {
        console.log('API 更新分组失败，更新 localStorage')
        const localData = getLocalData(username)
        if (localData) {
          setLocalData(username, { user: localData.user, links: localData.links, groups: userGroups })
        }
        return
      }

      console.log('API 更新分组成功')
    } catch (error) {
      console.error('API 更新分组出错，更新 localStorage:', error)
      const localData = getLocalData(username)
      if (localData) {
        setLocalData(username, { user: localData.user, links: localData.links, groups: userGroups })
      }
    }
  }
}

export const generateUser = (username: string): User => {
  return {
    id: genId(),
    walletAddress: '0x0000',
    username,
    twitterHandle: '',
    themeId: 1,
    avatarUrl: '',
    bio: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}
