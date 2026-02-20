
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-client';
import { Share2, Instagram, Facebook, Send, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon, Settings, ArrowRight, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchApi, getImageUrl } from '@/lib/api-client';
import MediaSelector from '@/components/admin/MediaSelector';

export default function SocialMediaPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [message, setMessage] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [link, setLink] = useState('');
    const [platforms, setPlatforms] = useState<string[]>(['facebook', 'instagram']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
    const [isConfigured, setIsConfigured] = useState(true); // Assume configured until checked
    const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);

    // Check configuration on load
    useEffect(() => {
        async function checkConfig() {
            try {
                const data = await fetchApi<any>('/admin/social/setup.php');
                if (!data.isConfigured) {
                    setIsConfigured(false);
                }
            } catch (e) {
                console.error("Failed to check config");
            }
        }
        if (user) checkConfig();
    }, [user]);

    const togglePlatform = (platform: string) => {
        setPlatforms(prev =>
            prev.includes(platform)
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setResult(null);

        // Basic validation
        if (platforms.length === 0) {
            setResult({ success: false, message: 'Selecciona al menos una plataforma.' });
            setIsSubmitting(false);
            return;
        }

        if (platforms.includes('instagram') && !imageUrl) {
            setResult({ success: false, message: 'Instagram requiere una imagen.' });
            setIsSubmitting(false);
            return;
        }

        try {
            const data = await fetchApi<any>('/admin/social/publish.php', {
                method: 'POST',
                body: JSON.stringify({ message, imageUrl, link, platforms }),
            });

            if (data.success) {
                setResult({ success: true, message: 'Publicado exitosamente!', details: data.results });
                if (!imageUrl && !link) setMessage(''); // Clear message if simple post, keep url/link logic up to user
            } else {
                const errorMsg = data.errors ?
                    (Object.values(data.errors).join(', ') || data.error) :
                    (data.error || 'Error desconocido');
                setResult({ success: false, message: `Error al publicar: ${errorMsg}` });
            }

        } catch (error) {
            setResult({ success: false, message: 'Error de conexión con el servidor.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) return <div className="p-8 text-center text-stone-500">Cargando...</div>;
    if (!user) { router.push('/login'); return null; }

    if (!isConfigured) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
                <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-[#eef1f4] flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                        <Settings className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black text-[#1a1a1a] mb-2">Configuración Pendiente</h1>
                    <p className="text-stone-500 max-w-md mx-auto mb-8">
                        Para poder publicar en redes sociales, primero necesitas conectar tu cuenta de Facebook e Instagram.
                    </p>
                    <button
                        onClick={() => router.push('/admin/social/setup')}
                        className="bg-[#061a15] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#0c2a25] transition-all shadow-lg hover:-translate-y-1 flex items-center gap-2"
                    >
                        Comenzar Configuración <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-[#1a1a1a] tracking-tight">Redes Sociales</h1>
                    <p className="text-stone-500 font-medium text-sm md:text-base mt-1">
                        Crea, programa y publica contenido en Facebook e Instagram Moma
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-[#eef1f4] space-y-6 relative overflow-hidden">

                        {/* Platform Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider block">Plataformas</label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => togglePlatform('facebook')}
                                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all w-full md:w-auto justify-center ${platforms.includes('facebook')
                                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                                        : 'border-stone-200 text-stone-400 hover:border-blue-200'
                                        }`}
                                >
                                    <Facebook className="w-5 h-5" />
                                    <span>Facebook Page</span>
                                    {platforms.includes('facebook') && <CheckCircle2 className="w-4 h-4 ml-2" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => togglePlatform('instagram')}
                                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all w-full md:w-auto justify-center ${platforms.includes('instagram')
                                        ? 'border-pink-600 bg-pink-50 text-pink-700 font-bold'
                                        : 'border-stone-200 text-stone-400 hover:border-pink-200'
                                        }`}
                                >
                                    <Instagram className="w-5 h-5" />
                                    <span>Instagram</span>
                                    {platforms.includes('instagram') && <CheckCircle2 className="w-4 h-4 ml-2" />}
                                </button>
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider block">Mensaje / Caption</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="¿Qué quieres compartir hoy?"
                                className="w-full bg-[#f5f7f9] border border-[#eef1f4] rounded-2xl p-4 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-moma-green/50 text-[#1a1a1a] resize-none"
                            />
                        </div>

                        {/* Image URL Input */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider block flex items-center justify-between">
                                <span>URL de la Imagen</span>
                                <span className="text-xs text-stone-400 font-normal normal-case">(Requerido para Instagram)</span>
                            </label>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsMediaSelectorOpen(true)}
                                    className="shrink-0 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-4 rounded-2xl flex items-center justify-center transition-all border border-stone-200"
                                    title="Elegir desde Galería local"
                                >
                                    <UploadCloud className="w-5 h-5" />
                                </button>
                                <div className="relative flex-1">
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                    <input
                                        type="url"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                        className="w-full bg-[#f5f7f9] border border-[#eef1f4] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-moma-green/50 text-[#1a1a1a]"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-stone-400">Pega un link o toca el botón para subir/elegir una imagen de tu web (se enviará con tu dominio público).</p>
                        </div>

                        {/* Link Input (Facebook Only) */}
                        {platforms.includes('facebook') && !platforms.includes('instagram') && (
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-stone-700 uppercase tracking-wider block">Enlace (Opcional, solo Facebook)</label>
                                <input
                                    type="url"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="https://momaexcursiones.com/..."
                                    className="w-full bg-[#f5f7f9] border border-[#eef1f4] rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-moma-green/50 text-[#1a1a1a]"
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-[#061a15] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-[#0c2a25] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Publicando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Publicar Ahora
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Result Message */}
                        {result && (
                            <div className={`p-4 rounded-2xl flex items-start gap-3 ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {result.success ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                                <div>
                                    <p className="font-bold">{result.message}</p>
                                    {/* {result.details && <pre className="text-xs mt-2 opacity-80">{JSON.stringify(result.details, null, 2)}</pre>} */}
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Preview Section (Simplified) */}
                <div className="space-y-6">
                    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-[#eef1f4]">
                        <h3 className="text-xl font-black text-[#1a1a1a] mb-6">Vista Previa</h3>

                        <div className="space-y-6">
                            {/* Facebook Preview */}
                            {platforms.includes('facebook') && (
                                <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
                                    <div className="p-3 flex items-center gap-2 border-b border-stone-100 bg-stone-50">
                                        <Facebook className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-bold text-stone-600">Facebook Page</span>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 bg-stone-200 rounded-full"></div>
                                            <div className="space-y-1">
                                                <div className="h-2 w-24 bg-stone-200 rounded"></div>
                                                <div className="h-1.5 w-16 bg-stone-100 rounded"></div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-[#1a1a1a] whitespace-pre-wrap">{message || "Tu mensaje aparecerá aquí..."}</p>
                                        {imageUrl && (
                                            <div className="relative aspect-video bg-stone-100 rounded-lg overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        {link && !imageUrl && (
                                            <div className="p-3 bg-stone-50 rounded border border-stone-100 text-xs text-blue-600 truncate">
                                                {link}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Instagram Preview */}
                            {platforms.includes('instagram') && (
                                <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
                                    <div className="p-3 flex items-center gap-2 border-b border-stone-100 bg-stone-50">
                                        <Instagram className="w-4 h-4 text-pink-600" />
                                        <span className="text-xs font-bold text-stone-600">Instagram</span>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 bg-stone-200 rounded-full"></div>
                                            <div className="h-2 w-20 bg-stone-200 rounded"></div>
                                        </div>
                                        {imageUrl ? (
                                            <div className="relative aspect-square bg-stone-100 rounded-lg overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="aspect-square bg-stone-50 rounded-lg flex items-center justify-center text-stone-300 text-sm">
                                                Imagen requerida
                                            </div>
                                        )}
                                        <p className="text-sm text-[#1a1a1a] whitespace-pre-wrap">
                                            <span className="font-bold mr-1">momaexcursiones</span>
                                            {message || "Tu caption..."}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {!platforms.includes('facebook') && !platforms.includes('instagram') && (
                                <p className="text-center text-stone-400 text-sm py-8">Selecciona una plataforma para ver la vista previa.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <MediaSelector
                isOpen={isMediaSelectorOpen}
                onClose={() => setIsMediaSelectorOpen(false)}
                onSelect={(url) => setImageUrl(getImageUrl(url))}
                title="Elegir Imagen para Publicar"
            />
        </div>
    );
}
