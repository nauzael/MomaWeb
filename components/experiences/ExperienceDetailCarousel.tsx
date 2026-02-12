'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ExperienceDetailCarouselProps {
    images: string[];
    experienceTitle?: string;
}

export default function ExperienceDetailCarousel({ images, experienceTitle = "Experiencia turística" }: ExperienceDetailCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loaded, setLoaded] = useState(false);

    // Auto-advance
    useEffect(() => {
        if (images.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000); // Slower, more cinematic pace

        return () => clearInterval(timer);
    }, [images.length]);

    const nextImage = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const prevImage = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    if (!images || images.length === 0) return null;

    return (
        <div className="relative w-full h-full bg-stone-900">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }} // Slow, luxurious fade
                    className="absolute inset-0 w-full h-full"
                >
                    <Image
                        src={getImageUrl(images[currentIndex])}
                        alt={`${experienceTitle} - Imagen ${currentIndex + 1}`}
                        fill
                        priority={currentIndex === 0}
                        className={`object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoadingComplete={() => setLoaded(true)}
                        sizes="100vw"
                        quality={90}
                        unoptimized // Recommended for some external PHP backends if standard optimization fails
                    />

                    {/* Cinematic Vignette built-in to the slide */}
                    <div className="absolute inset-0 bg-black/20" />
                </motion.div>
            </AnimatePresence>

            {/* Navigation Dots - Minimalist */}
            {images.length > 1 && (
                <div className="absolute bottom-32 right-12 z-30 flex gap-3">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-1.5 transition-all duration-500 rounded-full shadow-sm ${idx === currentIndex
                                ? 'w-8 bg-white'
                                : 'w-2 bg-white/40 hover:bg-white/70'
                                }`}
                            aria-label={`Ver imagen ${idx + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Navigation Arrows - Only show on hover or large screens, subtle */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/10 bg-black/10 text-white/50 hover:bg-black/40 hover:text-white hover:border-white/30 backdrop-blur-md transition-all duration-300 z-30 opacity-0 group-hover:opacity-100 md:opacity-100"
                        aria-label="Imagen anterior"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/10 bg-black/10 text-white/50 hover:bg-black/40 hover:text-white hover:border-white/30 backdrop-blur-md transition-all duration-300 z-30 opacity-0 group-hover:opacity-100 md:opacity-100"
                        aria-label="Siguiente imagen"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}
        </div>
    );
}
