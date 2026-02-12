'use client';

import { useState, useRef, useEffect } from 'react';
import { fetchApi } from '@/lib/api-client';
import { MoreVertical, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import EditBookingModal from './EditBookingModal';
import DeleteBookingModal from './DeleteBookingModal';
import { useRouter } from 'next/navigation';

interface BookingRowActionsProps {
    booking: any;
}

export default function BookingRowActions({ booking }: BookingRowActionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Simple positioning logic
            setMenuPosition({
                top: rect.bottom + window.scrollY,
                right: window.innerWidth - rect.right
            });
        }
    }, [isOpen]);

    const updateStatus = async (newStatus: string) => {
        setLoading(true);
        try {
            await fetchApi('admin/bookings/update.php', {
                method: 'POST',
                body: JSON.stringify({ bookingId: booking.id, status: newStatus })
            });

            setIsOpen(false);
            window.location.reload();
        } catch (error: any) {
            alert('Error al actualizar la reserva: ' + (error.message || 'Error desconocido'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const deleteBooking = async () => {
        setLoading(true);
        try {
            await fetchApi('admin/bookings/delete.php', {
                method: 'POST',
                body: JSON.stringify({ id: booking.id })
            });

            setIsDeleteOpen(false);
            window.location.reload();
        } catch (error: any) {
            alert('Error al eliminar la reserva: ' + (error.message || 'Error desconocido'));
            console.error('Delete error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setIsOpen(false);
        setIsDeleteOpen(true);
    };

    return (
        <>
            <div className="relative">
                <button
                    ref={buttonRef}
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-stone-50 rounded-lg text-stone-300 hover:text-stone-600 transition-all outline-none focus:outline-none border-none"
                >
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            {isOpen && (
                <div
                    ref={menuRef}
                    className="fixed w-48 bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-100 dark:border-stone-800 z-50 overflow-hidden"
                    style={{
                        top: buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + 5 : 0,
                        left: buttonRef.current ? buttonRef.current.getBoundingClientRect().left - 150 : 0,
                    }}
                >
                    <div className="p-1">
                        {booking.status !== 'confirmed' && (
                            <button
                                onClick={() => updateStatus('confirmed')}
                                disabled={loading}
                                className="w-full text-left px-3 py-2 text-sm font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <CheckCircle className="w-4 h-4 text-moma-green" />
                                Confirmar
                            </button>
                        )}

                        {booking.status !== 'cancelled' && (
                            <button
                                onClick={() => updateStatus('cancelled')}
                                disabled={loading}
                                className="w-full text-left px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors"
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
                            className="w-full text-left px-3 py-2 text-sm font-bold text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                            Editar
                        </button>

                        <button
                            onClick={handleDeleteClick}
                            disabled={loading}
                            className="w-full text-left px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                        </button>
                    </div>
                </div>
            )}

            <EditBookingModal
                booking={booking}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onUpdate={() => window.location.reload()}
            />

            <DeleteBookingModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={deleteBooking}
                bookingInfo={{
                    customerName: booking.customer_name ? booking.customer_name.split('|')[0].trim() : 'Cliente',
                    experienceTitle: booking.experiences?.title || 'Experiencia',
                    travelDate: booking.travel_date ? format(new Date(booking.travel_date), 'PPP', { locale: es }) : '-'
                }}
                loading={loading}
            />
        </>
    );
}
