'use client';

import BlogForm from '../components/BlogForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewBlogPostPage() {
    return (
        <div className="min-h-screen bg-stone-50/30 dark:bg-stone-950/30">
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

            <BlogForm />
        </div>
    );
}
