type User = {
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

type Link = {
  id: string
  userId: string
  label: string
  url: string
  description?: string
  order: number
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY_USERS = 'cat_blog_users'
const STORAGE_KEY_LINKS = 'cat_blog_links'

const genId = () => 'id_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36)

const loadFromStorage = <T>(key: string): Map<string, T[]> => {
  try {
    const data = localStorage.getItem(key)
    if (data) {
      const arr: [string, T[]][] = JSON.parse(data)
      return new Map(arr)
    }
  } catch (e) {
    console.error('Error loading from storage:', e)
  }
  return new Map()
}

const saveToStorage = <T>(key: string, map: Map<string, T[]>) => {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(map.entries())))
  } catch (e) {
    console.error('Error saving to storage:', e)
  }
}

export const db = {
  getUserByUsername: (username: string): User | null => {
    const users = loadFromStorage<User>(STORAGE_KEY_USERS)
    for (const u of users.values()) {
      if (u[0]?.username === username) return u[0]
    }
    return null
  },

  getUserById: (id: string): User | null => {
    const users = loadFromStorage<User>(STORAGE_KEY_USERS)
    for (const userArray of users.values()) {
      const found = userArray.find(u => u.id === id)
      if (found) return found
    }
    return null
  },

  createUser: (user: User): User => {
    const users = loadFromStorage<User>(STORAGE_KEY_USERS)
    users.set(user.id, [user])
    saveToStorage(STORAGE_KEY_USERS, users)
    return user
  },

  updateUser: (user: User): User => {
    const users = loadFromStorage<User>(STORAGE_KEY_USERS)
    const existing = users.get(user.id) || []
    const idx = existing.findIndex(u => u.id === user.id)
    if (idx >= 0) {
      existing[idx] = user
    } else {
      existing.push(user)
    }
    users.set(user.id, existing)
    saveToStorage(STORAGE_KEY_USERS, users)
    return user
  },

  getLinks: (userId: string): Link[] => {
    const allLinks = loadFromStorage<Link>(STORAGE_KEY_LINKS)
    const userLinks: Link[] = allLinks.get(userId) || []
    return [...userLinks].sort((a, b) => a.order - b.order)
  },

  addLink: (userId: string, link: Omit<Link, 'id' | 'userId' | 'order' | 'createdAt' | 'updatedAt'>): Link => {
    const allLinks = loadFromStorage<Link>(STORAGE_KEY_LINKS)
    const userLinks: Link[] = allLinks.get(userId) || []
    
    const newLink: Link = {
      ...link,
      id: genId(),
      userId,
      order: userLinks.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    userLinks.push(newLink)
    allLinks.set(userId, userLinks)
    saveToStorage(STORAGE_KEY_LINKS, allLinks)
    return newLink
  },

  deleteLink: (userId: string, linkId: string): void => {
    const allLinks = loadFromStorage<Link>(STORAGE_KEY_LINKS)
    const userLinks: Link[] = allLinks.get(userId) || []
    const filtered = userLinks.filter((l: Link) => l.id !== linkId)
    allLinks.set(userId, filtered)
    saveToStorage(STORAGE_KEY_LINKS, allLinks)
  },

  reorderLinks: (userId: string, links: Link[]): void => {
    const allLinks = loadFromStorage<Link>(STORAGE_KEY_LINKS)
    const reordered = links.map((l, i) => ({ ...l, order: i, updatedAt: new Date().toISOString() }))
    allLinks.set(userId, reordered)
    saveToStorage(STORAGE_KEY_LINKS, allLinks)
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

export type { User, Link }
