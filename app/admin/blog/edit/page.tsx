'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BlogForm from '../components/BlogForm';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api-client';

function EditBlogPostContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        loadPost();
    }, [id]);

    const loadPost = async () => {
        try {
            const data = await fetchApi<any>(`blog/get.php?id=${id}`);
            setPost(data.post);
        } catch (error) {
            console.error('Error loading post:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-moma-green" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4">
                <h2 className="text-2xl font-black">Entrada no encontrada</h2>
                <Link href="/admin/blog" className="text-moma-green font-bold underline">Volver al listado</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50/30 dark:bg-stone-950/30 font-inter">
            <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
                <Link
                    href="/admin/blog"
                    className="inline-flex items-center gap-2 text-stone-400 hover:text-stone-900 dark:hover:text-white font-bold transition-all group"
                >
                    <div className="p-2 bg-white dark:bg-stone-900 rounded-xl shadow-sm group-hover:shadow-md transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </div>
                    <span>Volver al listado</span>
                </Link>
            </div>

            <BlogForm post={post} isEditing={true} />
        </div>
    );
}

export default function EditBlogPostPage() {
    return (
        <Suspense fallback={
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-moma-green" />
            </div>
        }>
            <EditBlogPostContent />
        </Suspense>
    );
}
