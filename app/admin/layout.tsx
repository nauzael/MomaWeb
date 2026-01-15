import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Map, Calendar, Settings, Users } from "lucide-react";
import SidebarNav from "@/components/admin/SidebarNav";
import LogoutButton from "@/components/admin/LogoutButton";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Check Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    // Allow if role is admin or editor (or just admin for now)
    // If no profile exists yet (legacy users), we might want to fail safe or allow if dev mode.
    // For production, strictly check role.
    if (profile && profile.role !== 'admin' && profile.role !== 'editor') {
        // Redirect to unauthorized page or home
        redirect("/"); 
    }

    return (
        <div className="flex h-screen w-full bg-[#f5f7f9] text-[#1a1a1a] overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-[#061a15] hidden md:flex flex-col flex-shrink-0 relative">
                <Link href="/" className="p-8 flex items-center justify-center group transition-all">
                    <div className="relative w-40 h-16 flex-shrink-0">
                        <Image
                            src="/images/logo.png"
                            alt="Moma Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>

                <SidebarNav />

                {/* Logged in info */}
                <div className="p-4 mb-4">
                    <div className="bg-[#0c2a25] rounded-3xl p-4 flex items-center gap-3 border border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-moma-green/20 flex items-center justify-center text-moma-green font-bold text-xs uppercase">
                            {user.email?.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Logged In as</p>
                            <p className="text-sm font-bold text-white truncate">{user.email?.split('@')[0]}</p>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </aside>

            {/* Content Overflow Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-[#eef1f4] flex items-center justify-between px-8 flex-shrink-0">
                    <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Hola, Administrador</h1>
                </header>

                {/* Main Scrollable Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
