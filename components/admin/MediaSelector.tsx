'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Loader2, Search, ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { fetchApi, getImageUrl } from '@/lib/api-client';

interface GalleryImage {
    id: string;
    url: string;
    alt_text?: string;
    created_at: string;
}

interface MediaSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    title?: string;
}

export default function MediaSelector({ isOpen, onClose, onSelect, title = "Seleccionar Imagen" }: MediaSelectorProps) {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadImages();
        }
    }, [isOpen]);

    const loadImages = async () => {
        setLoading(true);
        try {
            const data = await fetchApi<{ images: any[] }>('gallery/index.php');
            setImages(data.images || []);
        } catch (error) {
            console.error('Failed to load gallery images:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredImages = images.filter(img =>
        (img.alt_text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-stone-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-stone-900">{title}</h2>
                        <p className="text-stone-500 text-sm">Elige una imagen de la Galería Infinita</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-900"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 md:px-8 border-b border-stone-50 bg-stone-50/50 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Buscar imágenes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-moma-green outline-none transition-all"
                        />
                    </div>
                    <div className="flex-1" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadImages}
                        disabled={loading}
                        className="text-stone-500"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Actualizar
                    </Button>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {loading && images.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-stone-400 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p className="font-medium">Cargando galería...</p>
                        </div>
                    ) : filteredImages.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredImages.map((image) => (
                                <div
                                    key={image.id}
                                    onClick={() => {
                                        onSelect(image.url);
                                        onClose();
                                    }}
                                    className="group relative aspect-square bg-stone-100 rounded-2xl overflow-hidden cursor-pointer border border-stone-200 hover:border-moma-green hover:ring-2 hover:ring-moma-green/20 transition-all shadow-sm hover:shadow-md"
                                >
                                    <Image
                                        src={getImageUrl(image.url.replace('/gallery/', '/gallery/thumbs/'))}
                                        alt={image.alt_text || 'Imagen de la galería'}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 20vw"
                                        className="object-cover transition-transform group-hover:scale-110"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (target.src.includes('/thumbs/')) {
                                                target.src = getImageUrl(image.url);
                                            }
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-moma-green/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase text-stone-900 shadow-xl scale-90 group-hover:scale-100 transition-transform">
                                            Seleccionar
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-stone-400 gap-4 border-2 border-dashed border-stone-100 rounded-3xl">
                            <ImageIcon className="w-12 h-12 opacity-20" />
                            <p className="font-medium italic">No se encontraron imágenes</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 md:px-8 border-t border-stone-100 bg-stone-50/30 flex justify-end">
                    <Button variant="outline" onClick={onClose} className="rounded-xl px-6">
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    );
}
