'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, Calendar, Settings, Users, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Bookings", href: "/admin/bookings", icon: Calendar },
    { label: "Tours", href: "/admin/experiences", icon: Map },
    { label: "Customers", href: "/admin/customers", icon: Users },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function SidebarNav() {
    const pathname = usePathname();

    return (
        <nav className="flex-1 px-4 space-y-1 mt-4">
            {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

                return (
                    <Link
                        key={item.href}
                        href={item.href}
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
