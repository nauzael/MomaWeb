'use client';

import { useState, useRef, useEffect } from 'react';
import { Save, Upload, X, Image as ImageIcon, Loader2, Plus, Trash2, Clock } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchApi, getImageUrl } from '@/lib/api-client';
import { saveExperiencePersisted, type Experience } from '@/lib/experience-service';

import DynamicMap from '@/components/map/DynamicMap';
import MediaSelector from '@/components/admin/MediaSelector';

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
        location_lng: (initialData?.location_coords?.lng ?? -74.2973).toString(),
        itinerary: initialData?.itinerary || []
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image || null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>(initialData?.gallery || []);
    const [optimizationProgress, setOptimizationProgress] = useState({ current: 0, total: 0 });
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Store original filenames to allow server-side deduplication/reuse
    const [coverFileName, setCoverFileName] = useState<string | null>(null);
    const [galleryFileNames, setGalleryFileNames] = useState<Record<string, string>>({});

    // New states for MediaSelector
    const [isCoverSelectorOpen, setIsCoverSelectorOpen] = useState(false);
    const [isGallerySelectorOpen, setIsGallerySelectorOpen] = useState(false);
    const [mediaSourceModal, setMediaSourceModal] = useState<{ isOpen: boolean; target: 'cover' | 'gallery' }>({
        isOpen: false,
        target: 'cover'
    });

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

    const addItineraryItem = () => {
        setFormData(prev => ({
            ...prev,
            itinerary: [...prev.itinerary, { title: '', description: '' }]
        }));
    };

    const removeItineraryItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            itinerary: prev.itinerary.filter((_, i) => i !== index)
        }));
    };

    const updateItineraryItem = (index: number, field: 'title' | 'description', value: string) => {
        setFormData(prev => {
            const newItinerary = [...prev.itinerary];
            newItinerary[index] = { ...newItinerary[index], [field]: value };
            return { ...prev, itinerary: newItinerary };
        });
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFileName(file.name);
            // Detect HEIC files
            const isHEIC = file.type === 'image/heic' ||
                file.type === 'image/heif' ||
                file.name.toLowerCase().endsWith('.heic') ||
                file.name.toLowerCase().endsWith('.heif');

            // 1. Show immediate preview using URL.createObjectURL (faster for UI feedback)
            const tempUrl = URL.createObjectURL(file);
            setPreviewUrl(tempUrl);

            // 2. Optimization in background: Compress and convert to WebP
            if (isHEIC) {
                // For HEIC, use object URL directly (browser decodes natively)
                const img = new window.Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0);

                    const webpDataUrl = canvas.toDataURL('image/webp', 0.7);
                    setPreviewUrl(webpDataUrl);
                    URL.revokeObjectURL(tempUrl);
                };
                img.onerror = () => {
                    console.error('Failed to load HEIC image');
                    URL.revokeObjectURL(tempUrl);
                };
                img.src = tempUrl;
            } else {
                // Standard processing for JPEG, PNG, etc.
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
        }
    };

    const handleGalleryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setOptimizationProgress(prev => {
            const isFinished = prev.total > 0 && prev.current === prev.total;
            return {
                current: isFinished ? 0 : prev.current,
                total: (isFinished ? 0 : prev.total) + files.length
            };
        });

        for (const file of files) {
            const tempUrl = URL.createObjectURL(file);

            // Map the temporary URL to the original filename
            setGalleryFileNames(prev => ({ ...prev, [tempUrl]: file.name }));

            // Add tempUrl immediately
            setGalleryPreviews(prev => [...prev, tempUrl]);

            // Detect HEIC files
            const isHEIC = file.type === 'image/heic' ||
                file.type === 'image/heif' ||
                file.name.toLowerCase().endsWith('.heic') ||
                file.name.toLowerCase().endsWith('.heif');

            if (isHEIC) {
                // For HEIC, use object URL directly
                const img = new window.Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0);

                    const webpDataUrl = canvas.toDataURL('image/webp', 0.7);
                    setGalleryPreviews(prev => prev.map(p => p === tempUrl ? webpDataUrl : p));
                    URL.revokeObjectURL(tempUrl);

                    setOptimizationProgress(prev => ({
                        ...prev,
                        current: prev.current + 1
                    }));
                };
                img.onerror = () => {
                    console.error('Failed to load HEIC gallery image');
                    URL.revokeObjectURL(tempUrl);
                    setOptimizationProgress(prev => ({
                        ...prev,
                        current: prev.current + 1
                    }));
                };
                img.src = tempUrl;
            } else {
                // Standard processing
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

                        setOptimizationProgress(prev => ({
                            ...prev,
                            current: prev.current + 1
                        }));
                    };
                };
                reader.readAsDataURL(file);
            }
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
            alert(`Las imágenes se están optimizando (${optimizationProgress.current}/${optimizationProgress.total}). Por favor espera un segundo...`);
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
                // Send original name (PHP will slugify and check for existence)
                formDataUpload.append('file', blob, coverFileName || 'experience.webp');

                const uploadData = await fetchApi<any>('upload.php', {
                    method: 'POST',
                    body: formDataUpload,
                });
                finalImageUrl = uploadData.url;

            }

            // Handle Gallery Uploads - Parallel processing for better performance
            const uploadGalleryImage = async (url: string) => {
                if (!url) return null;

                if (url.startsWith('data:') || url.startsWith('blob:')) {
                    try {
                        const res = await fetch(url);
                        const blob = await res.blob();
                        const formDataGallery = new FormData();

                        // Use original name for the gallery file
                        const originalName = galleryFileNames[url] || `gallery_${Math.random().toString(36).substr(2, 9)}.webp`;
                        formDataGallery.append('file', blob, originalName);

                        const uploadData = await fetchApi<any>('upload.php', {
                            method: 'POST',
                            body: formDataGallery,
                        });
                        return uploadData.url;
                    } catch (err) {
                        console.error("Error uploading gallery image", err);
                        // Fallback to data: URL if possible to avoid losing user selection
                        return url.startsWith('data:') ? url : null;
                    }
                }
                return url;

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

            // Show success modal instead of alert
            setShowSuccessModal(true);

            // Auto-redirect after 2 seconds, or wait for user to close modal
            setTimeout(() => {
                router.push('/admin/experiences');
            }, 2000);
        } catch (error) {
            console.error('Error during submission', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            alert('Error al guardar: ' + message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-[#eef1f4]">
            <form onSubmit={handleSubmit} className="space-y-12">
                {/* Basic Info Section */}
                <div className="space-y-8">
                    <h2 className="text-xl font-black text-stone-900 flex items-center gap-3">
                        <span className="w-8 h-8 bg-moma-green/10 text-moma-green rounded-lg flex items-center justify-center text-sm italic">01</span>
                        Información Básica
                    </h2>

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
                </div>

                {/* Logistics & Details Section */}
                <div className="space-y-8 pt-6 border-t border-stone-50">
                    <h2 className="text-xl font-black text-stone-900 flex items-center gap-3">
                        <span className="w-8 h-8 bg-moma-green/10 text-moma-green rounded-lg flex items-center justify-center text-sm italic">02</span>
                        Logística y Detalles
                    </h2>

                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Incluye</label>
                            <textarea
                                rows={6}
                                name="includesText"
                                value={formData.includesText}
                                onChange={handleChange}
                                className="w-full bg-[#f5fbf9] border-none rounded-2xl px-5 py-4 text-[#1a1a1a] text-sm font-medium focus:ring-2 focus:ring-moma-green transition-all"
                                placeholder={"Guía profesional\nTransporte ida y vuelta\nSeguro de viaje"}
                            ></textarea>
                            <p className="text-[11px] text-stone-400 flex items-center gap-1.5 ml-1">
                                <Plus className="w-3 h-3" /> Escribe un elemento por línea.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">No Incluye</label>
                            <textarea
                                rows={6}
                                name="excludesText"
                                value={formData.excludesText}
                                onChange={handleChange}
                                className="w-full bg-[#f5fbf9] border-none rounded-2xl px-5 py-4 text-[#1a1a1a] text-sm font-medium focus:ring-2 focus:ring-moma-green transition-all"
                                placeholder={"Gastos personales\nPropinas"}
                            ></textarea>
                            <p className="text-[11px] text-stone-400 flex items-center gap-1.5 ml-1">
                                <X className="w-3 h-3" /> Escribe un elemento por línea.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Precio COP</label>
                            <input
                                type="number"
                                name="price_cop"
                                value={formData.price_cop}
                                onChange={handleChange}
                                className="w-full bg-[#f5fbf9] border-none rounded-2xl px-5 py-4 text-[#1a1a1a] font-black text-lg focus:ring-2 focus:ring-moma-green transition-all"
                                placeholder="2500000"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Precio USD</label>
                            <input
                                type="number"
                                name="price_usd"
                                value={formData.price_usd}
                                onChange={handleChange}
                                className="w-full bg-[#f5fbf9] border-none rounded-2xl px-5 py-4 text-[#1a1a1a] font-black text-lg focus:ring-2 focus:ring-moma-green transition-all"
                                placeholder="650"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Capacidad Máx</label>
                            <input
                                type="number"
                                name="max_capacity"
                                value={formData.max_capacity}
                                onChange={handleChange}
                                className="w-full bg-[#f5fbf9] border-none rounded-2xl px-5 py-4 text-[#1a1a1a] font-black text-lg focus:ring-2 focus:ring-moma-green transition-all"
                                placeholder="8"
                            />
                        </div>
                    </div>
                </div>

                {/* Itinerary Section */}
                <div className="space-y-8 pt-6 border-t border-stone-50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-stone-900 flex items-center gap-3">
                            <span className="w-8 h-8 bg-moma-green/10 text-moma-green rounded-lg flex items-center justify-center text-sm italic">03</span>
                            Itinerario
                        </h2>
                        <button
                            type="button"
                            onClick={addItineraryItem}
                            className="bg-moma-green/10 text-moma-green px-4 py-2 rounded-xl font-bold text-sm hover:bg-moma-green/20 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Agregar Día/Etapa
                        </button>
                    </div>

                    <div className="space-y-6">
                        {formData.itinerary.length === 0 ? (
                            <div className="bg-stone-50 border-2 border-dashed border-stone-100 rounded-[2rem] p-12 text-center text-stone-400">
                                <Clock className="w-10 h-10 mx-auto mb-4 opacity-20" />
                                <p className="font-medium italic">Aún no hay etapas en el itinerario</p>
                                <button
                                    type="button"
                                    onClick={addItineraryItem}
                                    className="text-moma-green text-sm font-bold mt-2 hover:underline"
                                >
                                    + Crear primer día
                                </button>
                            </div>
                        ) : (
                            formData.itinerary.map((item, index) => (
                                <div key={index} className="bg-[#fcfdfd] border border-stone-100 rounded-[2rem] p-6 md:p-8 space-y-4 relative group">
                                    <button
                                        type="button"
                                        onClick={() => removeItineraryItem(index)}
                                        className="absolute top-6 right-6 p-2 text-stone-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>

                                    <div className="grid gap-4">
                                        <div className="space-y-2 max-w-sm">
                                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Día / Horario</label>
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => updateItineraryItem(index, 'title', e.target.value)}
                                                className="w-full bg-white border border-stone-100 rounded-xl px-4 py-2 text-[#1a1a1a] font-bold focus:ring-2 focus:ring-moma-green transition-all"
                                                placeholder="Ej: Día 1 - Llegada"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Actividad / Etapa</label>
                                            <textarea
                                                rows={3}
                                                value={item.description}
                                                onChange={(e) => updateItineraryItem(index, 'description', e.target.value)}
                                                className="w-full bg-white border border-stone-100 rounded-xl px-4 py-3 text-[#1a1a1a] font-medium focus:ring-2 focus:ring-moma-green transition-all"
                                                placeholder="Describe lo que pasará en este momento..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Location Section */}
                <div className="space-y-8 pt-6 border-t border-stone-50">
                    <h2 className="text-xl font-black text-stone-900 flex items-center gap-3">
                        <span className="w-8 h-8 bg-moma-green/10 text-moma-green rounded-lg flex items-center justify-center text-sm italic">04</span>
                        Geolocalización
                    </h2>

                    <div className="grid md:grid-cols-2 gap-10">
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

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Buscar ubicación</label>
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
                            <p className="text-xs text-stone-400">Presiona Enter para buscar por nombre de lugar.</p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Ajuste Manual en Mapa</label>
                            <div className="h-[350px] w-full rounded-[2.5rem] border border-[#eef1f4] overflow-hidden shadow-inner">
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
                        </div>
                    </div>
                </div>

                {/* Media Section */}
                <div className="space-y-8 pt-6 border-t border-stone-50">
                    <h2 className="text-xl font-black text-stone-900 flex items-center gap-3">
                        <span className="w-8 h-8 bg-moma-green/10 text-moma-green rounded-lg flex items-center justify-center text-sm italic">05</span>
                        Contenido Multimedia
                    </h2>

                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Imagen de Portada</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*,.heic,.heif"
                            />


                            <div
                                onClick={() => setMediaSourceModal({ isOpen: true, target: 'cover' })}
                                className="border-2 border-dashed border-[#eef1f4] hover:border-moma-green bg-[#fcfdfd] rounded-[2rem] p-12 text-center cursor-pointer transition-all relative overflow-hidden group min-h-[400px] flex items-center justify-center"
                            >
                                {previewUrl ? (
                                    <div className="absolute inset-0 w-full h-full">
                                        <Image
                                            src={getImageUrl(previewUrl)}
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
                                        <p className="font-bold text-[#1a1a1a]">Portada Principal</p>
                                        <p className="text-sm text-stone-400 mt-1">Es el fondo principal del tour</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Galería Carrusel</label>
                            <input
                                type="file"
                                multiple
                                ref={galleryFileInputRef}
                                onChange={handleGalleryFileChange}
                                className="hidden"
                                accept="image/*,.heic,.heif"
                            />


                            <div className="bg-[#fcfdfd] border border-stone-100 rounded-[2rem] p-6 min-h-[400px]">
                                {optimizationProgress.total > 0 && optimizationProgress.current < optimizationProgress.total && (
                                    <div className="w-full mb-6 animate-pulse">
                                        <div className="flex justify-between text-[10px] font-black uppercase text-moma-green mb-2">
                                            <span>Optimizando galería...</span>
                                            <span>{Math.round((optimizationProgress.current / optimizationProgress.total) * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-moma-green h-full transition-all duration-300 ease-out"
                                                style={{ width: `${(optimizationProgress.current / optimizationProgress.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {galleryPreviews.map((url, index) => (
                                        <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group border border-[#eef1f4] shadow-sm">
                                            <Image
                                                src={getImageUrl(url)}
                                                alt={`Gallery ${index}`}
                                                fill
                                                unoptimized
                                                className="object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(index)}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => setMediaSourceModal({ isOpen: true, target: 'gallery' })}
                                        className="aspect-square rounded-2xl border-2 border-dashed border-[#eef1f4] hover:border-moma-green hover:bg-[#f5fbf9] transition-all flex flex-col items-center justify-center text-stone-400 gap-2 group"
                                    >
                                        <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Añadir Foto</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-stone-100 flex justify-end gap-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-10 py-4 rounded-2xl font-bold text-stone-500 hover:bg-stone-50 transition-all text-lg"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-moma-green text-stone-900 px-12 py-4 rounded-2xl font-black text-lg hover:bg-moma-green/90 transition-all shadow-lg shadow-moma-green/20 disabled:opacity-50 flex items-center gap-3"
                    >
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        {initialData ? 'Actualizar Experiencia' : 'Crear Experiencia'}
                    </button>
                </div>
            </form>

            {/* Media Selectors */}
            <MediaSelector
                isOpen={isCoverSelectorOpen}
                onClose={() => setIsCoverSelectorOpen(false)}
                onSelect={(url) => setPreviewUrl(url)}
                title="Elegir Portada"
            />

            <MediaSelector
                isOpen={isGallerySelectorOpen}
                onClose={() => setIsGallerySelectorOpen(false)}
                onSelect={(url) => setGalleryPreviews(prev => [...prev, url])}
                title="Añadir a Galería"
            />

            {/* Media Source Selector Modal */}
            {mediaSourceModal.isOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setMediaSourceModal(prev => ({ ...prev, isOpen: false }))}
                >
                    <div
                        className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-300 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setMediaSourceModal(prev => ({ ...prev, isOpen: false }))}
                            className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-stone-900">Origen de Imagen</h3>
                                <p className="text-sm text-stone-500">¿Cómo deseas añadir la fotografía?</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => {
                                        setMediaSourceModal(prev => ({ ...prev, isOpen: false }));
                                        if (mediaSourceModal.target === 'cover') {
                                            handleFileClick();
                                        } else {
                                            galleryFileInputRef.current?.click();
                                        }
                                    }}
                                    className="flex items-center gap-4 p-4 bg-[#f5fbf9] hover:bg-moma-green/5 border border-stone-100 hover:border-moma-green rounded-2xl transition-all group"
                                >
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-moma-green group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-stone-900">Subir Nueva</p>
                                        <p className="text-[10px] text-stone-400 uppercase font-black">Desde tu dispositivo</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setMediaSourceModal(prev => ({ ...prev, isOpen: false }));
                                        if (mediaSourceModal.target === 'cover') {
                                            setIsCoverSelectorOpen(true);
                                        } else {
                                            setIsGallerySelectorOpen(true);
                                        }
                                    }}
                                    className="flex items-center gap-4 p-4 bg-stone-50 hover:bg-stone-100 border border-stone-100 hover:border-stone-200 rounded-2xl transition-all group"
                                >
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-stone-600 group-hover:scale-110 transition-transform">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-stone-900">De la Galería</p>
                                        <p className="text-[10px] text-stone-400 uppercase font-black">Imágenes ya subidas</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => {
                        setShowSuccessModal(false);
                        router.push('/admin/experiences');
                    }}
                >
                    <div
                        className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                                <svg
                                    className="w-10 h-10 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>

                            <div>
                                <h3 className="text-2xl font-black text-stone-900 mb-2">
                                    {initialData?.id ? '¡Actualizado!' : '¡Creado!'}
                                </h3>
                                <p className="text-stone-600">
                                    {initialData?.id
                                        ? 'La experiencia se actualizó correctamente'
                                        : 'La experiencia se creó exitosamente'}
                                </p>
                            </div>

                            <p className="text-sm text-stone-400">
                                Redirigiendo en 2 segundos...
                            </p>

                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    router.push('/admin/experiences');
                                }}
                                className="mt-4 bg-moma-green text-stone-900 px-6 py-3 rounded-xl font-bold hover:bg-moma-green/90 transition-all"
                            >
                                Ir a Experiencias
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
