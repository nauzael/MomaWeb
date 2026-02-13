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
                        className="text-[10px] font-black uppercase tracking-[0.5em] text-moma-green mb-4 block"
                    >
                        Relatos y Aventuras
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black text-stone-900 dark:text-white leading-[0.9] italic"
                    >
                        Expediciones en <br />
                        <span className="text-stroke text-transparent dark:text-stroke-white opacity-20">Blanco y Negro</span>
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
                    <Link href={`/blog/${featuredPost.slug}`} className="group relative block aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl">
                        <Image
                            src={getImageUrl(featuredPost.cover_image)}
                            alt={featuredPost.title}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-12 w-full flex flex-col md:flex-row items-end justify-between gap-8">
                            <div className="max-w-2xl">
                                <span className="inline-block px-4 py-1.5 bg-moma-green text-stone-900 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                    Histórica
                                </span>
                                <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.1] mb-6 italic">
                                    {featuredPost.title}
                                </h2>
                                <p className="text-stone-300 text-lg line-clamp-2 md:line-clamp-3 opacity-90 font-medium">
                                    {featuredPost.excerpt}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-full group-hover:bg-moma-green group-hover:scale-110 transition-all duration-500 shadow-2xl">
                                <ArrowRight className="w-8 h-8 text-black" />
                            </div>
                        </div>
                    </Link>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                        {remainingPosts.map((post, idx) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Link href={`/blog/${post.slug}`} className="group block">
                                    <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                                        <Image
                                            src={getImageUrl(post.cover_image)}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-110 origin-bottom"
                                        />
                                        <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                                            {post.category_name || 'Explora'}
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <div className="flex items-center gap-4 text-stone-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {format(new Date(post.created_at), 'dd MMM, yyyy', { locale: es })}</span>
                                            <div className="w-1 h-1 rounded-full bg-stone-200" />
                                            <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {post.author_name}</span>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black text-stone-900 dark:text-white leading-tight italic group-hover:text-moma-green transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="mt-4 text-stone-500 line-clamp-3 leading-relaxed font-medium">
                                            {post.excerpt}
                                        </p>
                                        <div className="mt-8 flex items-center gap-2 text-stone-900 dark:text-white font-black uppercase text-[10px] tracking-widest group-hover:gap-4 transition-all">
                                            Seguir Leyendo <ChevronRight className="w-4 h-4 text-moma-green" />
                                        </div>
                                    </div>
                                </Link>
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

// Global styles for text stroke if needed elsewhere
const styles = `
.text-stroke {
  -webkit-text-stroke: 1px currentColor;
}
.text-stroke-white {
  -webkit-text-stroke: 1px #fff;
}
`;
