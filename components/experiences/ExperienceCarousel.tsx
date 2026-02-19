'use client';

import { type Experience } from '@/lib/experience-service';
import ExperienceCard from './ExperienceCard';
import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ExperienceCarouselProps {
    experiences: Experience[];
}

export default function ExperienceCarousel({ experiences }: ExperienceCarouselProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const controls = useAnimation();
    const [isPaused, setIsPaused] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [cardWidth, setCardWidth] = useState<number | null>(null);

    const displayExperiences = [...experiences, ...experiences, ...experiences, ...experiences];

    // Check mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            
            // Calculate card width
            const container = containerRef.current;
            if (container) {
                const containerWidth = container.offsetWidth;
                const gap = mobile ? 16 : 32;
                const padding = mobile ? 32 : 64; // px-4 = 16px each side
                
                // For mobile: 1 card at 85% width
                // For desktop: 3 cards evenly distributed
                let newCardWidth;
                if (mobile) {
                    newCardWidth = (containerWidth - padding) * 0.85;
                } else {
                    // 3 cards + 2 gaps
                    newCardWidth = (containerWidth - padding - (gap * 2)) / 3;
                }
                
                setCardWidth(newCardWidth);
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const slideWidth = (cardWidth ?? 0) + (isMobile ? 16 : 32);

    const handleNext = useCallback(async () => {
        if (slideWidth === 0) return;

        const newIndex = currentIndex + 1;
        const targetX = -newIndex * slideWidth;

        await controls.start({
            x: targetX,
            transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] }
        });

        if (newIndex >= experiences.length) {
            x.set(0);
            setCurrentIndex(0);
        } else {
            setCurrentIndex(newIndex);
        }
    }, [currentIndex, experiences.length, slideWidth, controls, x]);

    const handlePrev = useCallback(async () => {
        if (slideWidth === 0) return;

        let newIndex = currentIndex - 1;

        if (newIndex < 0) {
            newIndex = experiences.length - 1;
            x.set(-experiences.length * slideWidth);
        }

        const targetX = -newIndex * slideWidth;

        await controls.start({
            x: targetX,
            transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] }
        });

        setCurrentIndex(newIndex);
    }, [currentIndex, experiences.length, slideWidth, controls, x]);

    useEffect(() => {
        if (isPaused || slideWidth === 0) return;
        const timer = setInterval(() => {
            handleNext();
        }, 5000);
        return () => clearInterval(timer);
    }, [handleNext, isPaused, slideWidth]);

    if (experiences.length === 0) return null;

    // Show placeholder while calculating dimensions
    if (cardWidth === null) {
        return (
            <div className="w-full max-w-[1400px] mx-auto overflow-hidden">
                <div className={`flex ${isMobile ? 'gap-4' : 'gap-8'} py-8 md:py-12 px-4 md:px-8`}>
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="shrink-0 bg-stone-100 dark:bg-stone-800 rounded-3xl animate-pulse"
                            style={{ width: isMobile ? '85%' : 'calc(33% - 20px)' }}
                        >
                            <div className="h-56 bg-stone-200 dark:bg-stone-700 rounded-t-3xl" />
                            <div className="p-6 space-y-3">
                                <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
                                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-full" />
                                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative group/carousel py-8 md:py-16 px-2"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Container */}
            <div
                ref={containerRef}
                className="w-full max-w-[1400px] mx-auto"
            >
                <motion.div
                    ref={contentRef}
                    animate={controls}
                    style={{ x }}
                    drag="x"
                    dragConstraints={{
                        left: -((experiences.length) * slideWidth),
                        right: 0
                    }}
                    onDragStart={() => setIsPaused(true)}
                    onDragEnd={() => {
                        if (slideWidth === 0) return;

                        const currentX = x.get();
                        const nearestIndex = Math.round(-currentX / slideWidth);
                        const clampedIndex = Math.max(0, Math.min(nearestIndex, experiences.length - 1));
                        const snappedX = -clampedIndex * slideWidth;

                        controls.start({
                            x: snappedX,
                            transition: { type: 'spring', stiffness: 300, damping: 30 }
                        });
                        setCurrentIndex(clampedIndex);
                    }}
                    className={`flex ${isMobile ? 'gap-4' : 'gap-8'} py-8 md:py-12`}
                >
                    {displayExperiences.map((exp, index) => (
                        <div
                            key={`${exp.id}-${index}`}
                            style={{ width: cardWidth ?? '100%' }}
                            className="shrink-0"
                        >
                            <ExperienceCard
                                experience={exp}
                                priority={index < (isMobile ? 1 : 3)}
                            />
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute inset-y-0 left-0 right-0 w-full max-w-[1400px] mx-auto flex items-center justify-between pointer-events-none px-2 md:px-4 z-20">
                <button
                    onClick={handlePrev}
                    className={`rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md shadow-xl text-stone-900 dark:text-white pointer-events-auto opacity-0 group-hover/carousel:opacity-100 transition-all transform hover:scale-110 hover:bg-moma-green hover:text-white ${isMobile ? 'p-2' : 'p-3 md:p-4'}`}
                    aria-label="Previous"
                >
                    <ChevronLeft className={isMobile ? "w-5 h-5" : "w-5 h-5 md:w-6 md:h-6"} />
                </button>
                <button
                    onClick={handleNext}
                    className={`rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md shadow-xl text-stone-900 dark:text-white pointer-events-auto opacity-0 group-hover/carousel:opacity-100 transition-all transform hover:scale-110 hover:bg-moma-green hover:text-white ${isMobile ? 'p-2' : 'p-3 md:p-4'}`}
                    aria-label="Next"
                >
                    <ChevronRight className={isMobile ? "w-5 h-5" : "w-5 h-5 md:w-6 md:h-6"} />
                </button>
            </div>
        </div>
    );
}
