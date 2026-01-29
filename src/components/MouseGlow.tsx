import React, { useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

const MouseGlow: React.FC = () => {
    const mouseX = useSpring(0, { stiffness: 100, damping: 20 });
    const mouseY = useSpring(0, { stiffness: 100, damping: 20 });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX - 250);
            mouseY.set(e.clientY - 250);
            if (!isVisible) setIsVisible(true);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isVisible, mouseX, mouseY]);

    return (
        <motion.div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 140, 66, 0.08) 0%, rgba(28, 110, 156, 0.03) 40%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: 0,
                translateX: mouseX,
                translateY: mouseY,
                opacity: isVisible ? 1 : 0,
            }}
        />
    );
};

export default MouseGlow;
