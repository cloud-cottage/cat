import React from 'react';
import { motion } from 'framer-motion';

interface Partner {
    id: number;
    name: string;
    url: string;
    imageUrl: string;
}

const partnersData: Partner[] = [
    {
        id: 1,
        name: 'Ethereum Foundation',
        url: 'https://ethereum.org',
        imageUrl: '/images/ethereum-foundation.png',
    },
    {
        id: 2,
        name: 'Uniswap Labs',
        url: 'https://uniswap.org',
        imageUrl: 'https://via.placeholder.com/320x100/FF007A/FFFFFF?text=Uniswap',
    },
    {
        id: 3,
        name: 'OpenSea',
        url: 'https://opensea.io',
        imageUrl: 'https://via.placeholder.com/320x100/2081E2/FFFFFF?text=OpenSea',
    },
    {
        id: 4,
        name: 'MetaMask',
        url: 'https://metamask.io',
        imageUrl: 'https://via.placeholder.com/320x100/F6851B/FFFFFF?text=MetaMask',
    },
];

const Partners: React.FC = () => {
    return (
        <section style={styles.section}>
            <div className="container">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={styles.title}
                >
                    Partners & Friends
                </motion.h2>
                
                <div style={styles.grid}>
                    {partnersData.map((partner, index) => (
                        <motion.a
                            key={partner.id}
                            href={partner.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ 
                                scale: 1.05,
                                boxShadow: '0 15px 35px rgba(0,0,0,0.15)'
                            }}
                            style={styles.card}
                        >
                            <div style={styles.imageContainer}>
                                <img 
                                    src={partner.imageUrl} 
                                    alt={partner.name}
                                    style={styles.image}
                                />
                            </div>
                            <p style={styles.partnerName}>{partner.name}</p>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    section: {
        padding: '5rem 0',
        backgroundColor: 'var(--color-bg)',
        borderTop: '1px solid rgba(0,0,0,0.05)',
    },
    title: {
        fontSize: '2rem',
        fontWeight: 700,
        color: 'var(--color-text-dark)',
        textAlign: 'center',
        marginBottom: '3rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textDecoration: 'none',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        backgroundColor: 'var(--color-white)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    imageContainer: {
        width: '320px',
        height: '100px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    partnerName: {
        padding: '1rem',
        fontSize: '0.95rem',
        fontWeight: 600,
        color: 'var(--color-text-dark)',
        textAlign: 'center',
    },
};

/* Responsive */
if (typeof window !== 'undefined') {
    if (window.innerWidth < 1024) {
        // @ts-ignore
        styles.grid.gridTemplateColumns = 'repeat(2, 1fr)';
    }
    if (window.innerWidth < 640) {
        // @ts-ignore
        styles.grid.gridTemplateColumns = '1fr';
    }
}

export default Partners;