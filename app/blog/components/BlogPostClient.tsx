'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, User, ChevronLeft, Share2, Tag, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getImageUrl } from '@/lib/api-client';

export default function BlogPostClient({ post, relatedPosts }: { post: any, relatedPosts: any[] }) {
    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pb-32">
            {/* Header / Cover */}
            <header className="relative h-[80vh] w-full overflow-hidden">
                {post.cover_image && (
                    <Image
                        src={getImageUrl(post.cover_image)}
                        alt={post.title}
                        fill
                        priority
                        className="object-cover scale-105"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-stone-50 dark:to-stone-950" />

                <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 px-6 max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <Link href="/blog" className="inline-flex items-center gap-2 text-white/70 hover:text-white font-black uppercase text-[10px] tracking-[0.4em] transition-all mb-8">
                            <ChevronLeft className="w-4 h-4" /> Volver al Blog
                        </Link>

                        <div className="flex items-center justify-center gap-4 text-moma-green text-[10px] font-black uppercase tracking-widest">
                            <span className="px-3 py-1 bg-moma-green/10 backdrop-blur-md border border-moma-green/20 rounded-full">{post.category_name || 'General'}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-moma-green" />
                            <span>{format(new Date(post.created_at), 'dd MMMM, yyyy', { locale: es })}</span>
                        </div>

                        <h1 className="text-5xl md:text-8xl font-black text-white leading-[0.9] italic group">
                            {post.title}
                        </h1>

                        <div className="flex items-center justify-center gap-3 pt-8 pb-12">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 relative shadow-2xl">
                                <span className="absolute inset-0 flex items-center justify-center bg-stone-900 text-white font-black text-xs">M</span>
                            </div>
                            <div className="text-left">
                                <p className="text-white font-black text-sm">{post.author_name}</p>
                                <p className="text-white/50 text-[10px] uppercase font-black tracking-widest">Autor Moma</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 -mt-10 relative z-10">
                <div className="bg-white dark:bg-stone-900 rounded-[3rem] p-8 md:p-16 shadow-2xl border border-stone-100 dark:border-stone-800">
                    <div
                        className="prose prose-xl dark:prose-invert max-w-none 
                        prose-headings:font-black prose-headings:italic prose-headings:leading-[1.1] 
                        prose-p:text-stone-600 dark:prose-p:text-stone-400 prose-p:leading-relaxed prose-p:mb-8
                        prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:my-16
                        prose-blockquote:border-moma-green prose-blockquote:bg-stone-50 dark:prose-blockquote:bg-stone-800/50 prose-blockquote:p-8 prose-blockquote:rounded-3xl prose-blockquote:italic prose-blockquote:font-black
                        prose-a:text-moma-green prose-a:font-black prose-a:no-underline hover:prose-a:underline
                        "
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Footer / Meta */}
                    <div className="mt-20 pt-10 border-t border-stone-100 dark:border-stone-800 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Compartir:</span>
                            <div className="flex gap-2">
                                {[1, 2, 3].map(i => (
                                    <button key={i} className="p-3 bg-stone-50 dark:bg-stone-800 rounded-2xl hover:bg-moma-green hover:text-stone-900 transition-all">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-4 py-2 bg-stone-50 dark:bg-stone-800 rounded-full text-[10px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                                <Tag className="w-3 h-3" /> {post.category_name || 'General'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="max-w-7xl mx-auto px-6 mt-32">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-[10px] font-black uppercase text-moma-green tracking-[0.3em] mb-2 block">Siguiente lectura</span>
                            <h2 className="text-4xl md:text-5xl font-black text-stone-900 dark:text-white leading-[0.9] italic">Historias relacionadas</h2>
                        </div>
                        <Link href="/blog" className="text-[10px] font-black uppercase text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all flex items-center gap-2 group tracking-widest">
                            Ver todas <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {relatedPosts.map(rp => (
                            <Link key={rp.id} href={`/blog/post?slug=${rp.slug}`} className="group block">
                                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                                    <Image
                                        src={getImageUrl(rp.cover_image)}
                                        alt={rp.title}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                </div>
                                <h3 className="text-xl font-black text-stone-900 dark:text-white leading-tight italic group-hover:text-moma-green transition-colors mb-2">
                                    {rp.title}
                                </h3>
                                <p className="text-stone-400 text-sm font-medium line-clamp-2">{rp.excerpt}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
