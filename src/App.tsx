import { Routes, Route, useLocation } from 'react-router-dom'
import './index.css'
import './i18n'
import './pages/paw/styles/globals.css'
import BlogHomePage from './pages/member/BlogHomePage'
import SetupPage from './pages/member/SetupPage'
import ProfilePage from './pages/paw/ProfilePage'
import DashboardPage from './pages/admin/DashboardPage'
import HomePage from './pages/home/HomePage'

type RoutedPage = 'home' | 'blog' | 'user' | 'admin'

function resolveSubdomainRoute(hostname: string, pathname: string): {
  page: RoutedPage
  username?: string
} {
  if (pathname === '/admin') {
    return { page: 'admin' }
  }

  if (pathname === '/setup') {
    return { page: 'home' }
  }

  if (hostname === 'i.catcat.meme' || hostname === 'localhost' || hostname === '127.0.0.1') {
    return { page: 'blog' }
  }

  if (
    hostname !== 'catcat.meme' &&
    hostname !== 'www.catcat.meme' &&
    (hostname.endsWith('.catcat.meme') || hostname.includes('.localhost'))
  ) {
    const username = hostname.includes('.localhost')
      ? hostname.replace('.localhost', '')
      : hostname.replace('.catcat.meme', '')

    return { page: 'user', username }
  }

  return { page: 'home' }
}

function SubdomainRouter() {
  const location = useLocation()
  const { page, username } = resolveSubdomainRoute(window.location.hostname, location.pathname)

  if (page === 'blog') {
    return <BlogHomePage />
  }

  if (page === 'user' && username) {
    // 用户子域名：直接显示用户页面，不使用 React Router
    return <ProfilePage username={username} />
  }

  if (page === 'admin') {
    // 管理面板：直接显示管理面板
    return <DashboardPage />
  }

  // 只有在主页或博客页面时才使用 Routes
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/i" element={<BlogHomePage />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/admin" element={<DashboardPage />} />
      <Route path="/:username" element={<ProfilePage />} />
    </Routes>
  )
}

function App() {
  return <SubdomainRouter />
}

export default App
