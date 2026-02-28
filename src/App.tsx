import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const hostname = window.location.hostname

    if (hostname === 'i.catcat.meme') {
      navigate('/i', { replace: true })
    } else if (hostname !== 'catcat.meme' && hostname !== 'www.catcat.meme' && hostname.endsWith('.catcat.meme')) {
      const username = hostname.replace('.catcat.meme', '')
      navigate(`/${username}`, { replace: true })
    }
    
    setReady(true)
  }, [navigate])

  if (!ready) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/i" element={<BlogHome />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/:username" element={<UserProfile />} />
    </Routes>
  )
}

function App() {
  return <SubdomainRouter />
}

export default App
