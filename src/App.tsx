import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './index.css'
import './i18n'
import './blog/styles/globals.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Stats from './components/Stats'
import MouseGlow from './components/MouseGlow'
import ValueProp from './components/ValueProp'
import Partners from './components/Partners'
import Footer from './components/Footer'
import { useTranslation } from 'react-i18next'
import { BlogHome, Setup, UserProfile } from './blog/pages'

function HomePage() {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    document.title = t('meta.title')
  }, [i18n.language, t])

  return (
    <div className="App">
      <MouseGlow />
      <Navbar />
      <main>
        <Hero />
        <ValueProp />
        <Stats />
      </main>
      <Partners />
      <Footer />
    </div>
  )
}

function SubdomainRouter() {
  const [page, setPage] = useState<'home' | 'blog' | 'user'>('home')
  const [username, setUsername] = useState<string>('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const hostname = window.location.hostname

    // 处理开发环境和生产环境
    if (hostname === 'i.catcat.meme') {
      setPage('blog')
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // 本地开发环境，默认显示博客页面
      setPage('blog')
    } else if (hostname !== 'catcat.meme' && 
               hostname !== 'www.catcat.meme' &&
               (hostname.endsWith('.catcat.meme') || hostname.includes('.localhost'))) {
      // 用户子域名，提取用户名
      const extractedUsername = hostname.includes('.localhost') 
        ? hostname.replace('.localhost', '')
        : hostname.replace('.catcat.meme', '')
      setUsername(extractedUsername)
      setPage('user')
    } else {
      setPage('home')
    }
    
    setReady(true)
  }, [])

  if (!ready) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
  }

  if (page === 'blog') {
    return <BlogHome />
  }

  if (page === 'user') {
    // 用户子域名：直接显示用户页面，不使用 React Router
    return <UserProfile username={username} />
  }

  // 只有在主页或博客页面时才使用 Routes
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/i" element={<BlogHome />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/:user" element={<UserProfile />} />
    </Routes>
  )
}

function App() {
  return <SubdomainRouter />
}

export default App
