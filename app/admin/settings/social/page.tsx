'use client';

import { useState, useEffect } from 'react';
import { 
    Facebook, Instagram, Link2, Unlink, CheckCircle, AlertCircle, 
    Loader2, RefreshCw, Trash2, Plus, Settings, ExternalLink 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialAccount {
    id: string;
    platform: 'facebook' | 'instagram';
    accountName: string;
    pageId?: string;
    pageName?: string;
    followersCount?: number;
    isActive: boolean;
    connectedAt: string;
    lastUsedAt?: string;
}

const META_APP_ID = 'TU_META_APP_ID';
const REDIRECT_URI = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/social/oauth/callback` 
    : '';

export default function SocialSettingsPage() {
    const [accounts, setAccounts] = useState<SocialAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showApiConfig, setShowApiConfig] = useState(false);
    const [apiConfig, setApiConfig] = useState({
        appId: '',
        appSecret: ''
    });

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        setIsLoading(true);
        setError(null);
        
        const mockAccounts: SocialAccount[] = [
            {
                id: '1',
                platform: 'facebook',
                accountName: 'Moma Excursiones',
                pageId: '123456789',
                pageName: 'Moma Excursiones',
                followersCount: 5234,
                isActive: true,
                connectedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                lastUsedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        setTimeout(() => {
            setAccounts(mockAccounts);
            setIsLoading(false);
        }, 500);
    };

    const handleConnect = async (platform: 'facebook' | 'instagram') => {
        setIsConnecting(platform);
        setError(null);

        if (!apiConfig.appId || !apiConfig.appSecret) {
            setShowApiConfig(true);
            setIsConnecting(null);
            return;
        }

        const scope = platform === 'facebook' 
            ? 'pages_manage_posts,pages_read_engagement' 
            : 'instagram_basic,instagram_manage_insights';
        
        const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${apiConfig.appId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${scope}&response_type=code&state=${platform}`;
        
        window.open(authUrl, '_blank', 'width=600,height=700');
        
        setTimeout(() => {
            setIsConnecting(null);
        }, 2000);
    };

    const handleDisconnect = async (accountId: string) => {
        if (!confirm('¿Estás seguro de que quieres desconectar esta cuenta?')) {
            return;
        }

        setAccounts(prev => prev.filter(a => a.id !== accountId));
    };

    const handleSaveConfig = () => {
        setShowApiConfig(false);
        setError(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-moma-green animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
                        Redes Sociales
                    </h1>
                    <p className="text-stone-500 text-sm mt-1">
                        Conecta tus cuentas de Facebook e Instagram para publicar automáticamente
                    </p>
                </div>
                <button
                    onClick={() => setShowApiConfig(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-xl text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                >
                    <Settings className="w-4 h-4" />
                    Configurar API
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Facebook Section */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
                <div className="p-6 border-b border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Facebook className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-stone-900 dark:text-white">Facebook</h2>
                            <p className="text-sm text-stone-500">Publica en tu página de Facebook</p>
                        </div>
                        {accounts.find(a => a.platform === 'facebook' && a.isActive) ? (
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                <CheckCircle className="w-4 h-4" />
                                Conectado
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 text-stone-500 rounded-lg text-sm font-medium">
                                <AlertCircle className="w-4 h-4" />
                                No conectado
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    {accounts.find(a => a.platform === 'facebook' && a.isActive) ? (
                        <div className="space-y-4">
                            {accounts.filter(a => a.platform === 'facebook').map(account => (
                                <div key={account.id} className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-800 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Facebook className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-stone-900 dark:text-white">{account.pageName}</p>
                                            <p className="text-xs text-stone-500">{account.followersCount?.toLocaleString()} seguidores</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDisconnect(account.id)}
                                        className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                                    >
                                        <Unlink className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <button
                            onClick={() => handleConnect('facebook')}
                            disabled={isConnecting === 'facebook'}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            {isConnecting === 'facebook' ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Link2 className="w-5 h-5" />
                            )}
                            Conectar Facebook
                        </button>
                    )}
                </div>
            </div>

            {/* Instagram Section */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
                <div className="p-6 border-b border-stone-100 dark:border-stone-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                            <Instagram className="w-6 h-6 text-pink-600" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-stone-900 dark:text-white">Instagram</h2>
                            <p className="text-sm text-stone-500">Publica en tu cuenta de Instagram</p>
                        </div>
                        {accounts.find(a => a.platform === 'instagram' && a.isActive) ? (
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                <CheckCircle className="w-4 h-4" />
                                Conectado
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 text-stone-500 rounded-lg text-sm font-medium">
                                <AlertCircle className="w-4 h-4" />
                                No conectado
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    {accounts.find(a => a.platform === 'instagram' && a.isActive) ? (
                        <div className="space-y-4">
                            {accounts.filter(a => a.platform === 'instagram').map(account => (
                                <div key={account.id} className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-800 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                                            <Instagram className="w-5 h-5 text-pink-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-stone-900 dark:text-white">@{account.accountName}</p>
                                            <p className="text-xs text-stone-500">{account.followersCount?.toLocaleString()} seguidores</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDisconnect(account.id)}
                                        className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                                    >
                                        <Unlink className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-stone-500">
                                Para conectar Instagram, primero debes conectar una página de Facebook.
                            </p>
                            <button
                                onClick={() => handleConnect('instagram')}
                                disabled={!accounts.find(a => a.platform === 'facebook' && a.isActive) || isConnecting === 'instagram'}
                                className="w-full py-3 px-4 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                {isConnecting === 'instagram' ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Link2 className="w-5 h-5" />
                                )}
                                Conectar Instagram
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* API Configuration Modal */}
            {showApiConfig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-stone-100 dark:border-stone-800">
                            <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                                Configurar API de Meta
                            </h2>
                            <p className="text-sm text-stone-500 mt-1">
                                Ingresa las credenciales de tu app en Meta for Developers
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                                    App ID
                                </label>
                                <input
                                    type="text"
                                    value={apiConfig.appId}
                                    onChange={(e) => setApiConfig({ ...apiConfig, appId: e.target.value })}
                                    placeholder="1234567890123456"
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                                    App Secret
                                </label>
                                <input
                                    type="password"
                                    value={apiConfig.appSecret}
                                    onChange={(e) => setApiConfig({ ...apiConfig, appSecret: e.target.value })}
                                    placeholder="••••••••••••••••"
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                                />
                            </div>

                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    <strong>¿Cómo obtener las credenciales?</strong>
                                </p>
                                <ol className="text-xs text-blue-600 dark:text-blue-300 mt-2 list-decimal list-inside space-y-1">
                                    <li>Ve a <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="underline">Meta for Developers</a></li>
                                    <li>Crea una nueva app tipo "Consumer"</li>
                                    <li>Agrega "Iniciar sesión con Facebook" como producto</li>
                                    <li>Copia el App ID y App Secret aquí</li>
                                </ol>
                            </div>
                        </div>

                        <div className="p-6 border-t border-stone-100 dark:border-stone-800 flex gap-3">
                            <button
                                onClick={() => setShowApiConfig(false)}
                                className="flex-1 py-3 px-4 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveConfig}
                                className="flex-1 py-3 px-4 bg-moma-green text-white rounded-xl font-bold hover:bg-moma-green/90 transition-colors"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
