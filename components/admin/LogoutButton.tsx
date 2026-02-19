'use client';

import { LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-client';

export default function LogoutButton() {
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };


    return (
        <button
            onClick={handleLogout}
            className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title="Cerrar Sesión"
        >
            <LogOut className="w-5 h-5" />
        </button>
    );
}
