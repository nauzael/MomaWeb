'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function LogoutButton() {
    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' });
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
