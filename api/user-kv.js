import { Redis } from '@upstash/redis'

// 使用正确的环境变量
const redis = new Redis({
  url: 'https://sound-asp-64435.upstash.io',
  token: 'AfuzAAIncDFkNDFmZGIwYzNmMWQ0YjZiYjFlNjYzYjQ0NzIxZTBjNHAxNjQ0MzU',
})

export default async function handler(req, res) {
  // 添加 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { username } = req.query
  
  if (req.method === 'GET') {
    try {
      console.log('Getting user data for:', username)
      
      // 获取用户信息
      const userKey = `user:${username}`
      const linksKey = `links:${username}`
      const groupsKey = `groups:${username}`
      
      const user = await redis.hgetall(userKey)
      const rawLinks = await redis.lrange(linksKey, 0, -1)
      const rawGroups = await redis.lrange(groupsKey, 0, -1)
      
      console.log('Raw user data:', user)
      console.log('Raw links data:', rawLinks)
      
      if (!user || Object.keys(user).length === 0) {
        return res.status(404).json({ error: 'User not found' })
      }
      
      // 安全解析链接数据
      let parsedLinks = []
      if (rawLinks && rawLinks.length > 0) {
        parsedLinks = rawLinks.map(link => {
          try {
            return typeof link === 'string' ? JSON.parse(link) : link
          } catch (e) {
            console.error('Error parsing link:', link, e)
            return null
          }
        }).filter(Boolean)
      }
      
      // 安全解析分组数据
      let parsedGroups = []
      if (rawGroups && rawGroups.length > 0) {
        parsedGroups = rawGroups.map(group => {
          try {
            return typeof group === 'string' ? JSON.parse(group) : group
          } catch (e) {
            console.error('Error parsing group:', group, e)
            return null
          }
        }).filter(Boolean)
      }
      
      console.log('Parsed links:', parsedLinks)
      console.log('Parsed groups:', parsedGroups)
      
      res.json({ user, links: parsedLinks, groups: parsedGroups })
    } catch (error) {
      console.error('Error fetching user:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const { user, userLinks, userGroups } = req.body
      
      console.log('Updating user data for:', username)
      console.log('User update:', user)
      console.log('Links update:', userLinks)
      console.log('Groups update:', userGroups)
      
      if (user && user !== undefined && user !== null) {
        // 更新用户信息
        const userKey = `user:${username}`
        
        if (!await redis.exists(userKey)) {
          // 新用户，设置创建时间
          user.createdAt = new Date().toISOString()
        }
        
        user.updatedAt = new Date().toISOString()
        
        // 使用 hash 存储用户信息
        await redis.hmset(userKey, user)
        console.log('User data saved successfully')
      }
      
      if (userLinks && userLinks !== undefined && userLinks !== null && userLinks.length > 0) {
        // 更新用户链接
        const linksKey = `links:${username}`
        
        // 先删除旧的链接
        await redis.del(linksKey)
        
        // 添加新的链接
        if (userLinks.length > 0) {
          const linkStrings = userLinks.map(link => JSON.stringify(link))
          await redis.lpush(linksKey, ...linkStrings)
          console.log('Links data saved successfully')
        }
      }
      
      if (userGroups && userGroups !== undefined && userGroups !== null && userGroups.length > 0) {
        // 更新用户分组
        const groupsKey = `groups:${username}`
        
        // 先删除旧的分组
        await redis.del(groupsKey)
        
        // 添加新的分组
        if (userGroups.length > 0) {
          const groupStrings = userGroups.map(group => JSON.stringify(group))
          await redis.lpush(groupsKey, ...groupStrings)
          console.log('Groups data saved successfully')
        }
      }
      
      res.json({ success: true })
    } catch (error) {
      console.error('Error updating user:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
