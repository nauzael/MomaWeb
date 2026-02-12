'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Upload, Loader2, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { getImageUrl } from '@/lib/api-client';

interface GalleryImage {
    id: string;
    url: string;
    alt_text?: string;
    created_at: string;
}

interface GalleryManagerProps {
    initialImages: GalleryImage[];
    onUpload: (formData: FormData) => Promise<any>;
    onDelete: (id: string, url: string) => Promise<any>;
}

export default function GalleryManager({ initialImages, onUpload, onDelete }: GalleryManagerProps) {
    const router = useRouter();
    const [images, setImages] = useState<GalleryImage[]>(initialImages);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync initialImages when props change due to revalidation
    useEffect(() => {
        setImages(initialImages);
    }, [initialImages]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        let successCount = 0;
        let failCount = 0;
        let errors: string[] = [];

        // Upload sequentially to avoid hitting body size limits or timeouts
        for (let i = 0; i < files.length; i++) {
            setUploadProgress(`${i + 1}/${files.length}`);
            const originalFile = files[i];

            try {
                // Optimize on client side before sending
                // Special handling for HEIC files (iPhone photos)
                const isHEIC = originalFile.type === 'image/heic' ||
                    originalFile.type === 'image/heif' ||
                    originalFile.name.toLowerCase().endsWith('.heic') ||
                    originalFile.name.toLowerCase().endsWith('.heif');

                const optimizedBlob = await new Promise<Blob>((resolve, reject) => {
                    // For HEIC files, use object URL (browser handles decoding natively in Safari/Chrome)
                    // For other formats, use FileReader
                    if (isHEIC) {
                        const objectUrl = URL.createObjectURL(originalFile);
                        const img = new window.Image();

                        img.onload = () => {
                            URL.revokeObjectURL(objectUrl); // Clean up

                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;

                            // Max dimensions (4K is plenty)
                            const MAX_DIM = 3840;
                            if (width > MAX_DIM || height > MAX_DIM) {
                                if (width > height) {
                                    height = Math.round((height * MAX_DIM) / width);
                                    width = MAX_DIM;
                                } else {
                                    width = Math.round((width * MAX_DIM) / height);
                                    height = MAX_DIM;
                                }
                            }

                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0, width, height);

                            canvas.toBlob((blob) => {
                                if (blob) resolve(blob);
                                else reject(new Error('Canvas toBlob failed for HEIC'));
                            }, 'image/webp', 0.8);
                        };

                        img.onerror = () => {
                            URL.revokeObjectURL(objectUrl);
                            reject(new Error('HEIC image load failed. Your browser may not support HEIC files.'));
                        };

                        img.src = objectUrl;
                    } else {
                        // Standard image processing for JPEG, PNG, etc.
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const img = new window.Image();
                            img.onload = () => {
                                const canvas = document.createElement('canvas');
                                let width = img.width;
                                let height = img.height;

                                // Max dimensions (4K is plenty)
                                const MAX_DIM = 3840;
                                if (width > MAX_DIM || height > MAX_DIM) {
                                    if (width > height) {
                                        height = Math.round((height * MAX_DIM) / width);
                                        width = MAX_DIM;
                                    } else {
                                        width = Math.round((width * MAX_DIM) / height);
                                        height = MAX_DIM;
                                    }
                                }

                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext('2d');
                                ctx?.drawImage(img, 0, 0, width, height);

                                canvas.toBlob((blob) => {
                                    if (blob) resolve(blob);
                                    else reject(new Error('Canvas toBlob failed'));
                                }, 'image/webp', 0.8);
                            };
                            img.onerror = () => reject(new Error('Image load failed'));
                            img.src = e.target?.result as string;
                        };
                        reader.onerror = () => reject(new Error('FileReader failed'));
                        reader.readAsDataURL(originalFile);
                    }
                });

                const formData = new FormData();
                formData.append('files', optimizedBlob, `${originalFile.name.split('.')[0]}.webp`);

                const result = await onUpload(formData);
                if (result.success) {
                    successCount++;
                    if (result.warning) errors.push(`${originalFile.name}: ${result.warning}`);
                } else {
                    failCount++;
                    errors.push(`${originalFile.name}: ${result.error}`);
                }
            } catch (error: any) {
                console.error(`Upload error for ${originalFile.name}:`, error);
                failCount++;
                errors.push(`${originalFile.name}: ${error.message || 'Unknown error'}`);
            }
        }


        setUploading(false);
        setUploadProgress('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        if (failCount === 0) {
            // All good - Parent triggers loadImages which updates props
            // router.refresh(); 
        } else if (successCount > 0) {
            alert(`Uploaded ${successCount} images. Failed: ${failCount}.\nErrors:\n${errors.join('\n')}`);
            // router.refresh();
        } else {
            alert(`Failed to upload images.\nErrors:\n${errors.join('\n')}`);
        }
    };

    const handleDelete = async (id: string, url: string) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            const result = await onDelete(id, url);
            if (result.success) {
                setImages(prev => prev.filter(img => img.id !== id));
            } else {
                alert(result.error || 'Failed to delete image');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('An error occurred during deletion');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-stone-900">Manage Gallery Images</h2>
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        accept="image/*,.heic,.heif"
                        multiple // Allow multiple files
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-moma-green text-stone-900 hover:bg-moma-green/90"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {uploadProgress ? `Uploading ${uploadProgress}...` : 'Uploading...'}
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Images
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {images.map((image) => (
                    <div key={image.id} className="group relative aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
                        <Image
                            src={getImageUrl(image.url.replace('/gallery/', '/gallery/thumbs/'))}
                            alt={image.alt_text || 'Gallery image'}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 15vw"
                            className="object-cover transition-transform group-hover:scale-105"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target.src.includes('/thumbs/')) {
                                    target.src = getImageUrl(image.url);
                                }
                            }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDelete(image.id, image.url)}
                                className="scale-90 hover:scale-100 transition-transform"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                {images.length === 0 && (
                    <div className="col-span-full h-40 flex flex-col items-center justify-center text-stone-500 border-2 border-dashed border-stone-200 rounded-lg">
                        <p>No images in the gallery yet.</p>
                        <p className="text-sm">Upload images to see them here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
