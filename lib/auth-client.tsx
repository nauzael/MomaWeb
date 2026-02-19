'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchApi, setAuthenticated, setCsrfToken, clearCsrfToken } from './api-client';
import { useRouter } from 'next/navigation';

export interface User {
    id: string;
    email: string;
    name?: string;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => { },
    logout: async () => { },
    refresh: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const refresh = async () => {
        try {
            const url = process.env.NEXT_PUBLIC_API_URL
                ? `${process.env.NEXT_PUBLIC_API_URL}/auth/me.php`
                : 'auth/me.php';

            const data = await fetchApi<{ user: User | null }>(url);
            setUser(data.user);
            setAuthenticated(!!data.user);
        } catch (error) {
            console.error('Auth check failed', error);
            setUser(null);
            setAuthenticated(false);
            clearCsrfToken();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    const login = async (credentials: { email: string; password: string }) => {
        const data = await fetchApi<{ user: User; csrf_token?: string }>('auth/login.php', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        setUser(data.user);
        setAuthenticated(true);
        if (data.csrf_token) {
            setCsrfToken(data.csrf_token);
        }
        router.refresh();
    };

    const logout = async () => {
        try {
            await fetchApi('auth/logout.php', { method: 'POST' });
        } catch (error) {
            console.error("Logout error (server side)", error);
        } finally {
            setUser(null);
            setAuthenticated(false);
            clearCsrfToken();
            router.push('/');
            router.refresh();
        }
    };

    const contextValue = { user, loading, login, logout, refresh };

    return (
        <AuthContext.Provider value={contextValue} >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
