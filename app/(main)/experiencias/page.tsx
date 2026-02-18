'use client';

import { useState, useEffect } from 'react';
import { getAllExperiencesPersisted, type Experience } from '@/lib/experience-service';
import { MOCK_EXPERIENCES } from '@/lib/mock-data';
import ExperienceGrid from '@/components/experiences/ExperienceGrid';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { useLanguage } from '@/context/LanguageContext';

export default function ExperiencesPage() {
    const { t } = useLanguage();
    const [experiences, setExperiences] = useState<Experience[]>(MOCK_EXPERIENCES as unknown as Experience[]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getAllExperiencesPersisted()
            .then((data) => {
                if (!cancelled) {
                    setExperiences(data);
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.error('Failed to load experiences:', error);
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollReveal>
                    <div className="text-center mb-16">
                        <span className="text-moma-green uppercase tracking-widest text-xs font-bold mb-3 block">{t.nav.discoverBadge}</span>
                        <h1 className="text-4xl md:text-5xl font-heading font-bold text-stone-900 dark:text-white mb-6">{t.nav.allExperiences}</h1>
                        <p className="text-stone-500 dark:text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed">
                            {t.nav.allExperiencesDesc}
                        </p>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={0.2}>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-96 bg-stone-200 dark:bg-stone-800 rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <ExperienceGrid experiences={experiences} />
                    )}
                </ScrollReveal>
            </div>
        </div>
    );
}
