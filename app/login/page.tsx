'use client';
import { useAuth } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login({ email, password });
            router.push('/admin/dashboard');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-100 dark:bg-stone-900 px-4">
            <div className="bg-white dark:bg-stone-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-stone-200 dark:border-stone-700">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-moma-green tracking-tighter mb-2">MOMA</h1>
                    <p className="text-stone-500 text-sm">Acceso Administrativo</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-600 dark:bg-stone-700 dark:text-white focus:ring-2 focus:ring-moma-green focus:border-transparent outline-none transition-all"
                            placeholder="admin@momaturismo.com"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-600 dark:bg-stone-700 dark:text-white focus:ring-2 focus:ring-moma-green focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-moma-green text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Iniciando sesión...</span>
                            </>
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/" className="text-sm text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}
