import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Stats: React.FC = () => {
    const { t } = useTranslation();

    const statsData = [
        { label: t('stats.totalComp'), value: '$2,500,000+' },
        { label: t('stats.monthlyComp'), value: '$450,000' },
        { label: t('stats.members'), value: '1,280' },
        { label: t('stats.partners'), value: '85' },
    ];

    return (
        <section style={styles.stats}>
            <div className="container">
                <div style={styles.grid}>
                    {statsData.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            style={styles.card}
                        >
                            <h3 style={styles.value}>{stat.value}</h3>
                            <p style={styles.label}>{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    stats: {
        padding: '4rem 0',
        backgroundColor: 'var(--color-white)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '2rem',
    },
    card: {
        textAlign: 'center',
        padding: '2rem',
        borderRadius: 'var(--radius)',
        backgroundColor: 'var(--color-bg)',
        border: '1px solid rgba(0,0,0,0.03)',
    },
    value: {
        fontSize: '2.5rem',
        fontWeight: 800,
        color: 'var(--color-text-dark)',
        marginBottom: '0.5rem',
    },
    label: {
        fontSize: '1rem',
        fontWeight: 600,
        color: 'var(--color-text-light)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    }
};

/* Media Query Support (Inline for simple demo) */
if (typeof window !== 'undefined' && window.innerWidth < 768) {
    // @ts-ignore
    styles.grid.gridTemplateColumns = 'repeat(2, 1fr)';
}

export default Stats;
