import React from 'react';
import './index.css';
import './i18n';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import MouseGlow from './components/MouseGlow';
import ValueProp from './components/ValueProp';
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();

  return (
    <div className="App">
      <MouseGlow />
      <Navbar />
      <main>
        <Hero />
        <ValueProp />
        <Stats />
      </main>

      {/* Simple Footer */}
      <footer style={styles.footer}>
        <div className="container">
          <p style={styles.footerText}>
            {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  footer: {
    padding: '4rem 0',
    backgroundColor: 'var(--color-text-dark)',
    color: 'var(--color-bg)',
    textAlign: 'center',
  },
  footerText: {
    opacity: 0.7,
    fontSize: '0.9rem',
  }
};

export default App;
