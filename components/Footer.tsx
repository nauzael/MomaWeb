'use client';
import { Facebook, Instagram } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();
    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
        if (target.startsWith('/#') && window.location.pathname === '/') {
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
            }
        }
    };

    return (
        <footer className="bg-stone-950 text-stone-400 py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 mb-16">
                    <div className="space-y-6">
                        <div className="relative h-12 w-48">
                            <Image
                                src="/images/logo.png"
                                alt="Moma Excursiones Logo"
                                fill
                                className="object-contain object-left brightness-0 invert"
                                priority
                            />
                        </div>
                        <p className="text-sm leading-relaxed text-stone-300">
                            {t.footer.description}
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://www.instagram.com/momaexcursiones/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center hover:bg-moma-green hover:border-moma-green hover:text-white transition-all duration-300 hover:-translate-y-1" aria-label="Síguenos en Instagram">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://www.facebook.com/momaexcursiones" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center hover:bg-moma-green hover:border-moma-green hover:text-white transition-all duration-300 hover:-translate-y-1" aria-label="Síguenos en Facebook">
                                <Facebook className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-heading font-bold mb-6 text-lg">{t.footer.navTitle}</h3>
                        <ul className="space-y-4 text-sm">
                            <li><a href="/" className="hover:text-moma-green transition-colors hover:pl-1 duration-300 block">{t.footer.home}</a></li>
                            <li><a href="/#experiencias" onClick={(e) => handleNavClick(e, '/#experiencias')} className="hover:text-moma-green transition-colors hover:pl-1 duration-300 block">{t.nav.experiences}</a></li>
                            <li><a href="/#nosotros" onClick={(e) => handleNavClick(e, '/#nosotros')} className="hover:text-moma-green transition-colors hover:pl-1 duration-300 block">{t.footer.about}</a></li>
                            <li><a href="/blog" className="hover:text-moma-green transition-colors hover:pl-1 duration-300 block">{t.nav.blog}</a></li>
                            <li><a href="/#contacto" onClick={(e) => handleNavClick(e, '/#contacto')} className="hover:text-moma-green transition-colors hover:pl-1 duration-300 block">{t.nav.contact}</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-heading font-bold mb-6 text-lg">{t.footer.infoTitle}</h3>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#" className="hover:text-moma-green transition-colors hover:pl-1 duration-300 block">{t.footer.privacy}</a></li>
                            <li><a href="#" className="hover:text-moma-green transition-colors hover:pl-1 duration-300 block">{t.footer.terms}</a></li>
                            <li><a href="#" className="hover:text-moma-green transition-colors hover:pl-1 duration-300 block">{t.footer.sustainability}</a></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-stone-800/50 flex flex-col md:flex-row justify-between items-center text-xs text-stone-500">
                    <p>&copy; {new Date().getFullYear()} Excursiones Montes de María. {t.footer.allRightsReserved}</p>
                    <div className="flex items-center space-x-2 mt-4 md:mt-0 bg-stone-900/50 px-3 py-1 rounded-full border border-stone-800">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="font-medium text-stone-300">{t.footer.certified}</span>
                    </div>
                </div>
        </footer>
    )
}
