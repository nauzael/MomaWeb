
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Settings, Facebook } from 'lucide-react';

export default function SetupPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 1: Credentials
    const [appId, setAppId] = useState('');
    const [appSecret, setAppSecret] = useState('');

    // Step 2: Connect
    // We'll use the Facebook SDK for Login
    const [fbSdkLoaded, setFbSdkLoaded] = useState(false);

    // Step 3: Select Page
    const [pages, setPages] = useState<any[]>([]);
    const [selectedPageId, setSelectedPageId] = useState('');

    // Init: Load current settings
    useEffect(() => {
        async function loadSettings() {
            try {
                const res = await fetch('/api/admin/social/setup');
                const data = await res.json();
                if (data.appId) setAppId(data.appId);
                // We won't get secret for security, but we know it's set if isConfigured is true
            } catch (e) {
                console.error("Failed to load settings");
            }
        }
        if (user) loadSettings();
    }, [user]);

    // Load FB SDK
    useEffect(() => {
        if (step === 2 && appId) {
            // Initialize FB SDK
            (window as any).fbAsyncInit = function () {
                (window as any).FB.init({
                    appId: appId,
                    cookie: true,
                    xfbml: true,
                    version: 'v19.0'
                });
                setFbSdkLoaded(true);
            };

            (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) { return; }
                js = d.createElement(s); js.id = id;
                (js as any).src = "https://connect.facebook.net/en_US/sdk.js";
                (fjs.parentNode as any).insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        }
    }, [step, appId]);


    const handleSaveCredentials = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/social/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'save_credentials', appId, appSecret })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save credentials');

            setStep(2);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFacebookLogin = () => {
        if (!fbSdkLoaded || !(window as any).FB) {
            setError("Facebook SDK not loaded yet. Check your App ID.");
            return;
        }

        (window as any).FB.login(function (response: any) {
            if (response.authResponse) {
                console.log('Welcome!  Fetching your information.... ');
                const accessToken = response.authResponse.accessToken;
                exchangeToken(accessToken);
            } else {
                console.log('User cancelled login or did not fully authorize.');
                setError("Login cancelled or failed.");
            }
        }, { scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish' });
    };

    const exchangeToken = async (shortToken: string) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/social/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'exchange_token', shortLivedToken: shortToken })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to exchange token');

            setPages(data.pages.data);
            setStep(3);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSavePageConfig = async () => {
        if (!selectedPageId) return;
        setIsLoading(true);
        try {
            const page = pages.find(p => p.id === selectedPageId);
            const instagramId = page.instagram_business_account?.id;

            const res = await fetch('/api/admin/social/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'save_page_config',
                    pageId: selectedPageId,
                    pageToken: page.access_token,
                    instagramId
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save configuration');

            // Done!
            router.push('/admin/social');
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) return <div className="p-8 text-center text-stone-500">Cargando...</div>;
    if (!user) { router.push('/login'); return null; }

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 space-y-8">
            <header className="text-center space-y-2">
                <h1 className="text-3xl font-black text-[#1a1a1a]">Configuración de Meta</h1>
                <p className="text-stone-500">Conecta tu página de Facebook e Instagram para publicar contenido.</p>
            </header>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`w-3 h-3 rounded-full transition-all ${step >= i ? 'bg-moma-green scale-110' : 'bg-stone-200'}`} />
                ))}
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#eef1f4]">

                {/* Step 1: Credentials */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-lg font-bold text-[#1a1a1a]">
                            <Settings className="w-5 h-5 text-moma-green" />
                            <h2>Paso 1: Credenciales de App</h2>
                        </div>
                        <p className="text-sm text-stone-500">
                            Ingresa el <strong>App ID</strong> y <strong>App Secret</strong> de tu aplicación en <a href="https://developers.facebook.com" target="_blank" className="text-blue-600 underline">Meta for Developers</a>.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-1">App ID</label>
                                <input
                                    type="text"
                                    value={appId}
                                    onChange={e => setAppId(e.target.value)}
                                    className="w-full bg-[#f5f7f9] border border-[#eef1f4] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-moma-green/50"
                                    placeholder="Ej: 1234567890"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-stone-700 mb-1">App Secret</label>
                                <input
                                    type="password"
                                    value={appSecret}
                                    onChange={e => setAppSecret(e.target.value)}
                                    className="w-full bg-[#f5f7f9] border border-[#eef1f4] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-moma-green/50"
                                    placeholder="••••••••••••••"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveCredentials}
                            disabled={!appId || !appSecret || isLoading}
                            className="w-full bg-[#061a15] text-white py-4 rounded-xl font-bold hover:bg-[#0c2a25] transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                            Guardar y Continuar
                        </button>
                    </div>
                )}

                {/* Step 2: Connect */}
                {step === 2 && (
                    <div className="space-y-6 text-center">
                        <div className="flex items-center justify-center gap-3 text-lg font-bold text-[#1a1a1a]">
                            <Facebook className="w-5 h-5 text-blue-600" />
                            <h2>Paso 2: Conectar Cuenta</h2>
                        </div>
                        <p className="text-sm text-stone-500">
                            Haz clic abajo para iniciar sesión con Facebook y autorizar a Moma Web a administrar tus páginas.
                        </p>

                        <div className="py-6">
                            <button
                                onClick={handleFacebookLogin}
                                disabled={isLoading}
                                className="bg-[#1877F2] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#166fe5] transition-all shadow-lg shadow-blue-500/30 flex items-center gap-3 mx-auto"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Facebook className="w-5 h-5 fill-current" />}
                                Iniciar Sesión con Facebook
                            </button>
                        </div>
                        <p className="text-xs text-stone-400">
                            Asegúrate de conceder permisos para todas las páginas que quieras usar.
                        </p>
                    </div>
                )}

                {/* Step 3: Select Page */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-lg font-bold text-[#1a1a1a]">
                            <CheckCircle2 className="w-5 h-5 text-moma-green" />
                            <h2>Paso 3: Seleccionar Página</h2>
                        </div>
                        <p className="text-sm text-stone-500">
                            Elige qué página de Facebook (y cuenta de Instagram asociada) quieres usar.
                        </p>

                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {pages.map(page => (
                                <div
                                    key={page.id}
                                    onClick={() => setSelectedPageId(page.id)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPageId === page.id ? 'border-moma-green bg-moma-green/5' : 'border-[#eef1f4] hover:border-stone-300'}`}
                                >
                                    <div className="font-bold text-[#1a1a1a]">{page.name}</div>
                                    <div className="text-xs text-stone-500 mt-1 flex gap-2">
                                        <span>ID: {page.id}</span>
                                        {page.instagram_business_account && (
                                            <span className="text-pink-600 bg-pink-50 px-2 rounded-full font-bold">Instagram Conectado</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleSavePageConfig}
                            disabled={!selectedPageId || isLoading}
                            className="w-full bg-[#061a15] text-white py-4 rounded-xl font-bold hover:bg-[#0c2a25] transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            Finalizar Configuración
                        </button>
                    </div>
                )}

                {error && (
                    <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
