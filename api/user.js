// 简单的用户数据存储 API
// 生产环境建议使用 Vercel KV 或外部数据库

let users = new Map()
let links = new Map()

export default function handler(req, res) {
  const { username } = req.query
  
  if (req.method === 'GET') {
    // 获取用户信息
    const user = users.get(username)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    const userLinks = links.get(username) || []
    res.json({ user, links: userLinks })
  } else if (req.method === 'POST') {
    // 创建或更新用户
    const { user, userLinks } = req.body
    
    if (!users.has(username)) {
      // 新用户，设置创建时间
      user.createdAt = new Date().toISOString()
    }
    
    user.updatedAt = new Date().toISOString()
    users.set(username, user)
    
    if (userLinks) {
      links.set(username, userLinks)
    }
    
    res.json({ success: true, user })
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
