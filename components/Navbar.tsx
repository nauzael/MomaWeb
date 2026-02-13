'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();
    const isSpecialPage = pathname !== '/';

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
        if (target.startsWith('/#')) {
            if (pathname === '/') {
                e.preventDefault();
                const id = target.split('#')[1];
                const element = document.getElementById(id);
                if (element) {
                    const offset = 100;
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = element.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    setMobileMenuOpen(false);
                }
            }
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        if (mobileMenuOpen) setMobileMenuOpen(false);
    }, [pathname]);

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out",
                (scrolled || isSpecialPage)
                    ? "bg-background/60 backdrop-blur-xl shadow-sm py-3"
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
                                scrolled || isSpecialPage
                                    ? "h-10 w-32"
                                    : "h-20 w-64"
                            )}
                            aria-label={t.nav.logoAria}
                        >
                            <Image
                                src={(scrolled || isSpecialPage) ? "/images/logo.png" : "/images/logo-white.png"}
                                alt={t.nav.logoAlt}
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-6">
                            <Link
                                href="/#experiencias"
                                onClick={(e) => handleNavClick(e, '/#experiencias')}
                                className={cn("transition-all px-3 py-2 rounded-full text-base font-bold font-sans hover:bg-white/10", (scrolled || isSpecialPage) ? "text-foreground hover:text-primary" : "text-stone-100 hover:text-white")}
                            >
                                {t.nav.experiences}
                            </Link>
                            <Link
                                href="/#nosotros"
                                onClick={(e) => handleNavClick(e, '/#nosotros')}
                                className={cn("transition-all px-3 py-2 rounded-full text-base font-bold font-sans hover:bg-white/10", (scrolled || isSpecialPage) ? "text-foreground hover:text-primary" : "text-stone-100 hover:text-white")}
                            >
                                {t.nav.about}
                            </Link>
                            <Link href="/blog" className={cn("transition-all px-3 py-2 rounded-full text-base font-bold font-sans hover:bg-white/10", (scrolled || isSpecialPage) ? "text-foreground hover:text-primary" : "text-stone-100 hover:text-white")}>
                                {t.nav.blog}
                            </Link>
                            <Link
                                href="/#contacto"
                                onClick={(e) => handleNavClick(e, '/#contacto')}
                                className={cn("transition-all px-3 py-2 rounded-full text-base font-bold font-sans hover:bg-white/10", (scrolled || isSpecialPage) ? "text-foreground hover:text-primary" : "text-stone-100 hover:text-white")}
                            >
                                {t.nav.contact}
                            </Link>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all",
                                (scrolled || isSpecialPage) ? "text-stone-600 hover:bg-stone-100" : "text-white/80 hover:bg-white/10"
                            )}
                        >
                            <Globe className="w-4 h-4" />
                            {language === 'es' ? 'EN' : 'ES'}
                        </button>
                        <Link href="/admin/dashboard" className="bg-moma-green text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-opacity-90 transition-all">
                            {t.nav.agency}
                        </Link>
                    </div>

                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all min-h-[44px]",
                                (scrolled || isSpecialPage) ? "text-stone-600 hover:bg-stone-100" : "text-white/80 hover:bg-white/10"
                            )}
                        >
                            <Globe className="w-4 h-4" />
                            {language === 'es' ? 'EN' : 'ES'}
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className={cn("p-3 rounded-md transition-all min-w-[48px] min-h-[48px] flex items-center justify-center", (scrolled || isSpecialPage) ? "text-foreground hover:bg-stone-100" : "text-white hover:bg-white/10")}
                            aria-label={mobileMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        {/* Menu Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 z-50 w-[85vw] max-w-sm md:hidden bg-stone-50 dark:bg-stone-950 shadow-2xl"
                        >
                            <div className="flex flex-col h-full pt-24 px-6 pb-6 overflow-y-auto">
                                <nav className="flex flex-col space-y-2">
                                    <Link
                                        href="/#experiencias"
                                        onClick={(e) => handleNavClick(e, '/#experiencias')}
                                        className="text-lg font-bold text-foreground hover:text-primary hover:bg-stone-100 dark:hover:bg-stone-900 transition-all py-4 px-4 rounded-xl border-b border-stone-200 dark:border-stone-800 min-h-[56px] flex items-center"
                                    >
                                        {t.nav.experiences}
                                    </Link>
                                    <Link
                                        href="/#nosotros"
                                        onClick={(e) => handleNavClick(e, '/#nosotros')}
                                        className="text-lg font-bold text-foreground hover:text-primary hover:bg-stone-100 dark:hover:bg-stone-900 transition-all py-4 px-4 rounded-xl border-b border-stone-200 dark:border-stone-800 min-h-[56px] flex items-center"
                                    >
                                        {t.nav.about}
                                    </Link>
                                    <Link href="/blog" className="text-lg font-bold text-foreground hover:text-primary hover:bg-stone-100 dark:hover:bg-stone-900 transition-all py-4 px-4 rounded-xl border-b border-stone-200 dark:border-stone-800 min-h-[56px] flex items-center">
                                        {t.nav.blog}
                                    </Link>
                                    <Link
                                        href="/#contacto"
                                        onClick={(e) => handleNavClick(e, '/#contacto')}
                                        className="text-lg font-bold text-foreground hover:text-primary hover:bg-stone-100 dark:hover:bg-stone-900 transition-all py-4 px-4 rounded-xl border-b border-stone-200 dark:border-stone-800 min-h-[56px] flex items-center"
                                    >
                                        {t.nav.contact}
                                    </Link>
                                    <Link href="/admin/dashboard" className="bg-moma-green text-white px-6 py-4 rounded-full text-base font-bold hover:bg-opacity-90 transition-all text-center mt-6 min-h-[56px] flex items-center justify-center">
                                        {t.nav.agency}
                                    </Link>
                                </nav>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}
