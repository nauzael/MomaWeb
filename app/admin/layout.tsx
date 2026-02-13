'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SidebarNav from "@/components/admin/SidebarNav";
import LogoutButton from "@/components/admin/LogoutButton";
import AdminMobileHeader from "@/components/admin/AdminMobileHeader";
import { useAuth } from "@/lib/auth-client";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Don't show anything until we know the auth status
    // But once authenticated, we keep the layout stable
    if (loading && !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#f5f7f9]">
                <div className="w-8 h-8 border-4 border-moma-green/20 border-t-moma-green rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex h-screen w-full bg-[#f5f7f9] text-[#1a1a1a] overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-[#061a15] hidden md:flex flex-col shrink-0 relative">
                <Link href="/" className="p-8 flex items-center justify-center group transition-all">
                    <div className="relative w-40 h-16 shrink-0">
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
                            {user?.email?.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Logged In as</p>
                            <p className="text-sm font-bold text-white truncate">{user?.email?.split('@')[0]}</p>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </aside>

            {/* Content Overflow Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <AdminMobileHeader />

                {/* Header */}
                <header className="hidden md:flex h-20 bg-white border-b border-[#eef1f4] items-center justify-between px-8 shrink-0">
                    <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Hola, Administrador</h1>
                </header>

                {/* Main Scrollable Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
