'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, MoreVertical, Edit, Trash2, ExternalLink, Filter, Calendar } from 'lucide-react';
import { fetchApi, getImageUrl } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function BlogAdminPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadPosts();
    }, [statusFilter]);

    const loadPosts = async () => {
        setLoading(true);
        try {
            const data = await fetchApi<any>(`blog/list.php?status=${statusFilter}`);
            setPosts(data.posts || []);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const deletePost = async (id: number) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta entrada?')) return;

        try {
            await fetchApi('blog/delete.php', {
                method: 'POST',
                body: JSON.stringify({ id })
            });
            loadPosts();
        } catch (error) {
            alert('Error al eliminar la entrada');
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-stone-900 dark:text-white flex items-center gap-3">
                        Blog <span className="text-moma-green text-lg bg-moma-green/10 px-3 py-1 rounded-full">{posts.length}</span>
                    </h1>
                    <p className="text-stone-500 mt-1">Gestiona las noticias y artículos de Moma Excursiones</p>
                </div>
                <Link href="/admin/blog/new">
                    <Button className="bg-moma-green text-stone-900 hover:bg-moma-green/90 rounded-2xl px-6 py-6 font-black text-lg shadow-xl shadow-moma-green/20">
                        <Plus className="w-6 h-6 mr-2" /> Nueva Entrada
                    </Button>
                </Link>
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-4 mb-8 shadow-sm border border-stone-100 dark:border-stone-800 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                        type="text"
                        placeholder="Buscar por título o contenido..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-stone-50 dark:bg-stone-800 border-none rounded-3xl outline-none focus:ring-2 focus:ring-moma-green transition-all"
                    />
                </div>
                <div className="flex gap-2 p-1 bg-stone-50 dark:bg-stone-800 rounded-3xl">
                    {['all', 'published', 'draft'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                "px-6 py-3 rounded-2xl text-sm font-bold transition-all",
                                statusFilter === s
                                    ? "bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-md"
                                    : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                            )}
                        >
                            {s === 'all' ? 'Todos' : s === 'published' ? 'Publicados' : 'Borradores'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[400px] bg-stone-100 dark:bg-stone-800 rounded-[2.5rem]" />
                    ))}
                </div>
            ) : filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((post) => (
                        <div key={post.id} className="group bg-white dark:bg-stone-900 rounded-[2.5rem] overflow-hidden border border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                            {/* Cover Image */}
                            <div className="relative h-48 bg-stone-100 dark:bg-stone-800">
                                {post.cover_image ? (
                                    <Image
                                        src={getImageUrl(post.cover_image)}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                                        <ImageIcon className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg",
                                        post.status === 'published' ? "bg-moma-green text-stone-900" : "bg-stone-900 text-white"
                                    )}>
                                        {post.status === 'published' ? 'Publicado' : 'Borrador'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">{post.category_name || 'General'}</span>
                                    <div className="w-1 h-1 rounded-full bg-stone-200" />
                                    <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(post.created_at), 'dd MMM, yyyy', { locale: es })}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-stone-900 dark:text-white line-clamp-2 leading-tight group-hover:text-moma-green transition-colors mb-4 italic">
                                    {post.title}
                                </h3>
                                <p className="text-stone-500 text-sm line-clamp-2 mb-8 leading-relaxed">
                                    {post.excerpt || 'Sin descripción...'}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-stone-100 dark:border-stone-800">
                                    <div className="flex gap-2">
                                        <Link href={`/admin/blog/edit/${post.id}`}>
                                            <button className="p-3 bg-stone-50 dark:bg-stone-800 rounded-2xl text-stone-500 hover:text-stone-900 dark:hover:text-white transition-all">
                                                <Edit className="w-5 h-5" />
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => deletePost(post.id)}
                                            className="p-3 bg-red-50 dark:bg-red-900/10 rounded-2xl text-red-400 hover:text-red-600 transition-all font-bold"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <Link href={`/blog/${post.slug}`} target="_blank">
                                        <button className="flex items-center gap-2 text-[10px] font-black uppercase text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all">
                                            Ver <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-stone-900 rounded-[3rem] p-20 text-center border-2 border-dashed border-stone-100 dark:border-stone-800">
                    <div className="w-24 h-24 bg-stone-50 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <PenTool className="w-10 h-10 text-stone-200" />
                    </div>
                    <h2 className="text-2xl font-black text-stone-900 dark:text-white mb-2 italic">Aún no hay historias...</h2>
                    <p className="text-stone-400 max-w-sm mx-auto mb-8 font-medium">Comparte tus experiencias con el mundo creando tu primera entrada de blog.</p>
                    <Link href="/admin/blog/new">
                        <Button className="bg-moma-green text-stone-900 hover:bg-moma-green/90 rounded-[2rem] px-12 py-8 font-black text-xl shadow-2xl shadow-moma-green/20">
                            Escribir entrada ✍️
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}

function PenTool(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="M2 2l7.586 7.586" />
            <circle cx="11" cy="11" r="2" />
        </svg>
    );
}

function ImageIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
    );
}
