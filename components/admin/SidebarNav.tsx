'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, Calendar, Settings, Users, BarChart3, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
    { key: 'dashboard', label: "Panel Principal", href: "/admin/dashboard", icon: LayoutDashboard },
    { key: 'bookings', label: "Reservas", href: "/admin/bookings", icon: Calendar },
    { key: 'experiences', label: "Experiencias", href: "/admin/experiences", icon: Map },
    { key: 'customers', label: "Clientes", href: "/admin/customers", icon: Users },
    { key: 'reports', label: "Reportes", href: "/admin/reports", icon: BarChart3 },
    { key: 'settings', label: "Configuración", href: "/admin/settings", icon: Settings },
];

export default function SidebarNav({ onLinkClick }: { onLinkClick?: () => void }) {
    const pathname = usePathname();
    const [permissions, setPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchPermissions = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // FAILSAFE: If email is the main admin, force full access immediately
            // This works even if the profile doesn't exist yet
            if (user.email === 'admin@momaturismo.com' || user.email === 'admin@moma.com') {
                setPermissions(['all']);
                setLoading(false);
                return;
            }

            // Fetch profile and role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role_id, role, roles (permissions)') // fetch relation
                .eq('id', user.id)
                .single();

            if (profile) {
                // Support both legacy role string and new relation
                // If user is 'admin' (legacy string) OR has role 'Admin' (via relation), give full access
                if (profile.role === 'admin') {
                    setPermissions(['all']);
                } else if (profile.roles) {
                    const rolesData = profile.roles as any;
                    // Handle case where relation is returned as array or single object
                    if (Array.isArray(rolesData) && rolesData[0]?.permissions) {
                        setPermissions(rolesData[0].permissions);
                    } else if (rolesData?.permissions) {
                         setPermissions(rolesData.permissions);
                    } else {
                         setPermissions(['dashboard']);
                    }
                } else {
                    // Fallback for users without role assigned yet or failed relation fetch
                    // Default to viewing nothing or dashboard only to avoid empty sidebar confusion
                    console.log('No specific permissions found, defaulting to dashboard');
                    setPermissions(['dashboard']);
                }
            } else {
                 setPermissions(['dashboard']); // Fallback if profile fetch fails
            }
            setLoading(false);
        };

        fetchPermissions();
    }, []);

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-stone-500" /></div>;
    }

    const hasAccess = (key: string) => {
        if (permissions.includes('all')) return true;
        return permissions.includes(key);
    };

    return (
        <nav className="flex-1 px-4 space-y-1 mt-4">
            {NAV_ITEMS.map((item) => {
                if (!hasAccess(item.key)) return null;
                
                const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

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
