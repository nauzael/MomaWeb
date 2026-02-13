'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { fetchApi, getImageUrl } from '@/lib/api-client';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { DestinationCard } from '@/components/ui/card-21';
import { useLanguage } from '@/context/LanguageContext';

export default function BlogSection() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const data = await fetchApi<any>('blog/list.php?status=published&limit=4');
                setPosts(data.posts || []);
            } catch (error) {
                console.error('Error loading homepage posts:', error);
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, []);

    return (
        <section id="blog" className="py-24 bg-stone-50 dark:bg-stone-950 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-14 max-w-4xl mx-auto">
                    <ScrollReveal>
                        <span className="text-moma-green text-[10px] md:text-[11px] font-sans font-bold uppercase tracking-[0.4em] mb-6 block">
                            {t.blog.subtitle}
                        </span>
                        <h2 className="text-5xl md:text-7xl font-heading font-bold text-stone-900 dark:text-white leading-tight">
                            {t.blog.title}
                        </h2>
                        <div className="mt-10 flex justify-center">
                            <Link
                                href="/#blog"
                                className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all pb-2 border-b border-stone-200 dark:border-stone-800"
                            >
                                {t.blog.viewAll} <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                    </ScrollReveal>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
                    {loading ? (
                        [1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-[480px] bg-stone-200 dark:bg-stone-900 rounded-[2rem] animate-pulse" />
                        ))
                    ) : posts.length > 0 ? (
                        posts.map((post, idx) => (
                            <ScrollReveal key={post.id} delay={idx * 0.1} variant="fade-up">
                                <div className="h-[480px]">
                                    <DestinationCard
                                        imageUrl={getImageUrl(post.cover_image)}
                                        location={post.title}
                                        flag="🍃"
                                        stats={`${post.category_name || 'Expedición'} • ${format(new Date(post.created_at), 'dd MMM', { locale: es })}`}
                                        href={`/blog/post?slug=${post.slug}`}
                                        themeColor={idx % 3 === 0 ? "170 100% 25%" : idx % 3 === 1 ? "150 50% 25%" : "190 60% 30%"}
                                        buttonText={t.blog.readMore}
                                    />
                                </div>
                            </ScrollReveal>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-stone-400 font-medium italic">{t.blog.noPosts}</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
