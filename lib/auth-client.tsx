'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchApi } from './api-client';
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
    login: (credentials: any) => Promise<void>;
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
            // When in local development, we need to call the remote API_BASE_URL explicitly 
            // to ensure cookies are sent/received correctly for the auth check.
            const url = process.env.NEXT_PUBLIC_API_URL
                ? `${process.env.NEXT_PUBLIC_API_URL}/auth/me.php`
                : 'auth/me.php';

            const data = await fetchApi<{ user: User | null }>(url);
            setUser(data.user);
        } catch (error) {
            console.error('Auth check failed', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        refresh();
    }, []);

    const login = async (credentials: any) => {
        const data = await fetchApi<{ user: User }>('auth/login.php', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        setUser(data.user);
        router.refresh(); // Refresh current route
    };

    const logout = async () => {
        await fetchApi('auth/logout.php', { method: 'POST' });
        if (typeof window !== 'undefined') {
            localStorage.removeItem('php_session_id');
        }
        setUser(null);
        router.push('/');
        router.refresh();
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
