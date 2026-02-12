'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getExperiencePersisted, type Experience } from '@/lib/experience-service';
import ExperienceDetails from '@/components/experiences/ExperienceDetails';
import { Loader2 } from 'lucide-react';

function ExperienceContent() {
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');
    const [experience, setExperience] = useState<Experience | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        getExperiencePersisted(slug)
            .then((data) => {
                if (!cancelled) {
                    setExperience(data);
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.error('Failed to load experience:', error);
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [slug]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white dark:bg-stone-950">
                <Loader2 className="w-8 h-8 animate-spin text-moma-green" />
            </div>
        );
    }

    if (!experience) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-white dark:bg-stone-950">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">Experiencia no encontrada</h1>
                    <p className="text-stone-500">La experiencia que buscas no existe o ha sido eliminada.</p>
                </div>
            </div>
        );
    }

    // JSON-LD Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: experience.title,
        description: experience.description,
        image: experience.image,
        offers: {
            '@type': 'Offer',
            price: experience.price_cop,
            priceCurrency: 'COP',
            availability: 'https://schema.org/InStock',
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ExperienceDetails experience={experience} />
        </>
    );
}

export default function ExperiencePage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-screen bg-white dark:bg-stone-950">
                <Loader2 className="w-8 h-8 animate-spin text-moma-green" />
            </div>
        }>
            <ExperienceContent />
        </Suspense>
    );
}
