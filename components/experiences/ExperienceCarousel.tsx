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
    const [contentWidth, setContentWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const innerContainerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const controls = useAnimation();
    const [isPaused, setIsPaused] = useState(false);
    const [slideWidth, setSlideWidth] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Duplicate experiences to enable infinite loop
    const displayExperiences = [...experiences, ...experiences];

    useEffect(() => {
        const updateWidths = () => {
            if (innerContainerRef.current) {
                // Use the inner container width (without padding) for calculations
                const width = innerContainerRef.current.offsetWidth;
                const isMobile = window.innerWidth < 768;
                const isTablet = window.innerWidth < 1280;
                
                // Show more items on larger screens, ensuring uniform distribution
                let show = 1;
                if (isMobile) show = 1;
                else if (isTablet) show = 3;
                else show = 4; // Full width on desktop

                const gap = 32; // gap-8
                
                // Calculate card width based on visible items
                // This formula ensures cards are evenly distributed across the available width
                const calculatedCardWidth = (width - (gap * (show - 1))) / show;
                const calculatedSlideWidth = calculatedCardWidth + gap;

                setSlideWidth(calculatedSlideWidth);
                setContentWidth(experiences.length * 2 * calculatedSlideWidth);
                
                // Reset position to aligned state
                x.set(0);
                setCurrentIndex(0);
            }
        };

        updateWidths();
        window.addEventListener('resize', updateWidths);
        return () => window.removeEventListener('resize', updateWidths);
    }, [experiences, x]);


    const handleNext = useCallback(async () => {
        if (slideWidth === 0) return;
        
        const newIndex = currentIndex + 1;
        const targetX = -newIndex * slideWidth;

        await controls.start({
            x: targetX,
            transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] }
        });

        // If we've scrolled past the first set, reset to the beginning seamlessly
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
        
        // If at the beginning, jump to the end of the first set
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

    // Auto-play effect
    useEffect(() => {
        if (isPaused || slideWidth === 0) return;
        const timer = setInterval(() => {
            handleNext();
        }, 5000);
        return () => clearInterval(timer);
    }, [handleNext, isPaused, slideWidth]);

    if (experiences.length === 0) return null;

    return (
        <div
            className="relative group/carousel py-2 overflow-visible"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Container with overflow-hidden and padding for shadows */}
            <div
                ref={containerRef}
                className="w-full mx-auto overflow-hidden relative px-4 md:px-8 lg:px-12"
            >
                {/* Inner container for width measurement (without padding) */}
                <div ref={innerContainerRef} className="w-full mx-auto">
                    <motion.div
                        ref={contentRef}
                        animate={controls}
                        style={{ x }}
                        drag="x"
                        dragConstraints={{
                            left: -(contentWidth / 2),
                            right: 0
                        }}
                        onDragStart={() => setIsPaused(true)}
                        onDragEnd={() => {
                            if (slideWidth === 0) return;
                            
                            const currentX = x.get();
                            
                            // Calculate nearest slide index
                            const nearestIndex = Math.round(-currentX / slideWidth);
                            const clampedIndex = Math.max(0, Math.min(nearestIndex, experiences.length - 1));
                            const snappedX = -clampedIndex * slideWidth;

                            controls.start({ 
                                x: snappedX, 
                                transition: { type: 'spring', stiffness: 300, damping: 30 } 
                            });
                            setCurrentIndex(clampedIndex);
                        }}
                        className="flex gap-8 py-12"
                    >
                        {displayExperiences.map((exp, index) => (
                            <div
                                key={`${exp.id}-${index}`}
                                style={{ width: slideWidth > 0 ? slideWidth - 32 : 400 }}
                                className="flex-shrink-0"
                            >
                                <ExperienceCard experience={exp} />
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Navigation Arrows - Positioned relative to the content area */}
            <div className="absolute inset-y-0 left-0 right-0 w-full mx-auto flex items-center justify-between pointer-events-none z-20 px-2 md:px-4">
                <button
                    onClick={handlePrev}
                    className="p-3 md:p-4 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md shadow-xl text-stone-900 dark:text-white pointer-events-auto opacity-0 group-hover/carousel:opacity-100 transition-all transform hover:scale-110 hover:bg-moma-green hover:text-white"
                >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button
                    onClick={handleNext}
                    className="p-3 md:p-4 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md shadow-xl text-stone-900 dark:text-white pointer-events-auto opacity-0 group-hover/carousel:opacity-100 transition-all transform hover:scale-110 hover:bg-moma-green hover:text-white"
                >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </button>
            </div>
        </div>
    );
}
