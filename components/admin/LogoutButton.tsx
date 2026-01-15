'use client';

import { LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
    const supabase = createClient();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
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
