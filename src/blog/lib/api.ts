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
  order: number
  createdAt: string
  updatedAt: string
}

const genId = () => 'id_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36)

export const api = {
  getUserByUsername: async (username: string): Promise<{ user: User; links: Link[] } | null> => {
    try {
      const response = await fetch(`${API_BASE}/user?username=${encodeURIComponent(username)}`)
      if (response.status === 404) return null
      if (!response.ok) throw new Error('Failed to fetch user')
      return await response.json()
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  },

  createUser: async (username: string, walletAddress?: string): Promise<User> => {
    const newUser: User = {
      id: genId(),
      walletAddress: walletAddress || '0x0000', // 如果没有提供钱包地址，使用默认值
      username,
      twitterHandle: '',
      themeId: 1,
      avatarUrl: '',
      bio: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
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

      if (!response.ok) throw new Error('Failed to create user')
      const result = await response.json()
      return result.user
    } catch (error) {
      console.error('Error creating user:', error)
      // 如果 API 失败，返回本地创建的用户
      return newUser
    }
  },

  updateUser: async (username: string, user: Partial<User>): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE}/user?username=${encodeURIComponent(username)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user,
          userLinks: undefined // 不更新链接
        })
      })

      if (!response.ok) throw new Error('Failed to update user')
      const result = await response.json()
      return result.user
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  updateLinks: async (username: string, userLinks: Link[]): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/user?username=${encodeURIComponent(username)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: undefined, // 不更新用户信息
          userLinks
        })
      })

      if (!response.ok) throw new Error('Failed to update links')
    } catch (error) {
      console.error('Error updating links:', error)
      throw error
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
