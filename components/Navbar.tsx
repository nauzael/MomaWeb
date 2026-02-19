'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Menu, X, MapPin, Compass, BookOpen, MessageCircle, Globe, ChevronRight, Phone, Instagram, Facebook, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const pathname = usePathname();
    const isSpecialPage = pathname !== '/' && !pathname.startsWith('/admin');

    // Scroll detection
    const { scrollY } = useScroll();
    useMotionValueEvent(scrollY, "change", (latest) => {
        const isScrolled = latest > 50;
        if (isScrolled !== scrolled) {
            setScrolled(isScrolled);
        }
    });

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
        if (target.startsWith('/#')) {
            if (pathname === '/') {
                e.preventDefault();
                const id = target.split('#')[1];
                const element = document.getElementById(id);
                if (element) {
                    // Offset calculation to account for the floating header
                    const offset = 120;
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

    // Close mobile menu on path change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    // Handle hash on initial load
    useEffect(() => {
        if (pathname === '/' && window.location.hash) {
            const id = window.location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    const offset = 120;
                    const elementRect = element.getBoundingClientRect().top;
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const offsetPosition = elementRect - bodyRect - offset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }, 500);
            }
        }
    }, [pathname]);

    // Nav Item Component for consistent animation
    const NavItem = ({ href, label }: { href: string; label: string }) => {
        const isHovered = false; // We could use state, but CSS group-hover is cleaner here
        return (
            <Link
                href={href}
                onClick={(e) => handleNavClick(e, href)}
                className="relative group px-4 py-2"
            >
                <span className={cn(
                    "relative z-10 text-sm font-bold tracking-wide transition-colors duration-300",
                    scrolled || isSpecialPage ? "text-stone-800 dark:text-stone-100" : "text-white group-hover:text-white"
                )}>
                    {label}
                </span>
                <span className={cn(
                    "absolute inset-x-0 bottom-0 h-0.5 transform scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-75 origin-center",
                    scrolled || isSpecialPage ? "bg-moma-green" : "bg-white"
                )} />
            </Link>
        );
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{
                    y: 0,
                    opacity: 1,
                    top: scrolled ? 16 : 0,
                    borderRadius: 9999
                }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className={cn(
                    "fixed z-50 px-6 flex items-center justify-between transition-all duration-500 ease-in-out",
                    scrolled
                        ? "left-4 right-4 md:left-8 md:right-8 mx-auto bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl shadow-lg shadow-stone-900/5 max-w-5xl py-3"
                        : isSpecialPage
                            ? "left-[10%] right-[10%] bg-stone-900/90 backdrop-blur-md py-4"
                            : "left-4 right-4 md:left-8 md:right-8 mx-auto max-w-5xl py-6 bg-transparent"
                )}
            >
                {/* Logo */}
                <Link
                    href="/"
                    className="relative shrink-0 transition-transform hover:scale-105 active:scale-95 ml-2"
                    aria-label={t.nav.logoAria}
                >
                    <div className={cn("relative transition-all duration-300", scrolled || isSpecialPage ? "h-10 w-32" : "h-12 w-40")}>
                        <Image
                            src={scrolled || isSpecialPage ? "/images/logo.png" : "/images/logo-white.png"}
                            alt={t.nav.logoAlt}
                            fill
                            className="object-contain object-left"
                            priority
                            sizes="(max-width: 768px) 150px, 200px"
                        />
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1">
                    <NavItem href="/#experiencias" label={t.nav.experiences} />
                    <NavItem href="/#nosotros" label={t.nav.about} />
                    <NavItem href="/#blog" label={t.nav.blog} />
                    <NavItem href="/#contacto" label={t.nav.contact} />
                </div>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-3 pl-4 border-l border-stone-200/20 ml-2 mr-2">
                    <button
                        onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border border-transparent",
                            scrolled || isSpecialPage
                                ? "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:border-stone-200"
                                : "text-white/90 hover:bg-white/10 hover:border-white/20"
                        )}
                    >
                        <Globe className="w-3.5 h-3.5" />
                        {language === 'es' ? 'EN' : 'ES'}
                    </button>

                    <Link
                        href="/admin/dashboard"
                        className={cn(
                            "px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5",
                            scrolled || isSpecialPage
                                ? "bg-moma-green text-white hover:bg-[#00796b]"
                                : "bg-white text-stone-900 hover:bg-stone-100"
                        )}
                    >
                        {t.nav.agency}
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <div className="md:hidden flex items-center gap-3">
                    <button
                        onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                        className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                            scrolled || isSpecialPage ? "text-stone-600 dark:text-stone-300" : "text-white/90"
                        )}
                    >
                        {language === 'es' ? 'EN' : 'ES'}
                    </button>
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className={cn(
                            "p-2.5 rounded-full transition-all active:scale-90",
                            scrolled || isSpecialPage
                                ? "text-stone-800 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800"
                                : "text-white hover:bg-white/10"
                        )}
                        aria-label={t.nav.openMenu}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu - Glassmorphism Design */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm md:hidden"
                            style={{ zIndex: 999 }}
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full max-w-[320px] bg-white dark:bg-stone-950 shadow-2xl md:hidden flex flex-col"
                            style={{ zIndex: 1000 }}
                        >
                            {/* Mobile Header */}
                            <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800/50">
                                <span className="text-xl font-heading font-black text-stone-900 dark:text-white tracking-tight">
                                    Moma<span className="text-moma-green">.</span>
                                </span>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Mobile Links */}
                            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                                {[
                                    { href: '/#experiencias', label: t.nav.experiences, icon: Compass },
                                    { href: '/#nosotros', label: t.nav.about, icon: MapPin },
                                    { href: '/#blog', label: t.nav.blog, icon: BookOpen },
                                    { href: '/#contacto', label: t.nav.contact, icon: MessageCircle },
                                ].map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={(e) => handleNavClick(e, item.href)}
                                        className="group flex items-center justify-between p-4 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-900 active:scale-[0.98] transition-all border border-transparent hover:border-stone-100 dark:hover:border-stone-800"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-moma-green/10 flex items-center justify-center text-moma-green group-hover:bg-moma-green group-hover:text-white transition-colors">
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-lg text-stone-700 dark:text-stone-200">
                                                {item.label}
                                            </span>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-moma-green group-hover:translate-x-1 transition-all" />
                                    </Link>
                                ))}
                            </div>

                            {/* Mobile Footer */}
                            <div className="p-6 bg-stone-50 dark:bg-stone-900 space-y-4">
                                <Link
                                    href="/admin/dashboard"
                                    className="flex items-center justify-center w-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-6 py-4 rounded-xl font-bold shadow-lg shadow-stone-900/10 active:scale-[0.98] transition-all"
                                >
                                    {t.nav.agency}
                                </Link>

                                <div className="flex justify-between items-center pt-2">
                                    <a href="tel:+573016566932" className="p-3 bg-white dark:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 hover:text-moma-green hover:shadow-md transition-all">
                                        <Phone className="w-5 h-5" />
                                    </a>
                                    <div className="flex gap-2">
                                        <a href="https://instagram.com/momanature" target="_blank" rel="noreferrer" className="p-3 bg-white dark:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 hover:text-pink-600 hover:shadow-md transition-all">
                                            <Instagram className="w-5 h-5" />
                                        </a>
                                        <a href="https://facebook.com/momanature" target="_blank" rel="noreferrer" className="p-3 bg-white dark:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400 hover:text-blue-600 hover:shadow-md transition-all">
                                            <Facebook className="w-5 h-5" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
