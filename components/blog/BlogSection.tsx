'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, User, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { fetchApi, getImageUrl } from '@/lib/api-client';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

export default function BlogSection() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const data = await fetchApi<any>('blog/list.php?status=published&limit=3');
                setPosts(data.posts || []);
            } catch (error) {
                console.error('Error loading homepage posts:', error);
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, []);

    if (!loading && posts.length === 0) return null;

    return (
        <section className="py-24 bg-stone-50 dark:bg-stone-950 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <ScrollReveal>
                        <span className="text-moma-green text-[10px] font-black uppercase tracking-[0.5em] mb-4 block">
                            Historias de Expedición
                        </span>
                        <h2 className="text-5xl md:text-7xl font-black text-stone-900 dark:text-white leading-[0.9] italic">
                            Relatos del <br />
                            <span className="text-stroke text-transparent dark:text-stroke-white opacity-20">Desconocido</span>
                        </h2>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2}>
                        <Link
                            href="/blog"
                            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all pb-2 border-b border-stone-200 dark:border-stone-800"
                        >
                            Ver todo el Blog <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </ScrollReveal>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {loading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="aspect-[4/5] bg-stone-200 dark:bg-stone-900 rounded-[3rem] animate-pulse" />
                        ))
                    ) : (
                        posts.map((post, idx) => (
                            <ScrollReveal key={post.id} delay={idx * 0.1} variant="fade-up">
                                <Link href={`/blog/post?slug=${post.slug}`} className="group block">
                                    <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                                        <Image
                                            src={getImageUrl(post.cover_image)}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-110 origin-bottom"
                                        />
                                        <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                                            {post.category_name || 'Expedición'}
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <div className="flex items-center gap-4 text-stone-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                            <span className="flex items-center gap-1.5 font-bold">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(post.created_at), 'dd MMM', { locale: es })}
                                            </span>
                                            <div className="w-1 h-1 rounded-full bg-stone-200" />
                                            <span className="flex items-center gap-1.5 font-bold">
                                                <User className="w-3 h-3" />
                                                {post.author_name}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl md:text-3xl font-black text-stone-900 dark:text-white leading-tight italic group-hover:text-moma-green transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <div className="mt-8 flex items-center gap-2 text-stone-900 dark:text-white font-black uppercase text-[10px] tracking-widest group-hover:gap-4 transition-all">
                                            Leer Historia <ChevronRight className="w-4 h-4 text-moma-green" />
                                        </div>
                                    </div>
                                </Link>
                            </ScrollReveal>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
