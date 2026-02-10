'use client';

import { CardStack, CardStackItem } from "@/components/ui/card-stack";
import { type Experience } from '@/lib/experience-service';

interface ExperienceCardStackProps {
    experiences: Experience[];
}

export default function ExperienceCardStack({ experiences }: ExperienceCardStackProps) {
    if (!experiences || experiences.length === 0) return null;

    const items: CardStackItem[] = experiences.map((exp) => ({
        id: exp.id,
        title: exp.title,
        description: exp.description,
        imageSrc: exp.image || '/images/hero-bg.jpg',
        href: `/experiencias/${exp.slug}`,
        ctaLabel: `$${Number(exp.price_cop).toLocaleString()}`,
        tag: exp.location_name || 'Colombia'
    }));

    return (
        <div className="w-full flex items-center justify-center py-10">
            <CardStack
                items={items}
                cardHeight={500}
                cardWidth={350}
                maxVisible={7}
                spreadDeg={30}
                overlap={0.4}
                autoAdvance={true}
                intervalMs={2800} // Faster autoplay as requested
                springStiffness={180} // Explicitly pass soft stiffness
                springDamping={20}
            />
        </div>
    );
}
