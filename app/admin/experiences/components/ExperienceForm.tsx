'use client';

import { useState, useRef, useEffect } from 'react';
import { Save, Upload, X, Image as ImageIcon, Loader2, Plus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { saveExperiencePersisted, type Experience } from '@/lib/experience-service';
import DynamicMap from '@/components/map/DynamicMap';

interface ExperienceFormProps {
    initialData?: Experience;
}

export default function ExperienceForm({ initialData }: ExperienceFormProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryFileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        description: initialData?.description || '',
        price_cop: initialData?.price_cop || '',
        price_usd: initialData?.price_usd || '',
        max_capacity: initialData?.max_capacity || '',
        includes: initialData?.includes || [],
        excludes: initialData?.excludes || [],
        includesText: (initialData?.includes || []).join('\n'),
        excludesText: (initialData?.excludes || []).join('\n'),
        location_name: initialData?.location_name || '',
        location_coords: initialData?.location_coords || { lat: 4.5709, lng: -74.2973 },
        location_lat: (initialData?.location_coords?.lat ?? 4.5709).toString(),
        location_lng: (initialData?.location_coords?.lng ?? -74.2973).toString()
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image || null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>(initialData?.gallery || []);
    const descriptionRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize description textarea
    useEffect(() => {
        if (descriptionRef.current) {
            descriptionRef.current.style.height = 'auto';
            descriptionRef.current.style.height = descriptionRef.current.scrollHeight + 'px';
        }
    }, [formData.description]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            if (name === 'title' && (!prev.slug || prev.slug === prev.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''))) {
                newData.slug = value.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w-]+/g, '');
            }

            return newData;
        });
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 1. Show immediate preview using URL.createObjectURL (faster for UI feedback)
            const tempUrl = URL.createObjectURL(file);
            setPreviewUrl(tempUrl);

            // 2. Optimization in background: Compress and convert to WebP
            const reader = new FileReader();
            reader.onload = async (event) => {
                const img = new window.Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    // Maintain original resolution as requested
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0);

                    // Convert to WebP with 0.7 quality for significant size reduction
                    const webpDataUrl = canvas.toDataURL('image/webp', 0.7);
                    setPreviewUrl(webpDataUrl);
                    // Cleanup the temporary object URL
                    URL.revokeObjectURL(tempUrl);
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        for (const file of files) {
            const tempUrl = URL.createObjectURL(file);

            // Add tempUrl immediately
            setGalleryPreviews(prev => [...prev, tempUrl]);

            const reader = new FileReader();
            reader.onload = async (event) => {
                const img = new window.Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0);

                    const webpDataUrl = canvas.toDataURL('image/webp', 0.7);

                    // Replace the tempUrl with the webpDataUrl
                    setGalleryPreviews(prev => prev.map(p => p === tempUrl ? webpDataUrl : p));
                    URL.revokeObjectURL(tempUrl);
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const removeGalleryImage = (index: number) => {
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent saving if we still have temporary blob URLs (optimization in progress)
        const hasBlob = previewUrl?.startsWith('blob:') || galleryPreviews.some(url => url.startsWith('blob:'));
        if (hasBlob) {
            alert('Las imágenes se están optimizando. Por favor espera un segundo...');
            return;
        }

        setIsSubmitting(true);

        try {
            let finalImageUrl = previewUrl;

            // If we have a new image (previewUrl is data: or blob:), upload it
            if (previewUrl && (previewUrl.startsWith('data:') || previewUrl.startsWith('blob:'))) {
                const res = await fetch(previewUrl);
                const blob = await res.blob();

                const formDataUpload = new FormData();
                formDataUpload.append('file', blob, 'experience.webp');

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formDataUpload,
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    finalImageUrl = uploadData.url;
                }
            }

            // Handle Gallery Uploads - Parallel processing for better performance
            const uploadGalleryImage = async (url: string) => {
                if (!url) return null;

                if (url.startsWith('data:') || url.startsWith('blob:')) {
                    try {
                        const res = await fetch(url);
                        const blob = await res.blob();
                        const formDataGallery = new FormData();
                        // Generate a unique name for this gallery file
                        const fileName = `gallery_${Math.random().toString(36).substr(2, 9)}.webp`;
                        formDataGallery.append('file', blob, fileName);

                        const uploadRes = await fetch('/api/upload', {
                            method: 'POST',
                            body: formDataGallery,
                        });

                        if (uploadRes.ok) {
                            const uploadData = await uploadRes.json();
                            return uploadData.url;
                        } else {
                            // Fallback to data: URL if possible
                            return url.startsWith('data:') ? url : null;
                        }
                    } catch (err) {
                        console.error("Error uploading gallery image", err);
                        return url.startsWith('data:') ? url : null;
                    }
                }
                return url; // Already an uploaded URL or external link
            };

            const galleryUploadResults = await Promise.all(
                galleryPreviews.filter(url => !!url).map(async (url) => {
                    const result = await uploadGalleryImage(url);
                    if (!result && url) {
                        console.warn('Image upload failed but preserving URL as last resort');
                        return url; // Don't lose the image, even if it's a blob/data URL
                    }
                    return result;
                })
            );

            const finalGalleryUrls = galleryUploadResults.filter((url): url is string => !!url);

            // Safety check: if we had previews but finalGalleryUrls is empty, something is wrong
            if (galleryPreviews.length > 0 && finalGalleryUrls.length === 0) {
                throw new Error('No se pudieron procesar las imágenes de la galería');
            }

            const includesFromText = typeof formData.includesText === 'string' ? formData.includesText : '';
            const excludesFromText = typeof formData.excludesText === 'string' ? formData.excludesText : '';

            const parsedIncludes = includesFromText
                ? includesFromText.split('\n').map(item => item.trim()).filter(item => item.length > 0)
                : (Array.isArray(formData.includes) ? formData.includes : []);

            const parsedExcludes = excludesFromText
                ? excludesFromText.split('\n').map(item => item.trim()).filter(item => item.length > 0)
                : (Array.isArray(formData.excludes) ? formData.excludes : []);

            const latNumber = Number(formData.location_lat);
            const lngNumber = Number(formData.location_lng);
            const locationCoords = {
                lat: Number.isFinite(latNumber) ? latNumber : 4.5709,
                lng: Number.isFinite(lngNumber) ? lngNumber : -74.2973
            };

            // Prepare data for service
            const experienceData = {
                ...formData,
                id: initialData?.id,
                image: finalImageUrl || '',
                gallery: finalGalleryUrls,
                price_cop: Number(formData.price_cop) || 0,
                price_usd: Number(formData.price_usd) || 0,
                max_capacity: Number(formData.max_capacity) || 0,
                includes: parsedIncludes.length > 0 ? parsedIncludes : [
                    "Guía profesional",
                    "Transporte ida y vuelta",
                    "Seguro de viaje"
                ],
                excludes: parsedExcludes.length > 0 ? parsedExcludes : [
                    "Gastos personales",
                    "Propinas"
                ],
                location_coords: locationCoords
            };

            await saveExperiencePersisted(experienceData);
            alert(initialData?.id ? '¡Experiencia actualizada correctamente!' : '¡Experiencia creada correctamente!');

            router.refresh(); // Force data revalidation
            router.push('/admin/experiences');
        } catch (error) {
            console.error('Error during submission', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            alert('Error al guardar: ' + message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#eef1f4]">
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Ubicación (nombre)</label>
                    <input
                        type="text"
                        name="location_name"
                        value={formData.location_name}
                        onChange={handleChange}
                        className="w-full bg-[#f5fbf9] border-none rounded-xl px-4 py-3 text-[#1a1a1a] font-medium focus:ring-2 focus:ring-moma-green transition-all"
                        placeholder="Leticia, Amazonas"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Título de la Experiencia</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full bg-[#f5fbf9] border-none rounded-xl px-4 py-3 text-[#1a1a1a] font-bold focus:ring-2 focus:ring-moma-green transition-all"
                            placeholder="Ej: Amazonas Mágico"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Slug (URL)</label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            className="w-full bg-[#f5fbf9] border-none rounded-xl px-4 py-3 text-[#1a1a1a] font-bold focus:ring-2 focus:ring-moma-green transition-all"
                            placeholder="amazonas-magico"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Descripción</label>
                    <textarea
                        ref={descriptionRef}
                        rows={4}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full bg-[#f5fbf9] border-none rounded-xl px-4 py-3 text-[#1a1a1a] font-medium focus:ring-2 focus:ring-moma-green transition-all resize-none overflow-hidden"
                        placeholder="Describe los detalles de esta aventura..."
                        required
                    ></textarea>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Incluye</label>
                        <textarea
                            rows={4}
                            name="includesText"
                            value={formData.includesText}
                            onChange={handleChange}
                            className="w-full bg-[#f5fbf9] border-none rounded-xl px-4 py-3 text-[#1a1a1a] text-sm font-medium focus:ring-2 focus:ring-moma-green transition-all"
                            placeholder={"Guía profesional\nTransporte ida y vuelta\nSeguro de viaje"}
                        ></textarea>
                        <p className="text-xs text-stone-400">Escribe un elemento por línea.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">No Incluye</label>
                        <textarea
                            rows={4}
                            name="excludesText"
                            value={formData.excludesText}
                            onChange={handleChange}
                            className="w-full bg-[#f5fbf9] border-none rounded-xl px-4 py-3 text-[#1a1a1a] text-sm font-medium focus:ring-2 focus:ring-moma-green transition-all"
                            placeholder={"Gastos personales\nPropinas"}
                        ></textarea>
                        <p className="text-xs text-stone-400">Escribe un elemento por línea.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Precio COP</label>
                        <input
                            type="number"
                            name="price_cop"
                            value={formData.price_cop}
                            onChange={handleChange}
                            className="w-full bg-[#f5fbf9] border-none rounded-xl px-4 py-3 text-[#1a1a1a] font-bold focus:ring-2 focus:ring-moma-green transition-all"
                            placeholder="2500000"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Precio USD</label>
                        <input
                            type="number"
                            name="price_usd"
                            value={formData.price_usd}
                            onChange={handleChange}
                            className="w-full bg-[#f5fbf9] border-none rounded-xl px-4 py-3 text-[#1a1a1a] font-bold focus:ring-2 focus:ring-moma-green transition-all"
                            placeholder="650"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Capacidad Máx</label>
                        <input
                            type="number"
                            name="max_capacity"
                            value={formData.max_capacity}
                            onChange={handleChange}
                            className="w-full bg-[#f5fbf9] border-none rounded-xl px-4 py-3 text-[#1a1a1a] font-bold focus:ring-2 focus:ring-moma-green transition-all"
                            placeholder="8"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Latitud</label>
                        <input
                            type="number"
                            step="0.000001"
                            name="location_lat"
                            value={formData.location_lat}
                            onChange={handleLocationChange}
                            className="w-full bg-[#f5fbf9] border-none rounded-xl px-4 py-3 text-[#1a1a1a] font-medium focus:ring-2 focus:ring-moma-green transition-all"
                            placeholder="4.5709"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Longitud</label>
                        <input
                            type="number"
                            step="0.000001"
                            name="location_lng"
                            value={formData.location_lng}
                            onChange={handleLocationChange}
                            className="w-full bg-[#f5fbf9] border-none rounded-xl px-4 py-3 text-[#1a1a1a] font-medium focus:ring-2 focus:ring-moma-green transition-all"
                            placeholder="-74.2973"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Buscar ubicación</label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Ej: Parque Tayrona, Colombia"
                            onKeyDown={async (e) => {
                                if (e.key !== 'Enter') return;
                                e.preventDefault();
                                const query = (e.currentTarget as HTMLInputElement).value.trim();
                                if (!query) return;
                                try {
                                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
                                    const data = await res.json();
                                    if (Array.isArray(data) && data.length > 0) {
                                        const match = data[0];
                                        const lat = parseFloat(match.lat);
                                        const lon = parseFloat(match.lon);
                                        if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
                                            setFormData(prev => ({
                                                ...prev,
                                                location_lat: lat.toString(),
                                                location_lng: lon.toString(),
                                                location_coords: { lat, lng: lon }
                                            }));
                                        }
                                    } else {
                                        alert('No se encontró la ubicación. Intenta con otro nombre.');
                                    }
                                } catch (error) {
                                    console.error(error);
                                    alert('Error al buscar la ubicación. Intenta nuevamente.');
                                }
                            }}
                            className="w-full bg-[#f5fbf9] border-none rounded-xl px-4 py-3 text-[#1a1a1a] font-medium focus:ring-2 focus:ring-moma-green transition-all"
                        />
                    </div>
                    <p className="text-xs text-stone-400">Presiona Enter para buscar por nombre de lugar.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Selecciona en el mapa</label>
                    <div className="h-[300px] w-full rounded-2xl border border-[#eef1f4] overflow-hidden">
                        <DynamicMap
                            coords={[
                                Number(formData.location_lat) || 4.5709,
                                Number(formData.location_lng) || -74.2973
                            ]}
                            popupText={formData.title || 'Nueva experiencia'}
                            onCoordsChange={([lat, lng]: [number, number]) => {
                                setFormData(prev => ({
                                    ...prev,
                                    location_lat: lat.toString(),
                                    location_lng: lng.toString(),
                                    location_coords: { lat, lng }
                                }));
                            }}
                        />
                    </div>
                    <p className="text-xs text-stone-400">Haz clic en el mapa para ajustar la ubicación exacta.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Imagen de Portada</label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    <div
                        onClick={handleFileClick}
                        className="border-2 border-dashed border-[#eef1f4] hover:border-moma-green bg-[#fcfdfd] rounded-2xl p-12 text-center cursor-pointer transition-all relative overflow-hidden group min-h-[300px] flex items-center justify-center"
                    >
                        {previewUrl ? (
                            <div className="absolute inset-0 w-full h-full">
                                <Image
                                    src={previewUrl}
                                    alt="Preview"
                                    fill
                                    unoptimized
                                    className="object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-white p-4 rounded-full shadow-xl">
                                        <Upload className="w-6 h-6 text-[#1a1a1a]" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-[#eef1f4] rounded-full flex items-center justify-center mb-4 group-hover:bg-moma-green/10 group-hover:text-moma-green transition-colors text-stone-400">
                                    <ImageIcon className="w-8 h-8" />
                                </div>
                                <p className="font-bold text-[#1a1a1a]">Sube un archivo de portada</p>
                                <p className="text-sm text-stone-400 mt-1">Este será el fondo principal del tour</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Galería de Imágenes (Carrusel)</label>
                    <input
                        type="file"
                        multiple
                        ref={galleryFileInputRef}
                        onChange={handleGalleryFileChange}
                        className="hidden"
                        accept="image/*"
                    />

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {galleryPreviews.map((url, index) => (
                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-[#eef1f4]">
                                <Image
                                    src={url}
                                    alt={`Gallery ${index}`}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeGalleryImage(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={() => galleryFileInputRef.current?.click()}
                            className="aspect-square rounded-xl border-2 border-dashed border-[#eef1f4] hover:border-moma-green hover:bg-[#f5fbf9] transition-all flex flex-col items-center justify-center text-stone-400 gap-2"
                        >
                            <Plus className="w-6 h-6" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Añadir</span>
                        </button>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-8 py-4 rounded-2xl font-bold text-stone-500 hover:bg-stone-50 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-[#061a15] text-white px-8 py-4 rounded-2xl font-bold hover:opacity-90 flex items-center shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-3" /> Guardar Experiencia
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
