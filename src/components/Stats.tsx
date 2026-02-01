import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';

interface AnimatedNumberProps {
    value: string;
    duration?: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, duration = 2 }) => {
    const [displayValue, setDisplayValue] = useState('0');
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    
    useEffect(() => {
        if (!isInView) return;
        
        // Parse the value to extract numeric part and suffix
        const match = value.match(/^([^\d]*)([\d,]+)([^\d]*)$/);
        if (!match) {
            setDisplayValue(value);
            return;
        }
        
        const prefix = match[1]; // e.g., "$"
        const targetNum = parseInt(match[2].replace(/,/g, ''), 10); // e.g., 2500000
        const suffix = match[3]; // e.g., "+"
        
        const startTime = Date.now();
        const animate = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentNum = Math.floor(targetNum * easeOut);
            
            // Format with commas
            const formatted = currentNum.toLocaleString('en-US');
            setDisplayValue(`${prefix}${formatted}${suffix}`);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }, [isInView, value, duration]);
    
    return <span ref={ref}>{displayValue}</span>;
};

const Stats: React.FC = () => {
    const { t } = useTranslation();

    const statsData = [
        { label: t('stats.totalComp'), value: '$2,500,000+', duration: 2.5 },
        { label: t('stats.monthlyComp'), value: '$450,000', duration: 2 },
        { label: t('stats.members'), value: '1,280', duration: 1.5 },
        { label: t('stats.partners'), value: '85', duration: 1 },
    ];

    return (
        <section style={styles.stats}>
            <div className="container">
                <div style={styles.grid}>
                    {statsData.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{
                                scale: 1.05,
                                rotateX: index % 2 === 0 ? 5 : -5,
                                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                            }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            style={styles.card}
                        >
                            <motion.h3
                                initial={{ scale: 0.8 }}
                                whileInView={{ scale: 1 }}
                                style={styles.value}
                            >
                                <AnimatedNumber value={stat.value} duration={stat.duration} />
                            </motion.h3>
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
