import { useScroll, useTransform, motion, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import { X } from 'lucide-react';

const defaultImages = [
    "https://images.unsplash.com/photo-1544602931-1554558e6589?q=80&w=1000&auto=format&fit=crop", // Waterfall
    "https://images.unsplash.com/photo-1599582522432-6a66422d3b59?q=80&w=1000&auto=format&fit=crop", // Mountains
    "https://images.unsplash.com/photo-1591783060007-88540c1157f1?q=80&w=1000&auto=format&fit=crop", // Jungle
    "https://images.unsplash.com/photo-1517438476312-10d79c077509?q=80&w=1000&auto=format&fit=crop", // Abstract nature
    "https://images.unsplash.com/photo-1596395817839-847e1371e626?q=80&w=1000&auto=format&fit=crop", // River
    "https://images.unsplash.com/photo-1591122947157-55928d348a0c?q=80&w=1000&auto=format&fit=crop", // Palm trees
    "https://images.unsplash.com/photo-1563293863-7e87b7a90961?q=80&w=1000&auto=format&fit=crop", // Birds
    "https://images.unsplash.com/photo-1534065600609-b4700d148722?q=80&w=1000&auto=format&fit=crop", // Colombia street
    "https://images.unsplash.com/photo-1622646241038-f947963dfd59?q=80&w=1000&auto=format&fit=crop", // Coffee
];

export default function ParallaxGallery() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start']
    });

    const [galleryImages, setGalleryImages] = useState<string[]>(defaultImages);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchImages = async () => {
            // ... existing fetch logic
            const supabase = createClient();
            const { data, error } = await supabase
                .from('gallery_images')
                .select('url')
                .order('created_at', { ascending: false });

            if (data && data.length > 0) {
                console.log("Fetched gallery images:", data.length);
                // Shuffle images for random display
                const urls = data.map(img => img.url);
                for (let i = urls.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [urls[i], urls[j]] = [urls[j], urls[i]];
                }
                setGalleryImages(urls);
            } else {
                // If no data, shuffle defaults too
                setGalleryImages(prev => {
                    const shuffled = [...prev];
                    for (let i = shuffled.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                    }
                    return shuffled;
                });
                if (error) console.error("Error fetching gallery images:", error);
            }
        };
        fetchImages();
    }, []);

    const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 400]);
    const y3 = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const y4 = useTransform(scrollYProgress, [0, 1], [0, 300]);
    const y5 = useTransform(scrollYProgress, [0, 1], [0, -250]);

    // Distribute images among columns
    const col1: string[] = [];
    const col2: string[] = [];
    const col3: string[] = [];
    const col4: string[] = [];
    const col5: string[] = [];

    galleryImages.forEach((img, i) => {
        const remainder = i % 5;
        if (remainder === 0) col1.push(img);
        else if (remainder === 1) col2.push(img);
        else if (remainder === 2) col3.push(img);
        else if (remainder === 3) col4.push(img);
        else col5.push(img);
    });

    return (
        <section
            ref={containerRef}
            className="py-20 md:py-40 bg-stone-50 dark:bg-stone-950 overflow-hidden relative"
        >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-moma-green/5 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-linear-to-t from-stone-200/20 dark:from-stone-800/20 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Gradient blending top */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-linear-to-b from-stone-50 dark:from-stone-950 to-transparent pointer-events-none z-10" />

            <div className="max-w-[1600px] mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8 h-[160vh] md:h-[120vh]">
                    <Column images={col1} y={y} className="mt-0" onImageClick={setSelectedImage} />
                    <Column images={col2} y={y2} className="-mt-32 md:-mt-64" onImageClick={setSelectedImage} />
                    <Column images={col3} y={y3} className="hidden md:flex mt-12" onImageClick={setSelectedImage} />
                    <Column images={col4} y={y4} className="hidden md:flex -mt-48" onImageClick={setSelectedImage} />
                    <Column images={col5} y={y5} className="hidden md:flex mt-24" onImageClick={setSelectedImage} />
                </div>
            </div>

            {/* Gradient blending bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-stone-50 dark:from-stone-950 to-transparent pointer-events-none z-10" />

            {/* Content overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <h2 className="text-6xl md:text-9xl font-heading font-black text-stone-900/5 dark:text-white/5 uppercase tracking-tighter text-center mix-blend-overlay">
                    Naturaleza <br /> Indómita
                </h2>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-10 cursor-zoom-out"
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2 z-60"
                        >
                            <X size={32} />
                        </button>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()} // Prevent close when clicking image area (optional, but usually good)
                        >
                            <Image
                                src={selectedImage}
                                alt="Gallery View"
                                fill
                                className="object-contain"
                                sizes="100vw"
                                priority
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

const Column = ({ images, y, className, onImageClick }: { images: string[], y: any, className?: string, onImageClick: (src: string) => void }) => {
    return (
        <motion.div style={{ y }} className={cn("flex flex-col gap-8 relative", className)}>
            {images.map((src, i) => (
                <div
                    key={i}
                    className="relative aspect-3/4 w-full rounded-4xl overflow-hidden group shadow-lg cursor-zoom-in"
                    onClick={() => onImageClick(src)}
                >
                    <Image
                        src={src}
                        alt="Gallery image"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                </div>
            ))}
        </motion.div>
    )
}
