import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Navbar from '../../components/Navbar'
import Hero from '../../components/Hero'
import Stats from '../../components/Stats'
import Partners from '../../components/Partners'
import Footer from '../../components/Footer'

export default function HomePage() {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    document.title = t('meta.title')
  }, [i18n.language, t])

  return (
    <div className="App">
      <Navbar />
      <main>
        <Hero />
        <Stats />
      </main>
      <Partners />
      <Footer />
    </div>
  )
}
