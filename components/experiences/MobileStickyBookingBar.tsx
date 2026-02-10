'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MobileStickyBookingBarProps {
    priceCop: number;
    experienceTitle: string;
    onBookClick?: () => void;
}

export default function MobileStickyBookingBar({ priceCop, experienceTitle, onBookClick }: MobileStickyBookingBarProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show bar after scrolling past the hero section (approx 400px)
            setIsVisible(window.scrollY > 400);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 p-4 pb-6 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-transform duration-300 animate-in slide-in-from-bottom-full">
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Precio por persona</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-moma-green">${priceCop.toLocaleString('es-CO')}</span>
                        <span className="text-xs font-bold text-stone-400">COP</span>
                    </div>
                </div>

                <button
                    onClick={() => {
                        // Scroll smoothly to the main booking widget if onBookClick is not provided
                        if (onBookClick) {
                            onBookClick();
                        } else {
                            const widget = document.getElementById('booking-widget-container');
                            if (widget) {
                                widget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            } else {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }
                    }}
                    className="flex-1 bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-6 py-3 rounded-xl font-bold shadow-lg shadow-stone-900/20 active:scale-95 transition-all text-sm uppercase tracking-wide"
                >
                    Reservar Ahora
                </button>
            </div>
        </div>
    );
}
