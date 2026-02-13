'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { MapPin, Clock, Users, Star, Check, X as CloseIcon, Calendar } from 'lucide-react';
import BookingWidget from './BookingWidget';
import DynamicMap from '../map/DynamicMap';
import { type Experience } from '@/lib/experience-service';
import ExperienceDetailCarousel from '@/components/experiences/ExperienceDetailCarousel';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

interface ExperienceDetailsProps {
    experience: Experience;
}

export default function ExperienceDetails({ experience }: ExperienceDetailsProps) {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<'description' | 'itinerary' | 'reviews'>('description');
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    // Parse gallery if string array or JSON string
    const galleryImages = Array.isArray(experience.gallery)
        ? experience.gallery
        : typeof experience.gallery === 'string'
            ? JSON.parse(experience.gallery)
            : [];

    const allImages = [experience.image, ...galleryImages].filter(Boolean);

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-20" ref={containerRef}>
            {/* Parallax Hero Section */}
            <div className="relative h-[80vh] w-full overflow-hidden">
                <motion.div
                    style={{ y, opacity }}
                    className="absolute inset-0 w-full h-full"
                >
                    {allImages.length > 0 ? (
                        <ExperienceDetailCarousel images={allImages} experienceTitle={experience.title} />
                    ) : (
                        <Image
                            src="/placeholder-experience.jpg"
                            alt={experience.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    )}
                </motion.div>

                {/* Overlay Gradient - Cinematic & Readable */}
                <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-stone-950/90 pointer-events-none z-10" />

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-20 z-20 w-full max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        {/* Badges area removed as requested (redundant) */}


                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-sans font-black text-white mb-8 leading-[1.1] tracking-tight drop-shadow-2xl max-w-2xl">
                            {experience.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-8 text-white/90 text-sm md:text-base font-bold">
                            <div className="flex items-center bg-white/5 backdrop-blur-md px-7 py-3.5 rounded-2xl border border-white/10 hover:bg-white/15 transition-all cursor-default shadow-md group">
                                <MapPin className="w-5 h-5 mr-3 text-moma-green group-hover:scale-110 transition-transform" />
                                <span className="tracking-tight">{experience.location_name || (language === 'es' ? 'Ubicación remota' : 'Remote location')}</span>
                            </div>
                            {experience.duration && (
                                <div className="flex items-center bg-white/5 backdrop-blur-md px-7 py-3.5 rounded-2xl border border-white/10 hover:bg-white/15 transition-all cursor-default shadow-md group">
                                    <Clock className="w-5 h-5 mr-3 text-moma-green group-hover:scale-110 transition-transform" />
                                    <span className="tracking-tight">{experience.duration}</span>
                                </div>
                            )}
                            <div className="flex items-center bg-white/5 backdrop-blur-md px-7 py-3.5 rounded-2xl border border-white/10 hover:bg-white/15 transition-all cursor-default shadow-md group">
                                <Users className="w-5 h-5 mr-3 text-moma-green group-hover:scale-110 transition-transform" />
                                <span className="tracking-tight">{t.experienceDetail.maxTravelers.replace('{count}', String(experience.max_capacity))}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30 -mt-10 pb-20">
                <div className="grid lg:grid-cols-3 gap-16 lg:gap-20">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Tabs Navigation */}
                        <div className="bg-white dark:bg-stone-900 rounded-full p-1 border border-stone-100 dark:border-stone-800 flex overflow-x-auto gap-1">
                            {['description', 'itinerary', 'reviews'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`flex-1 min-w-[130px] px-6 py-3.5 rounded-full text-[12px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${activeTab === tab
                                        ? 'bg-moma-green text-white shadow-sm'
                                        : 'text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-600 dark:hover:text-white'
                                        }`}
                                >
                                    {tab === 'description' ? t.experienceDetail.tabs.description : tab === 'itinerary' ? t.experienceDetail.tabs.itinerary : t.experienceDetail.tabs.reviews}
                                </button>
                            ))}
                        </div>

                        <div className="bg-white dark:bg-stone-900 rounded-[3rem] p-10 md:p-12 shadow-sm border border-stone-100 dark:border-stone-800 min-h-[400px]">
                            {activeTab === 'description' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.4 }}
                                    className="prose dark:prose-invert max-w-none"
                                >
                                    <h2 className="text-2xl font-bold font-heading mb-6 text-stone-900 dark:text-white">{t.experienceDetail.aboutTitle}</h2>
                                    <div className="text-stone-600 dark:text-stone-300 leading-relaxed text-lg whitespace-pre-line">
                                        {experience.description}
                                    </div>

                                    <div className="my-10 h-px bg-stone-100 dark:bg-stone-800" />

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="text-lg font-bold font-heading mb-4 flex items-center gap-2 text-stone-900 dark:text-white">
                                                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                                    <Check className="w-5 h-5" />
                                                </div>
                                                {t.experienceDetail.includes}
                                            </h3>
                                            <ul className="space-y-3">
                                                {experience.includes?.map((item, i) => (
                                                    <li key={i} className="flex items-start text-stone-600 dark:text-stone-400">
                                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 shrink-0"></span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold font-heading mb-4 flex items-center gap-2 text-stone-900 dark:text-white">
                                                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                                    <CloseIcon className="w-5 h-5" />
                                                </div>
                                                {t.experienceDetail.excludes}
                                            </h3>
                                            <ul className="space-y-3">
                                                {experience.excludes?.map((item, i) => (
                                                    <li key={i} className="flex items-start text-stone-600 dark:text-stone-400">
                                                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-3 shrink-0"></span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {experience.recommendations && (
                                        <div className="mt-10 bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                                            <h3 className="text-lg font-bold font-heading mb-3 text-amber-800 dark:text-amber-200 flex items-center gap-2">
                                                <span className="text-2xl">💡</span> {t.experienceDetail.recommendations}
                                            </h3>
                                            <p className="text-stone-700 dark:text-stone-300">{experience.recommendations}</p>
                                        </div>
                                    )}

                                    {/* Map Section */}
                                    <div className="mt-16 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-3 italic">
                                                <MapPin className="w-6 h-6 text-moma-green" />
                                                {t.experienceDetail.locationTitle}
                                            </h3>
                                            <span className="text-sm font-bold text-stone-400 uppercase tracking-widest">{experience.location_name || 'Región Caribe'}</span>
                                        </div>
                                        <div className="h-[450px] w-full rounded-[3rem] overflow-hidden border border-stone-100 dark:border-stone-800 shadow-2xl shadow-stone-200/50 dark:shadow-none z-0">
                                            <DynamicMap
                                                coords={[experience.location_coords?.lat || 9.45, experience.location_coords?.lng || -75.39]}
                                                popupText={experience.title}
                                            />
                                        </div>
                                        <div className="flex bg-stone-50 dark:bg-stone-800/50 p-6 rounded-[2rem] border border-stone-100 dark:border-stone-800 items-center gap-4">
                                            <div className="w-12 h-12 bg-moma-green/10 rounded-2xl flex items-center justify-center shrink-0">
                                                <MapPin className="w-6 h-6 text-moma-green" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-stone-900 dark:text-white uppercase tracking-wider mb-0.5">{t.experienceDetail.meetingPoint}</p>
                                                <p className="text-stone-500 text-sm">{experience.location_name || t.experienceDetail.meetingPointCoord}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'itinerary' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-12"
                                >
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-3xl font-black text-stone-900 dark:text-white">{t.experienceDetail.itineraryTitle}</h2>
                                    </div>

                                    {!experience.itinerary || experience.itinerary.length === 0 ? (
                                        <div className="text-center py-20 bg-stone-50 dark:bg-stone-800/50 rounded-[3rem] border-2 border-dashed border-stone-100 dark:border-stone-800">
                                            <p className="text-stone-500 italic">{t.experienceDetail.itineraryFallback}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-10 relative before:content-[''] before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-100 dark:before:bg-stone-800">
                                            {experience.itinerary.map((item, index) => (
                                                <div key={index} className="relative pl-20 group">
                                                    <div className="absolute left-0 top-0 w-12 h-12 bg-white dark:bg-stone-900 rounded-2xl border-2 border-moma-green shadow-lg shadow-moma-green/10 flex items-center justify-center z-10">
                                                        <span className="text-moma-green font-black italic">{index + 1}</span>
                                                    </div>
                                                    <div className="bg-[#fcfdfd] dark:bg-stone-800/20 border border-stone-100 dark:border-stone-800 p-8 md:p-10 rounded-[3rem] group-hover:border-moma-green/30 transition-all shadow-sm">
                                                        <h3 className="text-xl font-black text-stone-900 dark:text-white mb-3 italic">{item.title}</h3>
                                                        <p className="text-stone-600 dark:text-stone-400 leading-relaxed">{item.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'reviews' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12"
                                >
                                    <div className="flex justify-center mb-4 text-amber-400">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-6 h-6 fill-current" />)}
                                    </div>
                                    <p className="text-stone-500">{t.experienceDetail.reviewsFallback}</p>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-32">
                            <BookingWidget experience={experience} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
