'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { ModeToggle } from './mode-toggle';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const isExperienceDetail = pathname?.startsWith('/experiencias/');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out",
                scrolled
                    ? "bg-background/60 backdrop-blur-xl shadow-sm py-3"
                    : isExperienceDetail
                        ? "bg-black/30 backdrop-blur-xl border-b border-white/10 py-3"
                        : "bg-transparent py-8"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div className="flex-shrink-0 flex items-center">
                        <Link
                            href="/"
                            className={cn(
                                "relative transition-all duration-500 ease-in-out block",
                                scrolled
                                    ? "h-10 w-32"
                                    : isExperienceDetail
                                        ? "h-12 w-40"
                                        : "h-20 w-64"
                            )}
                        >
                            <Image
                                src="/images/logo.png"
                                alt="Moma Excursiones"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-6">
                            <Link href="/#experiencias" className={cn("transition-all px-3 py-2 rounded-full text-base font-bold hover:bg-white/10", scrolled ? "text-foreground hover:text-primary" : "text-stone-100 hover:text-white")}>
                                Experiencias
                            </Link>
                            <Link href="/#nosotros" className={cn("transition-all px-3 py-2 rounded-full text-base font-bold hover:bg-white/10", scrolled ? "text-foreground hover:text-primary" : "text-stone-100 hover:text-white")}>
                                Nosotros
                            </Link>
                            <Link href="/#contacto" className={cn("transition-all px-3 py-2 rounded-full text-base font-bold hover:bg-white/10", scrolled ? "text-foreground hover:text-primary" : "text-stone-100 hover:text-white")}>
                                Contacto
                            </Link>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <ModeToggle className={cn(scrolled ? "" : "text-white hover:text-white bg-white/10 hover:bg-white/20 border-transparent")} />
                        <Link href="/admin/dashboard" className="bg-moma-earth text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-opacity-90 transition-all">
                            Agencia
                        </Link>
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <button className={cn("inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-moma-green", scrolled ? "text-stone-400 hover:text-stone-500 hover:bg-stone-100" : "text-white hover:bg-white/10")}>
                            <span className="sr-only">Open main menu</span>
                            <Menu className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
