import React from 'react';
import { motion } from 'framer-motion';

interface FriendLink {
    id: number;
    name: string;
    url: string;
    imageUrl: string;
}

const friendLinksData: FriendLink[] = [
    {
        id: 1,
        name: '锦鱼社区',
        url: 'https://jinlibenli.com',
        imageUrl: '/images/Jinli_banner.png',
    },
    {
        id: 2,
        name: 'Ethereum Foundation',
        url: 'https://ethereum.org',
        imageUrl: '/images/ETH_banner.png',
    },
    {
        id: 3,
        name: '云算准备计划',
        url: 'https://www.yunduojihua.com',
        imageUrl: '/images/CloudPlan_banner.png',
    },
    {
        id: 4,
        name: 'Partner 4',
        url: '#',
        imageUrl: 'https://via.placeholder.com/160x50/FF6B6B/FFFFFF?text=Partner+4',
    },
];

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer style={styles.footer}>
            <div className="container">
                {/* Friend Links Section */}
                <div style={styles.linksSection}>
                    <div style={styles.linksGrid}>
                        {friendLinksData.map((link, index) => (
                            <motion.a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                style={styles.linkItem}
                            >
                                <img 
                                    src={link.imageUrl} 
                                    alt={link.name}
                                    style={styles.linkImage}
                                    onError={(e) => {
                                        // Fallback if image fails to load
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/160x50/808080/FFFFFF?text=Logo';
                                    }}
                                />
                            </motion.a>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div style={styles.divider} />

                {/* Copyright */}
                <p style={styles.copyright}>
                    © {currentYear} CAT Crypto Ambassador Team. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    footer: {
        padding: '3rem 0 2rem',
        backgroundColor: 'var(--color-text-dark)',
        color: 'var(--color-bg)',
    },
    linksSection: {
        marginBottom: '2rem',
    },
    linksGrid: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap',
    },
    linkItem: {
        display: 'block',
        width: '160px',
        height: '50px',
        borderRadius: '4px',
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.1)',
        transition: 'transform 0.2s ease',
    },
    linkImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
    },
    divider: {
        width: '100%',
        height: '1px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        margin: '2rem 0',
    },
    copyright: {
        textAlign: 'center',
        opacity: 0.7,
        fontSize: '0.9rem',
    }
};

export default Footer;