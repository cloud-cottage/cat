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
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const hostname = window.location.hostname

    // 处理开发环境和生产环境
    if (hostname === 'i.catcat.meme' || hostname === 'localhost') {
      setPage('blog')
    } else if (hostname !== 'catcat.meme' && 
               hostname !== 'www.catcat.meme' && 
               hostname !== 'localhost' &&
               (hostname.endsWith('.catcat.meme') || hostname.includes('.localhost'))) {
      // 用户子域名，直接渲染 UserProfile 组件
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
    return <UserProfile />
  }

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
