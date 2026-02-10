'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import DynamicMap from '@/components/map/DynamicMap';
import { Check, X, MapPin, Users, Clock } from 'lucide-react';
import BookingWidget from '@/components/experiences/BookingWidget';
import MobileStickyBookingBar from '@/components/experiences/MobileStickyBookingBar';
import ExperienceDetailCarousel from '@/components/experiences/ExperienceDetailCarousel';
import { getExperiencePersisted, type Experience } from '@/lib/experience-service';

interface ExperienceDetailsProps {
    experience: Experience;
}

export default function ExperienceDetails({ experience: initialExperience }: ExperienceDetailsProps) {
    const [experience, setExperience] = useState<Experience>(initialExperience);

    useEffect(() => {
        let cancelled = false;
        getExperiencePersisted(initialExperience.slug).then((data) => {
            if (!cancelled && data) setExperience(data);
        });
        return () => {
            cancelled = true;
        };
    }, [initialExperience]);

    const heroImage = experience.image || 'https://images.unsplash.com/photo-1544979590-37e9b47cd705?q=80&w=2574&auto=format&fit=crop';

    return (
        <div className="min-h-screen bg-white dark:bg-stone-950 pb-20">
            {/* Hero / Gallery */}
            <div className="relative h-[60vh] w-full bg-stone-200">
                <Image
                    src={heroImage}
                    alt={experience.title}
                    fill
                    unoptimized
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-2">{experience.title}</h1>
                    <div className="flex items-center text-white/90 space-x-6 text-sm md:text-base">
                        <span className="flex items-center"><MapPin className="w-4 h-4 mr-2" aria-hidden="true" /> {experience.location_name || 'Colombia'}</span>
                        <span className="flex items-center"><Clock className="w-4 h-4 mr-2" aria-hidden="true" /> {experience.duration || 'Consultar'}</span>
                        <span className="flex items-center"><Users className="w-4 h-4 mr-2" aria-hidden="true" /> Max {experience.max_capacity} pax</span>
                    </div>
                </div>
            </div>

            {experience.gallery && experience.gallery.length > 0 && (
                <section className="w-full bg-white dark:bg-stone-950">
                    <div className="w-full">
                        <ExperienceDetailCarousel images={experience.gallery} experienceTitle={experience.title} />
                    </div>
                </section>
            )}

            <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                    <section className="space-y-10">
                        <div className="prose prose-stone dark:prose-invert max-w-none">
                            <h2 className="text-3xl font-heading font-black text-[#061a15] dark:text-white mb-8 flex items-center gap-3">
                                <span className="w-8 h-1 bg-moma-green rounded-full" />
                                Descripción del Tour
                            </h2>
                            <div className="space-y-6">
                                {experience.description
                                    .split('\n')
                                    .filter((p: string) => p.trim() !== '')
                                    .map((paragraph: string, idx: number) => (
                                        <p
                                            key={idx}
                                            className="text-stone-600 dark:text-stone-300 leading-[1.8] text-lg tracking-tight font-sans"
                                        >
                                            {paragraph}
                                        </p>
                                    ))}
                            </div>
                        </div>
                    </section>

                    {experience.includes && experience.excludes && (
                        <section>
                            <h2 className="text-2xl font-heading font-bold text-moma-earth mb-6">Incluye & No Incluye</h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-stone-50 p-6 rounded-xl dark:bg-stone-900/50">
                                    <h3 className="font-heading font-bold text-lg mb-4 flex items-center text-stone-900 dark:text-white">
                                        <Check className="w-5 h-5 mr-2 text-moma-green" aria-hidden="true" /> Incluye
                                    </h3>
                                    <ul className="space-y-3">
                                        {experience.includes.map((item: string, i: number) => (
                                            <li key={i} className="flex items-start text-stone-600 dark:text-stone-400 font-sans">
                                                <span className="w-1.5 h-1.5 bg-moma-green rounded-full mt-2 mr-2 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-stone-50 p-6 rounded-xl dark:bg-stone-900/50">
                                    <h3 className="font-heading font-bold text-lg mb-4 flex items-center text-stone-900 dark:text-white">
                                        <X className="w-5 h-5 mr-2 text-red-400" aria-hidden="true" /> No Incluye
                                    </h3>
                                    <ul className="space-y-3">
                                        {experience.excludes.map((item: string, i: number) => (
                                            <li key={i} className="flex items-start text-stone-600 dark:text-stone-400 font-sans">
                                                <span className="w-1.5 h-1.5 bg-stone-300 rounded-full mt-2 mr-2 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>
                    )}

                    {experience.location_coords && (
                        <section>
                            <h2 className="text-2xl font-heading font-bold text-moma-earth mb-4">Ubicación</h2>
                            <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg border border-stone-100">
                                <DynamicMap coords={[experience.location_coords.lat, experience.location_coords.lng]} popupText={experience.title} />
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar Booking Widget */}
                <div className="relative">
                    <BookingWidget
                        priceCop={experience.price_cop}
                        priceUsd={experience.price_usd}
                        maxCapacity={experience.max_capacity}
                        experienceTitle={experience.title}
                        experienceId={experience.id}
                    />
                </div>
            </div>

            <MobileStickyBookingBar
                priceCop={experience.price_cop}
                experienceTitle={experience.title}
            />
        </div >
    );
}
