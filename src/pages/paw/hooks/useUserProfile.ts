import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { api, type User, type Link } from '../lib/api'
import { THEMES } from '../../../themes'

interface UserProfileProps {
  username?: string
}

type LayoutModule = NonNullable<User['layout']>['modules'][number]

export const useUserProfile = ({ username: propUsername }: UserProfileProps) => {
  const { username: routeUsername } = useParams<{ username: string }>()
  const username = propUsername || routeUsername
  const { address } = useAccount()
  
  // 状态管理
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [currentTheme, setCurrentTheme] = useState(THEMES[0])
  const [layoutModules, setLayoutModules] = useState<LayoutModule[]>([])
  const [isOwner, setIsOwner] = useState(false)

  // 刷新用户数据
  const refreshUser = async () => {
    if (!username) return
    try {
      const userData = await api.getUserByUsername(username)
      if (userData) {
        setUser(userData.user)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  // 加载用户数据
  useEffect(() => {
    if (!username) return // 简化条件，只检查username
    
    const loadUserData = async () => {
      try {
        let userData = await api.getUserByUsername(username)
        if (!userData) {
          if (address) {
            const newUser = await api.createUser(username, address)
            userData = { user: newUser, links: [], groups: [] }
          } else {
            // 如果没有用户数据也没有钱包地址，创建默认展示
            console.log('No user data and no wallet, creating default display')
            const defaultUser: User = {
              id: 'default',
              walletAddress: '0x0000000000000000000000000000000000000000',
              username: username,
              nickname: username,
              themeId: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
            setUser(defaultUser)
            setLinks([])
            setCurrentTheme(THEMES[0]) // 赛博橙主题作为默认
            setLayoutModules([
              { id: 'profile', name: '用户资料', component: 'profile', position: { x: 0, y: 0 }, size: { width: 3, height: 2 } },
              { id: 'mostfind', name: '我活跃在', component: 'mostfind', position: { x: 0, y: 2 }, size: { width: 2, height: 2 } },
              { id: 'links', name: '注册链接', component: 'links', position: { x: 2, y: 2 }, size: { width: 4, height: 4 } },
              { id: 'social', name: '社交媒体', component: 'social', position: { x: 3, y: 0 }, size: { width: 3, height: 2 } },
              { id: 'twitter', name: '推特动态', component: 'twitter', position: { x: 0, y: 6 }, size: { width: 6, height: 4 } }
            ])
            document.title = `${username}｜CAT｜Your Web3 Paws`
            setLoading(false)
            return
          }
        }
        
        if (!userData) return
        
        setUser(userData.user)
        setLinks(userData.links)
        if (userData.user.layout) {
          const theme = THEMES.find((t: typeof THEMES[0]) => t.id === userData.user.layout!.themeId)
          if (theme) {
            setCurrentTheme(theme)
            setLayoutModules(userData.user.layout.modules || [])
          }
        } else {
          setCurrentTheme(THEMES[0]) // 赛博橙主题作为默认
          // 设置默认模块布局
          setLayoutModules([
            { id: 'profile', name: '用户资料', component: 'profile', position: { x: 0, y: 0 }, size: { width: 3, height: 2 } },
            { id: 'mostfind', name: '我活跃在', component: 'mostfind', position: { x: 0, y: 2 }, size: { width: 2, height: 2 } },
            { id: 'links', name: '注册链接', component: 'links', position: { x: 2, y: 2 }, size: { width: 4, height: 4 } },
            { id: 'social', name: '社交媒体', component: 'social', position: { x: 3, y: 0 }, size: { width: 3, height: 2 } },
            { id: 'twitter', name: '推特动态', component: 'twitter', position: { x: 0, y: 6 }, size: { width: 6, height: 4 } }
          ])
        }
        document.title = `${userData.user.nickname || userData.user.username}｜CAT｜Your Web3 Paws`
        setIsOwner(!!(address && address.toLowerCase() === userData.user.walletAddress.toLowerCase()) || true) // 测试阶段让所有人都是所有者
      } catch (error) {
        console.error('Error loading user:', error)
        // 如果用户不存在，创建一个默认用户展示
        console.log('Creating default user for:', username)
        const defaultUser: User = {
          id: 'default',
          walletAddress: '0x0000000000000000000000000000000000000000',
          username: username,
          nickname: username,
          themeId: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setUser(defaultUser)
        setLinks([])
        setCurrentTheme(THEMES[0]) // 赛博橙主题作为默认
        setLayoutModules([
          { id: 'profile', name: '用户资料', component: 'profile', position: { x: 0, y: 0 }, size: { width: 3, height: 2 } },
          { id: 'mostfind', name: '我活跃在', component: 'mostfind', position: { x: 0, y: 2 }, size: { width: 2, height: 2 } },
          { id: 'links', name: '注册链接', component: 'links', position: { x: 2, y: 2 }, size: { width: 4, height: 4 } },
          { id: 'social', name: '社交媒体', component: 'social', position: { x: 3, y: 0 }, size: { width: 3, height: 2 } },
          { id: 'twitter', name: '推特动态', component: 'twitter', position: { x: 0, y: 6 }, size: { width: 6, height: 4 } }
        ])
        document.title = `${username}｜CAT｜Your Web3 Paws`
        setIsOwner(true) // 测试阶段让所有人都是所有者
      } finally {
        setLoading(false)
      }
    }
    
    loadUserData()
  }, [username, address]) // 移除modulesInitialized避免循环

  return {
    loading,
    user,
    links,
    currentTheme,
    layoutModules,
    isOwner,
    setCurrentTheme,
    setLayoutModules,
    refreshUser
  }
}
