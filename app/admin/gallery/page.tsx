'use client';

import { useState, useEffect } from 'react';
import GalleryManager from '@/components/admin/GalleryManager';
import { fetchApi } from '@/lib/api-client';

export default function GalleryPage() {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadImages = async () => {
        try {
            const data = await fetchApi<{ images: any[] }>('gallery/index.php');
            setImages(data.images || []);
        } catch (error) {
            console.error('Failed to load gallery images:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadImages();
    }, []);

    const handleUpload = async (formData: FormData) => {
        try {
            // We need to send formData directly, fetchApi usually handles JSON.
            // But we can use fetch directly for FormData to let browser set Content-Type: multipart/form-data
            // However, we need credentials same-origin if relying on cookie auth (PHP session)

            const data = await fetchApi<any>('gallery/create.php', {
                method: 'POST',
                body: formData,
            });


            // Refresh images after upload
            loadImages();

            return data; // Expects { success: true, results: ... }
        } catch (error: any) {
            console.error('Upload error:', error);
            return { success: false, error: error.message };
        }
    };

    const handleDelete = async (id: string, url: string) => {
        try {
            await fetchApi('gallery/delete.php', {
                method: 'POST',
                body: JSON.stringify({ id })
            });

            // Refresh images
            loadImages();

            return { success: true };
        } catch (error: any) {
            console.error('Delete error:', error);
            return { success: false, error: error.message };
        }
    };

    if (loading) {
        return <div className="p-12 text-center text-stone-500">Cargando galería...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-stone-900">Galería Infinita</h1>
                    <p className="text-stone-500 mt-2">Administra las imágenes que aparecen en la sección de galería de la página principal.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xs border border-stone-200">
                <GalleryManager
                    initialImages={images}
                    onUpload={handleUpload}
                    onDelete={handleDelete}
                />
            </div>
        </div>
    );
}
