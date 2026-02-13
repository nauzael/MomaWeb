'use client';

import { useState, useEffect } from 'react';
import { getAllExperiencesPersisted, type Experience } from '@/lib/experience-service';
import { MOCK_EXPERIENCES } from '@/lib/mock-data';
import ExperienceCardStack from '@/components/experiences/ExperienceCardStack';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import SectionDivider from '@/components/ui/SectionDivider';
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
            <div className="max-w-7xl mx-auto px-4">
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
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-moma-green"></div>
                        </div>
                    ) : (
                        <ExperienceCardStack experiences={experiences} />
                    )}
                </ScrollReveal>
            </div>
            <SectionDivider className="text-white dark:text-stone-900 top-auto -bottom-px z-20" variant="mountains" />
        </div>
    );
}
