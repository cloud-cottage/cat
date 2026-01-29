import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section style={styles.hero}>
            {/* Background Pattern - Dot Matrix/Grid Style */}
            <div style={styles.bgOverlay} />

            <div className="container" style={styles.container}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={styles.content}
                >
                    <h2 style={styles.slogan}>{t('hero.slogan')}</h2>
                    <h1 style={styles.title}>{t('hero.title')}</h1>
                    <p style={styles.description}>{t('hero.description')}</p>

                    <div style={styles.ctaContainer}>
                        <button style={styles.primaryCta}>{t('hero.cta')}</button>
                        <button style={styles.secondaryCta}>{t('nav.governance')}</button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    hero: {
        padding: '8rem 0 6rem',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg)',
        textAlign: 'center',
    },
    bgOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(28, 110, 156, 0.05) 1px, transparent 0)`,
        backgroundSize: '40px 40px',
        zIndex: 1,
    },
    container: {
        position: 'relative',
        zIndex: 2,
    },
    content: {
        maxWidth: '800px',
        margin: '0 auto',
    },
    slogan: {
        fontSize: '1.25rem',
        fontWeight: 700,
        color: 'var(--color-primary)',
        marginBottom: '1rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
    },
    title: {
        fontSize: '4rem',
        fontWeight: 800,
        color: 'var(--color-text-dark)',
        lineHeight: 1.1,
        marginBottom: '1.5rem',
    },
    description: {
        fontSize: '1.25rem',
        color: 'var(--color-text-light)',
        marginBottom: '3rem',
        lineHeight: 1.6,
    },
    ctaContainer: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
    },
    primaryCta: {
        padding: '1rem 2.5rem',
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        borderRadius: 'var(--radius)',
        fontSize: '1.1rem',
        fontWeight: 700,
        boxShadow: 'var(--shadow-md)',
    },
    secondaryCta: {
        padding: '1rem 2.5rem',
        backgroundColor: 'transparent',
        color: 'var(--color-secondary)',
        border: '2px solid var(--color-secondary)',
        borderRadius: 'var(--radius)',
        fontSize: '1.1rem',
        fontWeight: 700,
    }
};

export default Hero;
