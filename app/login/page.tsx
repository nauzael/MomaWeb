'use client';
import { useAuth } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login({ email, password });
            router.push('/admin/dashboard');
        } catch (error: any) {
            alert('Error: ' + error.message);
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

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-600 dark:bg-stone-700 dark:text-white focus:ring-2 focus:ring-moma-green focus:border-transparent outline-none transition-all"
                            placeholder="admin@momaturismo.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-600 dark:bg-stone-700 dark:text-white focus:ring-2 focus:ring-moma-green focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-moma-green text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Entrando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link href="/" className="text-sm text-stone-400 hover:text-stone-600">Volver al inicio</Link>
                </div>
            </div>
        </div>
    );
}
