'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { fetchApi, getImageUrl } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { DestinationCard } from '@/components/ui/card-21';

export default function BlogListingPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [postsData, categoriesData] = await Promise.all([
                fetchApi<any>('blog/list.php?status=published&limit=50'),
                fetchApi<any>('blog/categories.php')
            ]);
            setPosts(postsData.posts || []);
            setCategories(categoriesData.categories || []);
        } catch (error) {
            console.error('Error loading blog data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPosts = selectedCategory === 'all'
        ? posts
        : posts.filter(post => post.category_name === selectedCategory || post.category_id.toString() === selectedCategory);

    const featuredPost = filteredPosts[0];
    const remainingPosts = filteredPosts.slice(1);

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
            {/* Header / Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30 select-none overflow-hidden">
                    <div className="absolute -top-20 -left-20 w-[40rem] h-[40rem] bg-moma-green/20 rounded-full blur-[10rem] animate-pulse" />
                    <div className="absolute top-1/2 -right-20 w-[30rem] h-[30rem] bg-stone-200/50 dark:bg-stone-800/20 rounded-full blur-[8rem]" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] md:text-[11px] font-sans font-bold uppercase tracking-[0.4em] text-moma-green mb-6 block"
                    >
                        Relatos y Aventuras
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-9xl font-heading font-black text-stone-900 dark:text-white leading-[1.1]"
                    >
                        Expediciones en <br />
                        Blanco y Negro
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 text-stone-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed"
                    >
                        Explora los tesoros escondidos de Sucre y más allá. Historias de viaje,
                        guías locales y la magia de lo desconocido.
                    </motion.p>
                </div>
            </section>

            {/* Categories */}
            <section className="max-w-7xl mx-auto px-6 mb-16">
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={cn(
                            "px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-wider transition-all border",
                            selectedCategory === 'all'
                                ? "bg-stone-900 text-white border-stone-900 shadow-xl"
                                : "bg-transparent text-stone-400 border-stone-200 dark:border-stone-800 hover:text-stone-900 dark:hover:text-white"
                        )}
                    >
                        Todos
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={cn(
                                "px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-wider transition-all border",
                                selectedCategory === cat.name
                                    ? "bg-stone-900 text-white border-stone-900 shadow-xl"
                                    : "bg-transparent text-stone-400 border-stone-200 dark:border-stone-800 hover:text-stone-900 dark:hover:text-white"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </section>

            {/* Featured Post */}
            {featuredPost && selectedCategory === 'all' && (
                <section className="max-w-7xl mx-auto px-6 mb-24">
                    <div className="h-[400px] md:h-[600px]">
                        <DestinationCard
                            imageUrl={getImageUrl(featuredPost.cover_image)}
                            location={featuredPost.title}
                            flag="✨"
                            stats={`Destacado • ${featuredPost.category_name || 'Expedición'} • ${format(new Date(featuredPost.created_at), 'dd MMM', { locale: es })}`}
                            href={`/blog/post?slug=${featuredPost.slug}`}
                            themeColor="170 100% 25%"
                        />
                    </div>
                </section>
            )}

            {/* Grid */}
            <section className="max-w-7xl mx-auto px-6 pb-32">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="aspect-[4/5] bg-stone-200 dark:bg-stone-900 rounded-[3rem] animate-pulse" />
                        ))}
                    </div>
                ) : filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {remainingPosts.map((post, idx) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="h-[500px]"
                            >
                                <DestinationCard
                                    imageUrl={getImageUrl(post.cover_image)}
                                    location={post.title}
                                    flag="🍃"
                                    stats={`${post.category_name || 'Expedición'} • ${format(new Date(post.created_at), 'dd MMM', { locale: es })}`}
                                    href={`/blog/post?slug=${post.slug}`}
                                    themeColor={idx % 3 === 0 ? "170 100% 25%" : idx % 3 === 1 ? "150 50% 25%" : "190 60% 30%"}
                                />
                            </motion.article>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40 border-t border-stone-200 dark:border-stone-800">
                        <h3 className="text-3xl font-black italic text-stone-300">No hay entradas para esta categoría... por ahora.</h3>
                    </div>
                )}
            </section>
        </div>
    );
}

