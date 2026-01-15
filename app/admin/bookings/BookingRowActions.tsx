'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import EditBookingModal from './EditBookingModal';

interface BookingRowActionsProps {
    booking: any;
}

export default function BookingRowActions({ booking }: BookingRowActionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const updateStatus = async (newStatus: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/bookings/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: booking.id, status: newStatus })
            });
            
            if (!res.ok) throw new Error('Failed to update');
            
            setIsOpen(false);
            router.refresh(); 
        } catch (error) {
            alert('Error al actualizar la reserva');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-stone-50 rounded-lg text-stone-300 hover:text-stone-600 transition-all"
                >
                    <MoreVertical className="w-5 h-5" />
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-100 dark:border-stone-800 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-1">
                            {booking.status !== 'confirmed' && (
                                <button 
                                    onClick={() => updateStatus('confirmed')}
                                    disabled={loading}
                                    className="w-full text-left px-3 py-2 text-sm font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4 text-moma-green" />
                                    Confirmar
                                </button>
                            )}
                            
                            {booking.status !== 'cancelled' && (
                                <button 
                                    onClick={() => updateStatus('cancelled')}
                                    disabled={loading}
                                    className="w-full text-left px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Cancelar
                                </button>
                            )}

                            <div className="h-px bg-stone-100 dark:bg-stone-800 my-1" />

                            <button 
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsEditOpen(true);
                                }} 
                                className="w-full text-left px-3 py-2 text-sm font-bold text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Editar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <EditBookingModal 
                booking={booking} 
                isOpen={isEditOpen} 
                onClose={() => setIsEditOpen(false)} 
                onUpdate={() => router.refresh()}
            />
        </>
    );
}
