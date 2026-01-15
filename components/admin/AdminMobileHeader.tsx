'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import SidebarNav from './SidebarNav';
import LogoutButton from './LogoutButton';

export default function AdminMobileHeader() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#061a15] text-white flex-shrink-0 sticky top-0 z-50 shadow-md">
             <div className="flex items-center gap-3">
                 <button 
                    onClick={() => setIsOpen(true)}
                    className="p-2 -ml-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Abrir menú"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <span className="font-bold text-lg">Moma Admin</span>
             </div>

             <Link href="/" className="relative w-20 h-8">
                <Image
                    src="/images/logo.png"
                    alt="Moma Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </Link>

            {/* Mobile Drawer */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex font-sans">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Drawer Content */}
                    <div className="relative w-[85%] max-w-xs bg-[#061a15] h-full shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <div className="relative w-32 h-10">
                                <Image
                                    src="/images/logo.png"
                                    alt="Moma Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-stone-400 hover:text-white p-1"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-6">
                            <SidebarNav onLinkClick={() => setIsOpen(false)} />
                        </div>

                        <div className="p-6 border-t border-white/5 bg-[#04120e]">
                            <div className="bg-[#0c2a25] rounded-2xl p-4 border border-white/5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Sesión</span>
                                    <LogoutButton />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
