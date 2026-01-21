'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ImageOrientation = 'portrait' | 'landscape' | 'square';

interface ExperienceDetailCarouselProps {
    images: string[];
}

export default function ExperienceDetailCarousel({ images }: ExperienceDetailCarouselProps) {
    const [current, setCurrent] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const rowRef = useRef<HTMLDivElement | null>(null);
    const [orientations, setOrientations] = useState<ImageOrientation[]>(() =>
        images.map(() => 'landscape')
    );

    const handleImageLoaded = useCallback(
        (index: number, width: number, height: number) => {
            setOrientations((prev) => {
                const next = [...prev];
                if (width === height) {
                    next[index] = 'square';
                } else if (width > height) {
                    next[index] = 'landscape';
                } else {
                    next[index] = 'portrait';
                }
                return next;
            });
        },
        []
    );

    const scrollToImage = useCallback((index: number) => {
        const container = rowRef.current;
        if (!container) return;
        const child = container.children[index] as HTMLElement | undefined;
        if (!child) return;

        const scrollLeft = child.offsetLeft - 16;
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isModalOpen) return;

        if (e.key === 'ArrowLeft') {
            setCurrent((prev) => (prev - 1 + images.length) % images.length);
        } else if (e.key === 'ArrowRight') {
            setCurrent((prev) => (prev + 1) % images.length);
        } else if (e.key === 'Escape') {
            setIsModalOpen(false);
        }
    }, [isModalOpen, images.length]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        if (!isModalOpen) {
            scrollToImage(current);
        }
    }, [current, scrollToImage, isModalOpen]);

    useEffect(() => {
        if (images.length <= 1 || isModalOpen || isPaused) return;

        const interval = window.setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 3500);

        return () => window.clearInterval(interval);
    }, [images.length, isModalOpen, isPaused]);

    const next = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrent((prev) => (prev + 1) % images.length);
    };

    const prev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrent((prev) => (prev - 1 + images.length) % images.length);
    };

    if (!images || images.length === 0) return null;

    return (
        <>
            <motion.div
                initial={{ scale: 1.1, opacity: 0.5 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-full bg-stone-100 dark:bg-stone-900 rounded-3xl py-4"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div
                    ref={rowRef}
                    className="flex gap-4 px-4 sm:px-8 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                    {images.map((img, index) => (
                        <motion.button
                            key={index}
                            type="button"
                            initial={{ opacity: 0, scale: 1.1 }}
                            whileInView={{ 
                                opacity: index === current ? 1 : 0.8, 
                                scale: index === current ? 1.02 : 1 
                            }}
                            whileHover={{ opacity: 1 }}
                            viewport={{ once: true, margin: "-20%" }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            onClick={() => {
                                setCurrent(index);
                                setIsModalOpen(true);
                            }}
                            className={cn(
                                "relative flex-shrink-0 overflow-hidden",
                                orientations[index] === 'portrait' && "h-60 sm:h-64 md:h-72 w-40 sm:w-44 md:w-48",
                                orientations[index] === 'landscape' && "h-60 sm:h-64 md:h-72 w-72 sm:w-80 md:w-96",
                                orientations[index] === 'square' && "h-60 sm:h-64 md:h-72 w-56 sm:w-60 md:w-64",
                                index === current && "shadow-2xl"
                            )}
                        >
                            <Image
                                src={img}
                                alt={`Imagen ${index + 1}`}
                                fill
                                unoptimized
                                className="object-cover"
                                onLoadingComplete={(result) =>
                                    handleImageLoaded(index, result.naturalWidth, result.naturalHeight)
                                }
                            />
                        </motion.button>
                    ))}
                </div>

            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all z-50"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        <div
                            className="relative w-full max-w-7xl h-[80vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={current}
                                            initial={{ opacity: 0, scale: 0.96 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.96 }}
                                            transition={{ duration: 0.45, ease: 'easeOut' }}
                                            className="relative w-full h-full"
                                        >
                                            <Image
                                                src={images[current]}
                                                alt={`Imagen ampliada ${current + 1}`}
                                                fill
                                                unoptimized
                                                className="object-contain"
                                            />
                                        </motion.div>
                                    </AnimatePresence>

                            <button
                                type="button"
                                onClick={prev}
                                className="absolute left-0 top-1/2 -translate-y-1/2 p-4 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <ChevronLeft className="w-10 h-10" />
                            </button>
                            <button
                                type="button"
                                onClick={next}
                                className="absolute right-0 top-1/2 -translate-y-1/2 p-4 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <ChevronRight className="w-10 h-10" />
                            </button>
                        </div>

                        <div
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] p-2 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setCurrent(i)}
                                    className={cn(
                                        "relative w-16 h-16 rounded-lg overflow-hidden transition-all flex-shrink-0",
                                        i === current ? "scale-110 opacity-100" : "opacity-40 hover:opacity-100"
                                    )}
                                >
                                    <Image
                                        src={img}
                                        alt={`Miniatura ${i + 1}`}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
