'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, Calendar, Settings, Users, BarChart3, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-client";

const NAV_ITEMS = [
    { key: 'dashboard', label: "Panel Principal", href: "/admin/dashboard", icon: LayoutDashboard },
    { key: 'bookings', label: "Reservas", href: "/admin/bookings", icon: Calendar },
    { key: 'experiences', label: "Experiencias", href: "/admin/experiences", icon: Map },
    { key: 'customers', label: "Clientes", href: "/admin/customers", icon: Users },
    { key: 'gallery', label: "Galería", href: "/admin/gallery", icon: ImageIcon },
    { key: 'reports', label: "Reportes", href: "/admin/reports", icon: BarChart3 },
    { key: 'settings', label: "Configuración", href: "/admin/settings", icon: Settings },
];

export default function SidebarNav({ onLinkClick }: { onLinkClick?: () => void }) {
    const pathname = usePathname();
    const { user, loading: authLoading } = useAuth();
    const [permissions, setPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("SidebarNav Auth State:", { authLoading, userEmail: user?.email, userRole: user?.role });
        if (!authLoading) {
            if (user) {
                // FAILSAFE: Si es el admin principal o tiene rol de admin en la sesión
                const isAdmin =
                    user.email === 'admin@momaturismo.com' ||
                    user.email === 'admin@moma.com' ||
                    user.role?.toLowerCase() === 'admin' ||
                    user.role?.toLowerCase() === 'superadmin';

                console.log("Is Admin Check:", isAdmin);

                if (isAdmin) {
                    setPermissions(['all']);
                } else {
                    setPermissions(['dashboard']);
                }
            } else {
                console.log("No user found in SidebarNav");
            }
            // Pequeño delay para asegurar que el renderizado no parpadee
            const timer = setTimeout(() => setLoading(false), 100);
            return () => clearTimeout(timer);
        }
    }, [user, authLoading]);

    if (loading || authLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-stone-500" /></div>;
    }

    const hasAccess = (key: string) => {
        if (permissions.includes('all')) return true;
        return permissions.includes(key);
    };

    // Normalizar pathname para comparación (quitar barra final si existe)
    const normalizedPathname = pathname.replace(/\/$/, "");

    return (
        <nav className="flex-1 px-4 space-y-1 mt-4">
            {NAV_ITEMS.map((item) => {
                if (!hasAccess(item.key)) return null;

                const normalizedItemHref = item.href.replace(/\/$/, "");
                const isActive = normalizedPathname === normalizedItemHref ||
                    (item.href !== "/admin/dashboard" && normalizedPathname.startsWith(normalizedItemHref));

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onLinkClick}
                        className={cn(
                            "group flex items-center px-6 py-4 rounded-full transition-all duration-300 relative overflow-hidden",
                            isActive
                                ? "bg-moma-green text-black font-bold shadow-lg shadow-moma-green/30"
                                : "text-stone-400 hover:text-moma-green hover:bg-white/5"
                        )}
                    >
                        <item.icon className={cn(
                            "w-5 h-5 mr-4 transition-all",
                            isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                        )} />
                        <span className={cn(
                            "transition-all",
                            isActive ? "font-bold" : "font-medium"
                        )}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
