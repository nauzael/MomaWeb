import { getGalleryImages, uploadGalleryImages, deleteGalleryImage } from './actions';
import GalleryManager from '@/components/admin/GalleryManager';

export default async function GalleryPage() {
    const images = await getGalleryImages();

    // Serialize dates for client component if necessary (Supabase returns strings for dates usually)
    // But ensure the types match

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
                    initialImages={images || []}
                    onUpload={uploadGalleryImages}
                    onDelete={deleteGalleryImage}
                />
            </div>
        </div>
    );
}
