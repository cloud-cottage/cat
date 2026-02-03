import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ArrowUpRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Navbar: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <nav style={styles.nav}>
            <div className="container" style={styles.container}>
                <div style={styles.logo}>
                    <span style={styles.logoText}>CAT</span>
                    <span style={styles.logoSubtext}>Crypto Ambassador Team</span>
                </div>

                <div style={styles.links}>
                    <a href="https://docs.catcat.meme" target="_blank" rel="noopener noreferrer" style={styles.link}>
                        {t('nav.governance')} <ArrowUpRight size={14} />
                    </a>
                    <a href="https://docs.google.com/forms/d/e/1FAIpQLSeblTSdxCThVTDPda_hnae1Cp3163D4wmo-5nItBpRs7JS7zw/viewform?usp=dialog" target="_blank" rel="noopener noreferrer" style={styles.applyBtn}>
                        {t('nav.apply')}
                    </a>

                    <div style={styles.langSelector}>
                        <Globe size={18} />
                        <select
                            onChange={(e) => changeLanguage(e.target.value)}
                            value={i18n.language}
                            style={styles.select}
                        >
                            <option value="en">English</option>
                            <option value="zh">简体中文</option>
                            <option value="zh-TW">繁體中文</option>
                        </select>
                    </div>

                    <button
                        onClick={toggleTheme}
                        style={styles.themeToggle}
                        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    nav: {
        padding: '1.25rem 0',
        backgroundColor: 'rgba(248, 249, FA, 0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid rgba(0,0,0,0.05)',
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        display: 'flex',
        flexDirection: 'column',
        cursor: 'default',
    },
    logoText: {
        fontSize: '1.5rem',
        fontWeight: 800,
        color: 'var(--color-primary)',
        lineHeight: 1,
    },
    logoSubtext: {
        fontSize: '0.65rem',
        fontWeight: 600,
        color: 'var(--color-secondary)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
    },
    link: {
        fontSize: '0.9rem',
        fontWeight: 500,
        color: 'var(--color-text-dark)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
    },
    applyBtn: {
        padding: '0.6rem 1.25rem',
        backgroundColor: 'var(--color-secondary)',
        color: 'white',
        borderRadius: 'var(--radius)',
        fontSize: '0.9rem',
        fontWeight: 600,
        boxShadow: 'var(--shadow-sm)',
    },
    langSelector: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--color-text-dark)',
    },
    select: {
        border: 'none',
        background: 'none',
        fontSize: '0.85rem',
        fontWeight: 500,
        cursor: 'pointer',
        color: 'inherit',
        outline: 'none',
    },
    themeToggle: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--color-text-dark)',
        padding: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        transition: 'background-color 0.3s ease',
    }
};

export default Navbar;
