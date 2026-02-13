'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    X, Save, Loader2, ImageIcon, Type, Link as LinkIcon,
    Bold, Italic, List, ListOrdered, Quote, Code, Heading1, Heading2,
    AlignLeft, AlignCenter, AlignRight, Underline as UnderlineIcon,
    Highlighter, ChevronDown, Check, Globe, Trash2, Plus
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';

import { Button } from '@/components/ui/button';
import { fetchApi, getImageUrl } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import MediaSelector from '@/components/admin/MediaSelector';

interface BlogFormProps {
    post?: any;
    isEditing?: boolean;
}

export default function BlogForm({ post, isEditing = false }: BlogFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: post?.title || '',
        slug: post?.slug || '',
        excerpt: post?.excerpt || '',
        cover_image: post?.cover_image || '',
        category_id: post?.category_id || '',
        status: post?.status || 'draft',
        author_name: post?.author_name || 'Moma Excursiones'
    });

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            ImageExtension.configure({
                HTMLAttributes: {
                    class: 'rounded-2xl max-w-full h-auto my-8 shadow-xl mx-auto block',
                },
            }),
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-moma-green underline font-bold transition-all hover:text-green-600',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Highlight.configure({ multicolor: true }),
            CharacterCount,
            Placeholder.configure({
                placeholder: 'Escribe tu historia aquí...',
            }),
        ],
        content: post?.content || '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-8',
            },
        },
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await fetchApi<any>('blog/categories.php');
            setCategories(data.categories || []);
            if (!formData.category_id && data.categories?.length > 0) {
                setFormData(prev => ({ ...prev, category_id: data.categories[0].id }));
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const handleUploadImage = async (file: File) => {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        try {
            const response = await fetchApi<any>('upload.php', {
                method: 'POST',
                body: uploadFormData
            });
            return response.url;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };

    const addImageToEditor = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
                try {
                    const url = await handleUploadImage(file);
                    editor?.chain().focus().setImage({ src: getImageUrl(url) }).run();
                } catch (error) {
                    alert('Error subiendo imagen');
                }
            }
        };
        input.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) {
            alert('El título es requerido');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                content: editor?.getHTML(),
                id: post?.id
            };

            const endpoint = isEditing ? 'blog/update.php' : 'blog/create.php';
            await fetchApi(endpoint, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            router.push('/admin/blog');
            router.refresh();
        } catch (error: any) {
            alert('Error guardando: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    const MenuBar = () => {
        if (!editor) return null;

        const activeClass = "bg-moma-green text-stone-900";
        const inactiveClass = "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800";

        return (
            <div className="sticky top-0 z-20 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 p-2 flex flex-wrap gap-1 rounded-t-[2rem]">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={cn("p-2 rounded-lg transition-all", editor.isActive('heading', { level: 1 }) ? activeClass : inactiveClass)}
                    title="Título 1"
                >
                    <Heading1 className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={cn("p-2 rounded-lg transition-all", editor.isActive('heading', { level: 2 }) ? activeClass : inactiveClass)}
                    title="Título 2"
                >
                    <Heading2 className="w-5 h-5" />
                </button>

                <div className="w-px h-8 bg-stone-100 dark:bg-stone-800 mx-1 self-center" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn("p-2 rounded-lg transition-all", editor.isActive('bold') ? activeClass : inactiveClass)}
                    title="Negrita"
                >
                    <Bold className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn("p-2 rounded-lg transition-all", editor.isActive('italic') ? activeClass : inactiveClass)}
                    title="Cursiva"
                >
                    <Italic className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={cn("p-2 rounded-lg transition-all", editor.isActive('underline') ? activeClass : inactiveClass)}
                    title="Subrayado"
                >
                    <UnderlineIcon className="w-5 h-5" />
                </button>

                <div className="w-px h-8 bg-stone-100 dark:bg-stone-800 mx-1 self-center" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={cn("p-2 rounded-lg transition-all", editor.isActive({ textAlign: 'left' }) ? activeClass : inactiveClass)}
                    title="Izquierda"
                >
                    <AlignLeft className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={cn("p-2 rounded-lg transition-all", editor.isActive({ textAlign: 'center' }) ? activeClass : inactiveClass)}
                    title="Centro"
                >
                    <AlignCenter className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={cn("p-2 rounded-lg transition-all", editor.isActive({ textAlign: 'right' }) ? activeClass : inactiveClass)}
                    title="Derecha"
                >
                    <AlignRight className="w-5 h-5" />
                </button>

                <div className="w-px h-8 bg-stone-100 dark:bg-stone-800 mx-1 self-center" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn("p-2 rounded-lg transition-all", editor.isActive('bulletList') ? activeClass : inactiveClass)}
                    title="Lista"
                >
                    <List className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn("p-2 rounded-lg transition-all", editor.isActive('orderedList') ? activeClass : inactiveClass)}
                    title="Lista Ordenada"
                >
                    <ListOrdered className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={cn("p-2 rounded-lg transition-all", editor.isActive('blockquote') ? activeClass : inactiveClass)}
                    title="Cita"
                >
                    <Quote className="w-5 h-5" />
                </button>

                <div className="w-px h-8 bg-stone-100 dark:bg-stone-800 mx-1 self-center" />

                <button
                    type="button"
                    onClick={addImageToEditor}
                    className={cn("p-2 rounded-lg transition-all text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800")}
                    title="Añadir Imagen"
                >
                    <ImageIcon className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => {
                        const url = window.prompt('URL del enlace');
                        if (url) editor.chain().focus().setLink({ href: url }).run();
                    }}
                    className={cn("p-2 rounded-lg transition-all", editor.isActive('link') ? activeClass : inactiveClass)}
                    title="Añadir Enlace"
                >
                    <LinkIcon className="w-5 h-5" />
                </button>

                <div className="flex-1" />

                <div className="px-3 py-1 bg-stone-50 dark:bg-stone-800 rounded-full text-[10px] font-black uppercase tracking-widest text-stone-400 self-center">
                    {editor.storage.characterCount.words()} palabras
                </div>
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] shadow-2xl border border-stone-100 dark:border-stone-800">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Título de la entrada..."
                        value={formData.title}
                        onChange={(e) => {
                            const val = e.target.value;
                            setFormData(prev => ({
                                ...prev,
                                title: val,
                                slug: isEditing ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                            }));
                        }}
                        className="text-3xl md:text-5xl font-black bg-transparent border-none outline-none w-full placeholder:text-stone-200 dark:placeholder:text-stone-700 italic"
                    />
                    <div className="flex items-center gap-2 mt-4 text-stone-400 text-sm font-medium">
                        <Globe className="w-4 h-4" />
                        <span>slug: {formData.slug || 'autogenerado'}</span>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex-1 md:flex-none px-8 py-6 rounded-2xl border-stone-200 font-bold text-stone-500"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 md:flex-none bg-stone-900 dark:bg-moma-green text-white dark:text-stone-900 hover:opacity-90 px-10 py-6 rounded-2xl font-black text-lg shadow-2xl transition-all flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isEditing ? 'Actualizar' : 'Publicar'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content / Editor */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
                        <MenuBar />
                        <EditorContent editor={editor} />
                    </div>

                    <div className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] border border-stone-100 dark:border-stone-800">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-4 block">Resumen (Excerpt)</label>
                        <textarea
                            placeholder="Un breve resumen que aparecerá en la lista de blogs..."
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            className="w-full h-32 bg-stone-50 dark:bg-stone-800 border-none rounded-3xl p-6 outline-none focus:ring-2 focus:ring-moma-green transition-all resize-none text-stone-600 font-medium"
                        />
                    </div>
                </div>

                {/* Sidebar / Settings */}
                <div className="space-y-8">
                    {/* Cover Image */}
                    <div className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] border border-stone-100 dark:border-stone-800">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-6 block">Portada</label>
                        <div
                            onClick={() => setIsMediaSelectorOpen(true)}
                            className="group relative aspect-[4/3] bg-stone-50 dark:bg-stone-800 rounded-3xl overflow-hidden cursor-pointer border-2 border-dashed border-stone-100 dark:border-stone-700 hover:border-moma-green transition-all"
                        >
                            {formData.cover_image ? (
                                <>
                                    <Image
                                        src={getImageUrl(formData.cover_image)}
                                        alt="Cover"
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white px-4 py-2 rounded-full text-xs font-black uppercase">Cambiar Imagen</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, cover_image: '' }); }}
                                        className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300 gap-4">
                                    <div className="w-16 h-16 bg-white dark:bg-stone-700 rounded-full flex items-center justify-center shadow-inner">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <span className="text-sm font-bold opacity-50">Elegir Portada</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] border border-stone-100 dark:border-stone-800 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 block">Categoría</label>
                            <select
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-2xl px-4 py-3 font-bold text-stone-600 outline-none focus:ring-2 focus:ring-moma-green"
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 block">Estado</label>
                            <div className="flex gap-2 p-1 bg-stone-50 dark:bg-stone-800 rounded-2xl">
                                {['draft', 'published'].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: s as any })}
                                        className={cn(
                                            "flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                                            formData.status === s
                                                ? "bg-stone-900 dark:bg-moma-green text-white dark:text-stone-900 shadow-lg"
                                                : "text-stone-400 hover:text-stone-600"
                                        )}
                                    >
                                        {s === 'draft' ? 'Borrador' : 'Publicado'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 block">Autor</label>
                            <input
                                type="text"
                                value={formData.author_name}
                                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-2xl px-4 py-3 font-bold text-stone-600 outline-none focus:ring-2 focus:ring-moma-green"
                            />
                        </div>
                    </div>

                    <div className="bg-stone-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700" />
                        <h4 className="text-xl font-black italic mb-2 relative z-10">¿Sabías que?</h4>
                        <p className="text-stone-400 text-sm font-medium relative z-10 leading-relaxed">
                            Las entradas con imágenes de alta calidad tienen un 80% más de lecturas. ¡No olvides elegir una buena portada!
                        </p>
                    </div>
                </div>
            </div>

            <MediaSelector
                isOpen={isMediaSelectorOpen}
                onClose={() => setIsMediaSelectorOpen(false)}
                onSelect={(url) => setFormData({ ...formData, cover_image: url })}
                title="Elegir Foto de Portada"
            />
        </form>
    );
}
