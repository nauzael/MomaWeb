import { createClient } from "@/utils/supabase/server";
// import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Map, Calendar, Settings, Users } from "lucide-react";
import SidebarNav from "@/components/admin/SidebarNav";

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
        // redirect("/login");
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
                        <div className="w-10 h-10 rounded-xl bg-moma-green/20 flex items-center justify-center text-moma-green font-bold">
                            CR
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Logged In as</p>
                            <p className="text-sm font-bold text-white truncate">Carlos Ruiz</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Content Overflow Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-[#eef1f4] flex items-center justify-between px-8 flex-shrink-0">
                    <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Hola, Administrador</h1>

                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-stone-400">
                                <Map className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search bookings, tours, or hikers..."
                                className="bg-[#ecf3f1] border-none rounded-2xl pl-12 pr-6 py-2.5 text-sm w-96 focus:ring-2 focus:ring-moma-green transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="w-10 h-10 rounded-2xl bg-[#ecf3f1] flex items-center justify-center text-stone-600 hover:bg-moma-green/10 transition-colors">
                                <Calendar className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 rounded-2xl bg-[#ecf3f1] flex items-center justify-center text-stone-600 hover:bg-moma-green/10 transition-colors">
                                <Users className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 rounded-2xl bg-[#ecf3f1] flex items-center justify-center text-stone-600 hover:bg-moma-green/10 transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Scrollable Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
