import React, { useEffect } from 'react';
import './index.css';
import './i18n';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import MouseGlow from './components/MouseGlow';
import ValueProp from './components/ValueProp';
import Partners from './components/Partners';
import Footer from './components/Footer';
import { useTranslation } from 'react-i18next';

function App() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t('meta.title');
  }, [i18n.language, t]);

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
  );
}

export default App;
