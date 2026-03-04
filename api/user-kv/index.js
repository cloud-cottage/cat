import { Redis } from '@upstash/redis'

// 使用 cat_KV 环境变量
const redis = new Redis({
  url: process.env.cat_KV_REST_API_URL,
  token: process.env.cat_KV_REST_API_TOKEN,
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
      console.log('Redis URL:', process.env.cat_KV_REST_API_URL)
      console.log('Redis Token exists:', !!process.env.cat_KV_REST_API_TOKEN)
      
      // 获取用户信息
      const userKey = `user:${username}`
      const linksKey = `links:${username}`
      
      const user = await redis.hgetall(userKey)
      const links = await redis.lrange(linksKey, 0, -1)
      
      console.log('User data:', user)
      console.log('Links data:', links)
      
      if (!user || Object.keys(user).length === 0) {
        return res.status(404).json({ error: 'User not found' })
      }
      
      // 解析链接数据
      const parsedLinks = links.map(link => JSON.parse(link))
      
      res.json({ user, links: parsedLinks })
    } catch (error) {
      console.error('Error fetching user:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    try {
      const { user, userLinks } = req.body
      
      console.log('Updating user data for:', username)
      console.log('User update:', user)
      console.log('Links update:', userLinks)
      
      if (user) {
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
      
      if (userLinks) {
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
