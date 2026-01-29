import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Waves, BarChart3, Target } from 'lucide-react';

const ValueProp: React.FC = () => {
    const { t } = useTranslation();

    const props = [
        {
            id: 'closer',
            icon: <Waves size={32} color="var(--color-primary)" />,
            title: t('valueProp.closer.title'),
            text: t('valueProp.closer.text'),
        },
        {
            id: 'truer',
            icon: <BarChart3 size={32} color="var(--color-secondary)" />,
            title: t('valueProp.truer.title'),
            text: t('valueProp.truer.text'),
        },
        {
            id: 'effective',
            icon: <Target size={32} color="var(--color-primary)" />,
            title: t('valueProp.effective.title'),
            text: t('valueProp.effective.text'),
        },
    ];

    return (
        <section style={styles.section}>
            <div className="container">
                <div style={styles.grid}>
                    {props.map((prop, index) => (
                        <motion.div
                            key={prop.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            style={styles.card}
                        >
                            <div style={styles.iconWrapper}>
                                {prop.icon}
                            </div>
                            <h3 style={styles.title}>{prop.title}</h3>
                            <p style={styles.text}>{prop.text}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    section: {
        padding: '6rem 0',
        backgroundColor: 'var(--color-bg)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '3rem',
    },
    card: {
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'var(--color-white)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    iconWrapper: {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 140, 66, 0.1)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    title: {
        fontSize: '1.25rem',
        fontWeight: 700,
        color: 'var(--color-text-dark)',
        marginBottom: '1rem',
    },
    text: {
        fontSize: '1rem',
        color: 'var(--color-text-light)',
        lineHeight: 1.6,
    }
};

export default ValueProp;
