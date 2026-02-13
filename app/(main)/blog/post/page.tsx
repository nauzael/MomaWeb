'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import BlogPostClient from '../components/BlogPostClient';
import { useLanguage } from '@/context/LanguageContext';

function BlogPostContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');
    const [post, setPost] = useState<any>(null);
    const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) {
            setLoading(false);
            return;
        }

        const loadPost = async () => {
            try {
                const data = await fetchApi<any>(`blog/get.php?slug=${slug}`);
                setPost(data.post);

                // Fetch related posts
                const listData = await fetchApi<any>('blog/list.php?status=published&limit=3');
                setRelatedPosts((listData.posts || []).filter((p: any) => p.slug !== slug));
            } catch (error) {
                console.error('Error loading blog post:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPost();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-stone-50 dark:bg-stone-950">
                <Loader2 className="w-8 h-8 animate-spin text-moma-green" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950 text-center px-6">
                <h1 className="text-4xl font-black italic mb-4 text-stone-900 dark:text-white">{t.nav.blogStoryNotWritten}</h1>
                <a href="/blog" className="flex items-center gap-2 text-stone-900 dark:text-white font-black uppercase text-xs tracking-widest hover:gap-4 transition-all">
                    {t.nav.blogBack}
                </a>
            </div>
        );
    }

    return <BlogPostClient post={post} relatedPosts={relatedPosts} />;
}

export default function BlogPostPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-screen bg-stone-50 dark:bg-stone-950">
                <Loader2 className="w-8 h-8 animate-spin text-moma-green" />
            </div>
        }>
            <BlogPostContent />
        </Suspense>
    );
}
