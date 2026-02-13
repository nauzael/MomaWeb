'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Map, Users, ImageIcon, BarChart3, Settings, Loader2 } from "lucide-react";
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
        if (!authLoading) {
            if (user) {
                const isAdmin =
                    user.email === 'admin@momaturismo.com' ||
                    user.email === 'admin@moma.com' ||
                    user.role?.toLowerCase() === 'admin' ||
                    user.role?.toLowerCase() === 'superadmin';

                setPermissions(isAdmin ? ['all'] : ['dashboard']);
            }
            setLoading(false);
        }
    }, [user, authLoading]);

    const hasAccess = (key: string) => {
        if (permissions.includes('all')) return true;
        return permissions.includes(key);
    };

    // If we're loading and don't have permissions yet, show a subtle placeholder
    if ((loading || authLoading) && permissions.length === 0) {
        return <div className="px-8 mt-4"><Loader2 className="w-5 h-5 animate-spin text-white/10" /></div>;
    }

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
