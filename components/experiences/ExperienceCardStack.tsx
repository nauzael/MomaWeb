'use client';

import { CardStack, CardStackItem } from "@/components/ui/card-stack";
import { type Experience } from '@/lib/experience-service';
import { getImageUrl } from '@/lib/api-client';
import { useState, useEffect } from 'react';

interface ExperienceCardStackProps {
    experiences: Experience[];
}

export default function ExperienceCardStack({ experiences }: ExperienceCardStackProps) {
    const [config, setConfig] = useState({
        width: 350,
        height: 500,
        maxVisible: 7,
        spreadDeg: 30,
        overlap: 0.4
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const isMobile = width < 768;

            setConfig({
                width: isMobile ? Math.min(340, width - 40) : 350,
                height: isMobile ? 450 : 500, // Slightly shorter on mobile
                maxVisible: isMobile ? 3 : 7, // Show fewer cards on mobile to prevent overflow
                spreadDeg: isMobile ? 15 : 30,
                overlap: isMobile ? 0.65 : 0.4
            });
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!experiences || experiences.length === 0) return null;

    const items: CardStackItem[] = experiences.map((exp) => ({
        id: exp.id,
        title: exp.title,
        description: exp.description,
        imageSrc: getImageUrl(exp.image) || '/images/hero-bg.jpg',
        href: `/experiencia?slug=${exp.slug}`,
        ctaLabel: `$${Number(exp.price_cop).toLocaleString()}`,
        tag: exp.location_name || 'Colombia'
    }));

    return (
        <div className="w-full flex items-center justify-center py-10 overflow-hidden">
            <CardStack
                items={items}
                cardHeight={config.height}
                cardWidth={config.width}
                maxVisible={config.maxVisible}
                spreadDeg={config.spreadDeg}
                overlap={config.overlap}
                autoAdvance={true}
                intervalMs={2800} // Faster autoplay as requested
                springStiffness={180} // Explicitly pass soft stiffness
                springDamping={20}
            />
        </div>
    );
}
