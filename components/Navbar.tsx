'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const pathname = usePathname();
    const isExperienceDetail = pathname?.startsWith('/experiencias/');
    const isBlog = pathname?.startsWith('/blog');
    const isSpecialPage = isExperienceDetail || isBlog;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out",
                (scrolled || isBlog)
                    ? "bg-background/60 backdrop-blur-xl shadow-sm py-3"
                    : isExperienceDetail
                        ? "bg-black/30 backdrop-blur-xl border-b border-white/10 py-3"
                        : "bg-transparent py-8"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div className="shrink-0 flex items-center">
                        <Link
                            href="/"
                            className={cn(
                                "relative transition-all duration-500 ease-in-out block",
                                scrolled || isBlog
                                    ? "h-10 w-32"
                                    : isExperienceDetail
                                        ? "h-12 w-40"
                                        : "h-20 w-64"
                            )}
                            aria-label="Moma Excursiones - Inicio"
                        >
                            <Image
                                src={(scrolled || isBlog) ? "/images/logo.png" : "/images/logo-white.png"}
                                alt="Moma Excursiones Logo"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-6">
                            <Link href="/#experiencias" className={cn("transition-all px-3 py-2 rounded-full text-base font-bold font-sans hover:bg-white/10", (scrolled || isBlog) ? "text-foreground hover:text-primary" : "text-stone-100 hover:text-white")}>
                                {t.nav.experiences}
                            </Link>
                            <Link href="/#nosotros" className={cn("transition-all px-3 py-2 rounded-full text-base font-bold font-sans hover:bg-white/10", (scrolled || isBlog) ? "text-foreground hover:text-primary" : "text-stone-100 hover:text-white")}>
                                {t.nav.about}
                            </Link>
                            <Link href="/#blog" className={cn("transition-all px-3 py-2 rounded-full text-base font-bold font-sans hover:bg-white/10", (scrolled || isBlog) ? "text-foreground hover:text-primary" : "text-stone-100 hover:text-white")}>
                                {t.nav.blog}
                            </Link>
                            <Link href="/#contacto" className={cn("transition-all px-3 py-2 rounded-full text-base font-bold font-sans hover:bg-white/10", (scrolled || isBlog) ? "text-foreground hover:text-primary" : "text-stone-100 hover:text-white")}>
                                {t.nav.contact}
                            </Link>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all",
                                (scrolled || isBlog) ? "text-stone-600 hover:bg-stone-100" : "text-white/80 hover:bg-white/10"
                            )}
                        >
                            <Globe className="w-4 h-4" />
                            {language === 'es' ? 'EN' : 'ES'}
                        </button>
                        <Link href="/admin/dashboard" className="bg-moma-green text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-opacity-90 transition-all">
                            {t.nav.agency}
                        </Link>
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={cn("inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-moma-green", (scrolled || isBlog) ? "text-stone-400 hover:text-stone-500 hover:bg-stone-100" : "text-white hover:bg-white/10")}
                            aria-expanded={mobileMenuOpen}
                            aria-controls="mobile-menu"
                            aria-label={mobileMenuOpen ? "Cerrar menú principal" : "Abrir menú principal"}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        id="mobile-menu"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-background/95 backdrop-blur-xl border-t border-stone-200 dark:border-stone-800"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <Link
                                href="/#experiencias"
                                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-stone-100 dark:hover:bg-stone-800"
                            >
                                {t.nav.experiences}
                            </Link>
                            <Link
                                href="/#nosotros"
                                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-stone-100 dark:hover:bg-stone-800"
                            >
                                {t.nav.about}
                            </Link>
                            <Link
                                href="/#blog"
                                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-stone-100 dark:hover:bg-stone-800"
                            >
                                {t.nav.blog}
                            </Link>
                            <Link
                                href="/#contacto"
                                className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:text-primary hover:bg-stone-100 dark:hover:bg-stone-800"
                            >
                                {t.nav.contact}
                            </Link>
                            <Link
                                href="/admin/dashboard"
                                className="block px-3 py-2 rounded-md text-base font-medium text-moma-green hover:text-moma-green/80 hover:bg-stone-100 dark:hover:bg-stone-800"
                            >
                                {t.nav.agency}
                            </Link>
                            <button
                                onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-stone-600 hover:bg-stone-100"
                            >
                                <Globe className="w-5 h-5" />
                                {language === 'es' ? 'English (EN)' : 'Español (ES)'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
