'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Users, Minus, Plus, Loader2, X, CheckCircle } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { cn } from '@/lib/utils';

interface BookingWidgetProps {
    priceCop: number;
    priceUsd: number;
    maxCapacity: number;
    experienceTitle: string;
    experienceId: string;
}

// Mock occupied dates
const TODAY = new Date();
const BOOKED_DATES = [
    new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 2),
    new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 5),
    new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 7),
];

export default function BookingWidget({ priceCop, priceUsd, maxCapacity, experienceTitle, experienceId }: BookingWidgetProps) {
    const [guests, setGuests] = useState(1);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastBookingId, setLastBookingId] = useState('');
    const [loading, setLoading] = useState(false);
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [availability, setAvailability] = useState<Record<string, number>>({});
    const calendarRef = useRef<HTMLDivElement>(null);

    // Fetch availability on mount and when calendar opens
    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const res = await fetch(`/api/bookings/availability?experienceId=${experienceId}`);
                if (res.ok) {
                    const data = await res.json();
                    setAvailability(data.availability || {});
                }
            } catch (error) {
                console.error("Error fetching availability:", error);
            }
        };

        if (isCalendarOpen) {
            fetchAvailability();
        }
    }, [isCalendarOpen, experienceId]);

    // Calculate totals
    const numPriceCop = Number(priceCop) || 0;
    const numPriceUsd = Number(priceUsd) || 0;
    const totalCop = numPriceCop * guests;

    const handleGuestChange = (delta: number) => {
        const newVal = guests + delta;
        if (newVal >= 1 && newVal <= maxCapacity) {
            setGuests(newVal);
        }
    };

    const handleBookingClick = () => {
        if (!selectedDate) {
            alert('Por favor selecciona una fecha para tu viaje.');
            return;
        }
        setShowConfirmation(true);
    };

    const confirmBooking = async () => {
        if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
            alert('Por favor completa tu nombre, correo y teléfono.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/bookings/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    experience_id: experienceId,
                    customer_name: contactName,
                    customer_email: contactEmail,
                    customer_phone: contactPhone,
                    travel_date: format(selectedDate!, 'yyyy-MM-dd'),
                    guests_count: guests,
                    total_amount: totalCop,
                    currency: 'COP'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al guardar la reserva');
            }

            setLastBookingId(data.booking.id);
            setShowConfirmation(false);
            setShowSuccess(true);
            
        } catch (error: any) {
            console.error('Booking error:', error);
            alert(`Hubo un error al procesar tu reserva: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSuccess = () => {
        setShowSuccess(false);
        setContactName('');
        setContactEmail('');
        setContactPhone('');
        setGuests(1);
        setSelectedDate(undefined);
        setLastBookingId('');
    };

    // Close calendar if clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date) {
            setIsCalendarOpen(false);
        }
    };

    const isDateDisabled = (date: Date) => {
        if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true; // Past dates
        
        const dateStr = format(date, 'yyyy-MM-dd');
        const bookedCount = availability[dateStr] || 0;
        
        // Disable if capacity is reached or if adding current guests would exceed capacity
        return (bookedCount + guests) > maxCapacity;
    };

    return (
        <>
            <div className="sticky top-24 bg-white border border-stone-200 shadow-xl rounded-2xl p-6 dark:bg-stone-900 dark:border-stone-800 transition-all font-sans relative z-10">
                <div className="mb-6">
                    <span className="text-stone-500 text-sm font-medium">Precio por persona</span>
                    <div className="flex items-baseline">
                        <span className="text-3xl font-heading font-bold text-moma-green bg-clip-text text-transparent bg-gradient-to-r from-moma-green to-teal-500">
                            ${numPriceCop.toLocaleString('es-CO')}
                        </span>
                        <span className="text-sm text-stone-400 ml-2 font-bold">COP</span>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">Aprox. ${Math.round(numPriceUsd)} USD</p>
                </div>

                <div className="space-y-4">
                    {/* Date Selection */}
                    <div className="relative" ref={calendarRef}>
                        <button
                            type="button"
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                            className={cn(
                                "w-full p-4 bg-stone-50 rounded-xl border cursor-pointer transition-colors group flex items-center justify-between text-left",
                                isCalendarOpen ? "border-moma-green ring-1 ring-moma-green" : "border-stone-100 hover:border-moma-green/50 dark:bg-stone-800 dark:border-stone-700"
                            )}
                            aria-haspopup="dialog"
                            aria-expanded={isCalendarOpen}
                            aria-label={selectedDate ? `Fecha seleccionada: ${format(selectedDate, 'PPP', { locale: es })}` : "Seleccionar fecha de viaje"}
                        >
                            <div className="flex-1">
                                <span className="block text-xs font-bold uppercase text-stone-400 mb-2 group-hover:text-moma-green transition-colors">Fecha de Viaje</span>
                                <div className="flex items-center text-stone-700 dark:text-stone-200">
                                    <CalendarIcon className="w-5 h-5 mr-3 text-stone-400 group-hover:text-moma-green" aria-hidden="true" />
                                    <span className={cn("text-sm font-medium", !selectedDate && "text-stone-400 font-normal")}>
                                        {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                                    </span>
                                </div>
                            </div>
                        </button>

                        {/* Calendar Popup */}
                        {isCalendarOpen && (
                            <div 
                                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200"
                                role="dialog"
                                aria-label="Calendario de disponibilidad"
                            >
                                <div className="flex justify-between items-center mb-2 px-2">
                                    <span className="text-xs font-bold uppercase text-stone-500">Disponibilidad</span>
                                    <button onClick={() => setIsCalendarOpen(false)} className="text-stone-400 hover:text-stone-600" aria-label="Cerrar calendario">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <style>{`
                          .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #29afb7; --rdp-background-color: #e0f2f1; margin: 0; }
                          .rdp-day_selected:not([disabled]) { background-color: var(--rdp-accent-color); color: white; }
                          .rdp-day_selected:hover:not([disabled]) { background-color: var(--rdp-accent-color); opacity: 0.8; }
                          .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f5f5f4; }
                        `}</style>
                                <DayPicker
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                    locale={es}
                                    disabled={isDateDisabled}
                                    modifiersStyles={{
                                        disabled: { textDecoration: 'line-through', color: '#a8a29e', background: 'transparent' }
                                    }}
                                    footer={
                                        <div className="mt-4 text-xs text-center border-t pt-2 border-stone-100 dark:border-stone-800 text-stone-400 flex justify-center gap-4">
                                            <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-moma-green mr-1"></div> Libre</div>
                                            <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-stone-300 mr-1"></div> Ocupado</div>
                                        </div>
                                    }
                                />
                            </div>
                        )}
                    </div>

                    {/* Guest Selection */}
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 dark:bg-stone-800 dark:border-stone-700">
                        <label className="block text-xs font-bold uppercase text-stone-400 mb-2">Viajeros</label>
                        <div className="flex items-center justify-between text-stone-700 dark:text-stone-200">
                            <div className="flex items-center">
                                <Users className="w-5 h-5 mr-3 text-stone-400" />
                                <span className="text-sm font-medium">{guests} {guests === 1 ? 'Viajero' : 'Viajeros'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleGuestChange(-1)}
                                    disabled={guests <= 1}
                                    className="w-8 h-8 rounded-full bg-white dark:bg-stone-700 flex items-center justify-center text-stone-500 hover:bg-stone-200 disabled:opacity-50 transition-colors shadow-sm"
                                    aria-label="Disminuir número de viajeros"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleGuestChange(1)}
                                    disabled={guests >= maxCapacity}
                                    className="w-8 h-8 rounded-full bg-white dark:bg-stone-700 flex items-center justify-center text-stone-500 hover:bg-stone-200 disabled:opacity-50 transition-colors shadow-sm"
                                    aria-label="Aumentar número de viajeros"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary (Conditional) */}
                    <div className="pt-2 pb-2">
                        <div className="flex justify-between items-center text-sm font-medium text-stone-600 dark:text-stone-300">
                            <span>Total estimado</span>
                            <span className="text-lg font-bold text-stone-900 dark:text-white">${totalCop.toLocaleString('es-CO')}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleBookingClick}
                        className="w-full bg-moma-earth text-white font-bold py-4 rounded-xl hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        Reservar Ahora
                    </button>
                    <p className="text-xs text-center text-stone-400 mt-4">
                        No se cobrará nada todavía.
                    </p>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200 dark:border-stone-800">
                        <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900 text-center">
                            <h3 className="text-xl font-bold text-stone-900 dark:text-white">Confirma tu Reserva</h3>
                            <p className="text-xs text-stone-500 mt-0.5">Revisa los detalles antes de continuar.</p>
                        </div>

                        <div className="px-4 py-3 space-y-2 bg-white dark:bg-stone-900">
                            <div className="flex justify-between items-center py-1 border-b border-stone-50 dark:border-stone-800">
                                <span className="text-stone-500 text-xs font-medium">Experiencia</span>
                                <span className="font-bold text-stone-900 dark:text-white text-right max-w-[60%] truncate text-sm">{experienceTitle}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-stone-50 dark:border-stone-800">
                                <span className="text-stone-500 text-xs font-medium">Fecha</span>
                                <span className="font-bold text-stone-900 dark:text-white text-sm">
                                    {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : '-'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-stone-50 dark:border-stone-800">
                                <span className="text-stone-500 text-xs font-medium">Pasajeros</span>
                                <span className="font-bold text-stone-900 dark:text-white text-sm">{guests} personas</span>
                            </div>
                            <div className="pt-2 space-y-2">
                                <h4 className="text-xs font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wide">Datos de contacto</h4>
                                <div className="space-y-2">
                                    <div className="space-y-0.5">
                                        <label htmlFor="contact-name" className="text-[10px] font-bold uppercase text-stone-400">Nombre completo</label>
                                        <input
                                            id="contact-name"
                                            type="text"
                                            value={contactName}
                                            onChange={(e) => setContactName(e.target.value)}
                                            className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-moma-green"
                                            placeholder="Tu nombre"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-0.5">
                                            <label htmlFor="contact-email" className="text-[10px] font-bold uppercase text-stone-400">Correo</label>
                                            <input
                                                id="contact-email"
                                                type="email"
                                                value={contactEmail}
                                                onChange={(e) => setContactEmail(e.target.value)}
                                                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-moma-green"
                                                placeholder="tucorreo@ejemplo.com"
                                            />
                                        </div>
                                        <div className="space-y-0.5">
                                            <label htmlFor="contact-phone" className="text-[10px] font-bold uppercase text-stone-400">Teléfono</label>
                                            <input
                                                id="contact-phone"
                                                type="tel"
                                                value={contactPhone}
                                                onChange={(e) => setContactPhone(e.target.value)}
                                                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-moma-green"
                                                placeholder="+57 300..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2 mt-0">
                                <div className="flex justify-between items-center bg-stone-50 dark:bg-stone-800 px-3 py-2 rounded-xl">
                                    <span className="font-bold text-sm text-stone-700 dark:text-stone-300">Total a Pagar</span>
                                    <span className="font-bold text-xl text-moma-earth">${totalCop.toLocaleString('es-CO')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-4 py-3 bg-stone-50 dark:bg-stone-950 flex gap-2 border-t border-stone-100 dark:border-stone-800">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="flex-1 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmBooking}
                                disabled={loading}
                                className="flex-1 px-4 py-3 rounded-xl bg-moma-green text-white font-bold hover:bg-opacity-90 transition-colors flex items-center justify-center shadow-lg shadow-moma-green/20"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Aceptar y Pagar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200 dark:border-stone-800">
                        <div className="px-5 py-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-2xl font-black text-stone-900 dark:text-white">¡Gracias por tu compra!</h3>
                            <p className="text-stone-500 mt-2 text-sm max-w-[80%]">
                                Tu reserva ha sido confirmada exitosamente. Hemos enviado los detalles a tu correo.
                            </p>
                        </div>

                        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-800/50 space-y-3">
                            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Resumen de la Reserva</h4>
                            
                            <div className="flex justify-between items-start">
                                <span className="text-sm text-stone-500">Referencia</span>
                                <span className="text-sm font-mono font-bold text-stone-900 dark:text-white bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                                    {lastBookingId.slice(0, 8).toUpperCase()}
                                </span>
                            </div>

                            <div className="h-px bg-stone-200 dark:bg-stone-700 my-2" />

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-stone-500">Experiencia</span>
                                <span className="text-sm font-bold text-stone-900 dark:text-white text-right max-w-[60%] truncate">
                                    {experienceTitle}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-stone-500">Fecha</span>
                                <span className="text-sm font-bold text-stone-900 dark:text-white">
                                    {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : '-'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-stone-500">Pasajeros</span>
                                <span className="text-sm font-bold text-stone-900 dark:text-white">
                                    {guests} personas
                                </span>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <span className="text-sm font-bold text-stone-700 dark:text-stone-300">Total Pagado</span>
                                <span className="text-lg font-black text-moma-green">
                                    ${totalCop.toLocaleString('es-CO')}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 border-t border-stone-100 dark:border-stone-800">
                            <button
                                onClick={handleCloseSuccess}
                                className="w-full py-3.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                Entendido, gracias
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
