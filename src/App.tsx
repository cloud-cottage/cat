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
import EditBlog from './blog/pages/EditBlog'

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
  const [page, setPage] = useState<'home' | 'blog' | 'user' | 'edit'>('home')
  const [username, setUsername] = useState<string>('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const hostname = window.location.hostname
    const pathname = window.location.pathname

    console.log('SubdomainRouter:', { hostname, pathname })

    // 检查是否访问 setup 页面
    if (pathname === '/setup') {
      console.log('SubdomainRouter: detected /setup path, using Routes')
      setPage('home') // 让 Routes 处理 setup
    } else if (pathname.endsWith('/edit')) {
      console.log('SubdomainRouter: detected /edit path, setting edit page')
      setPage('edit') // 设置为编辑页面
    } else if (hostname === 'i.catcat.meme') {
      console.log('SubdomainRouter: detected i.catcat.meme, showing BlogHome')
      setPage('blog')
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // 本地开发环境，默认显示博客页面
      console.log('SubdomainRouter: localhost, showing BlogHome')
      setPage('blog')
    } else if (hostname !== 'catcat.meme' && 
               hostname !== 'www.catcat.meme' &&
               (hostname.endsWith('.catcat.meme') || hostname.includes('.localhost'))) {
      // 用户子域名，提取用户名
      const extractedUsername = hostname.includes('.localhost') 
        ? hostname.replace('.localhost', '')
        : hostname.replace('.catcat.meme', '')
      console.log('SubdomainRouter: user subdomain detected:', extractedUsername)
      setUsername(extractedUsername)
      setPage('user')
    } else {
      console.log('SubdomainRouter: default, showing HomePage')
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

  if (page === 'edit') {
    // 编辑页面：直接显示编辑页面，传递用户名
    return <EditBlog />
  }

  // 只有在主页或博客页面时才使用 Routes
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/i" element={<BlogHome />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/:user/edit" element={<EditBlog />} />
      <Route path="/:user" element={<UserProfile />} />
    </Routes>
  )
}

function App() {
  return <SubdomainRouter />
}

export default App
