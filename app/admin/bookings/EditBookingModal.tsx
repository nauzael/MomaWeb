'use client';

import { useState } from 'react';
import { fetchApi } from '@/lib/api-client';

import { X, Calendar as CalendarIcon, Users, DollarSign, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface EditBookingModalProps {
    booking: any;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function EditBookingModal({ booking, isOpen, onClose, onUpdate }: EditBookingModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        travel_date: booking.travel_date,
        guests_count: booking.guests_count,
        total_amount: booking.total_amount,
        status: booking.status
    });

    if (!isOpen) return null;

    // Calculate unit price based on initial values to allow dynamic updates
    const unitPrice = booking.total_amount / booking.guests_count;

    const handleGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const count = parseInt(e.target.value) || 0;
        setFormData({
            ...formData,
            guests_count: count,
            total_amount: count * unitPrice
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            id: booking.id,
            ...formData
        };
        console.log('Updating booking with payload:', payload);
        try {
            const response = await fetchApi<any>('admin/bookings/update.php', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            console.log('Update response:', response);
            onUpdate();
            onClose();
        } catch (error: any) {
            console.error('Update error:', error);
            alert('Error al actualizar la reserva: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50 dark:bg-stone-950">
                    <h3 className="font-black text-lg text-stone-900 dark:text-white">Editar Reserva</h3>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4" autoComplete="off">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-stone-400">Fecha de Viaje</label>
                        <div className="relative">
                            <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                            <input
                                type="date"
                                value={formData.travel_date}
                                onChange={(e) => setFormData({ ...formData, travel_date: e.target.value })}
                                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg pl-10 pr-3 py-2 text-sm font-medium focus:ring-2 focus:ring-moma-green outline-none"
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-stone-400">Pasajeros</label>
                        <div className="relative">
                            <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                            <input
                                type="number"
                                min="1"
                                value={formData.guests_count}
                                onChange={handleGuestsChange}
                                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg pl-10 pr-3 py-2 text-sm font-medium focus:ring-2 focus:ring-moma-green outline-none"
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-stone-400">Monto Total</label>
                        <div className="relative">
                            <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                            <input
                                type="number"
                                value={formData.total_amount}
                                onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) })}
                                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg pl-10 pr-3 py-2 text-sm font-medium focus:ring-2 focus:ring-moma-green outline-none"
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-stone-400">Estado</label>
                        <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, status: 'pending' })}
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${formData.status === 'pending'
                                    ? 'bg-white dark:bg-stone-700 text-orange-500 shadow-sm'
                                    : 'text-stone-400 hover:text-stone-600'
                                    }`}
                            >
                                Pendiente
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, status: 'confirmed' })}
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${formData.status === 'confirmed'
                                    ? 'bg-white dark:bg-stone-700 text-moma-green shadow-sm'
                                    : 'text-stone-400 hover:text-stone-600'
                                    }`}
                            >
                                Confirmado
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, status: 'cancelled' })}
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${formData.status === 'cancelled'
                                    ? 'bg-white dark:bg-stone-700 text-red-500 shadow-sm'
                                    : 'text-stone-400 hover:text-stone-600'
                                    }`}
                            >
                                Cancelado
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-xl border border-stone-200 font-bold text-stone-500 hover:bg-stone-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 rounded-xl bg-moma-green text-white font-bold hover:bg-opacity-90 flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
