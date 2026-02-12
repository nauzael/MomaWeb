'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { X, Calendar as CalendarIcon, User, MapPin } from 'lucide-react';
import 'react-day-picker/dist/style.css';

interface AdminBookingCalendarProps {
    bookings: any[];
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminBookingCalendar({ bookings, isOpen, onClose }: AdminBookingCalendarProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    if (!isOpen) return null;

    // Extract dates with bookings
    const bookedDates = bookings
        .filter(b => b.status !== 'cancelled')
        .map(b => parseISO(b.travel_date));

    // Filter bookings for selected date
    const selectedBookings = selectedDate
        ? bookings.filter(b => isSameDay(parseISO(b.travel_date), selectedDate))
        : [];

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-stone-900 rounded-4xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-in zoom-in-95 duration-200 ring-1 ring-stone-900/5">
                {/* Calendar Side */}
                <div className="p-8 bg-stone-50 dark:bg-stone-950 flex-1 flex flex-col border-r border-stone-100 dark:border-stone-800 overflow-y-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                                <CalendarIcon className="w-6 h-6 text-moma-green" />
                                Calendario
                            </h2>
                            <p className="text-sm text-stone-500 font-medium mt-1">Selecciona un día para ver detalles</p>
                        </div>
                        <button onClick={onClose} className="md:hidden p-2 hover:bg-stone-200 rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 flex justify-center items-start w-full">
                        <style>{`
                          .rdp { --rdp-cell-size: 50px; --rdp-accent-color: #29afb7; --rdp-background-color: #e0f2f1; margin: 0; width: 100%; max-width: 100%; }
                          .rdp-month { width: 100%; }
                          .rdp-table { width: 100%; max-width: 100%; }
                          .rdp-day_selected:not([disabled]) { background-color: var(--rdp-accent-color); color: white; font-weight: bold; }
                          .rdp-day_selected:hover:not([disabled]) { background-color: var(--rdp-accent-color); opacity: 0.8; }
                          .rdp-day_booked { position: relative; font-weight: bold; color: #29afb7; }
                          .rdp-day_booked::after {
                            content: '';
                            position: absolute;
                            bottom: 8px;
                            left: 50%;
                            transform: translateX(-50%);
                            width: 5px;
                            height: 5px;
                            border-radius: 50%;
                            background-color: currentColor;
                          }
                          .rdp-caption_label { font-size: 1.1rem; font-weight: 800; color: #1c1917; text-transform: capitalize; }
                          .rdp-head_cell { font-weight: 700; color: #a8a29e; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
                          .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f5f5f4; border-radius: 12px; }
                        `}</style>
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            locale={es}
                            modifiers={{ booked: bookedDates }}
                            modifiersClassNames={{ booked: 'rdp-day_booked' }}
                            className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 w-full"
                        />
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-6 text-xs font-bold uppercase tracking-wide text-stone-400">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-moma-green" />
                            Reserva activa
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-stone-300" />
                            Sin reservas
                        </div>
                    </div>
                </div>

                {/* Details Side */}
                <div className="flex-1 bg-white dark:bg-stone-900 flex flex-col w-full md:max-w-md">
                    <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-white dark:bg-stone-900 z-10 sticky top-0">
                        <div>
                            <span className="text-xs font-bold uppercase text-stone-400 tracking-wider">Reservas para el</span>
                            <h3 className="font-black text-2xl text-stone-900 dark:text-white capitalize leading-none mt-1">
                                {selectedDate ? format(selectedDate, 'EEEE d, MMMM', { locale: es }) : 'Selecciona fecha'}
                            </h3>
                        </div>
                        <button onClick={onClose} className="hidden md:flex w-10 h-10 items-center justify-center hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50/30">
                        {selectedBookings.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-stone-300 text-center py-12">
                                <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center mb-4">
                                    <CalendarIcon className="w-8 h-8 opacity-20 text-stone-900" />
                                </div>
                                <p className="font-bold text-lg text-stone-400">Sin actividad</p>
                                <p className="text-sm">No hay reservas programadas para este día.</p>
                            </div>
                        ) : (
                            selectedBookings.map((booking) => (
                                <div key={booking.id} className="bg-white dark:bg-stone-800 rounded-2xl p-5 border border-stone-100 dark:border-stone-700 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-moma-green to-teal-600 flex items-center justify-center text-xs font-black text-white uppercase shadow-lg shadow-moma-green/20">
                                                {booking.customer_name.substring(0, 2)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-stone-900 dark:text-white leading-tight">{booking.customer_name}</h4>
                                                <p className="text-xs text-stone-400 font-medium truncate max-w-[150px]">{booking.customer_email}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-[#ccfcf3] text-[#00b894]' :
                                            booking.status === 'cancelled' ? 'bg-red-50 text-red-500' :
                                                'bg-orange-50 text-orange-500'
                                            }`}>
                                            {booking.status === 'confirmed' ? 'Confirmado' : booking.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                                        </span>
                                    </div>

                                    <div className="space-y-3 pt-3 border-t border-stone-50 dark:border-stone-700">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-4 h-4 text-stone-400 mt-0.5" />
                                            <div>
                                                <span className="text-xs font-bold text-stone-400 uppercase block mb-0.5">Experiencia</span>
                                                <span className="text-sm font-bold text-stone-700 dark:text-stone-200 block leading-tight">
                                                    {booking.experiences?.title || 'Experiencia no disponible'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-900/50 p-2 rounded-lg">
                                                <User className="w-4 h-4 text-stone-400" />
                                                <span className="text-sm font-bold text-stone-600 dark:text-stone-300">{booking.guests_count} Pasajeros</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-900/50 p-2 rounded-lg">
                                                <span className="text-stone-400 font-bold text-xs">$</span>
                                                <span className="text-sm font-black text-stone-900 dark:text-white">
                                                    {Number(booking.total_amount).toLocaleString('es-CO')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {selectedBookings.length > 0 && (
                        <div className="p-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-100 dark:border-stone-800 text-center">
                            <span className="text-xs font-bold text-stone-400 uppercase">
                                Total del día: {selectedBookings.length} reservas
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
