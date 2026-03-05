const API_BASE = 'https://www.catcat.meme/api/user-kv'

export interface User {
  id: string
  walletAddress: string
  username: string
  twitterHandle?: string
  themeId: number
  avatarUrl?: string
  bio?: string
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
