'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Users, Minus, Plus, Loader2, X } from 'lucide-react';
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
}

// Mock occupied dates
const TODAY = new Date();
const BOOKED_DATES = [
    new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 2),
    new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 5),
    new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 7),
];

export default function BookingWidget({ priceCop, priceUsd, maxCapacity, experienceTitle }: BookingWidgetProps) {
    const [guests, setGuests] = useState(1);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const calendarRef = useRef<HTMLDivElement>(null);

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
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setShowConfirmation(false);
            setContactName('');
            setContactEmail('');
            setContactPhone('');
            alert(`¡Reserva confirmada exitosamente!\n\nReferencia: MOMA-${Math.floor(Math.random() * 10000)}`);
        }, 1500);
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
                                    disabled={[
                                        { before: new Date() },
                                        ...BOOKED_DATES
                                    ]}
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
                            <h3 className="text-2xl font-bold text-stone-900 dark:text-white">Confirma tu Reserva</h3>
                            <p className="text-sm text-stone-500 mt-1">Revisa los detalles antes de continuar.</p>
                        </div>

                        <div className="px-4 py-3 space-y-3 bg-white dark:bg-stone-900">
                            <div className="flex justify-between items-center py-2 border-b border-stone-50 dark:border-stone-800">
                                <span className="text-stone-500 text-sm">Experiencia</span>
                                <span className="font-bold text-stone-900 dark:text-white text-right max-w-[60%] truncate">{experienceTitle}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-stone-50 dark:border-stone-800">
                                <span className="text-stone-500 text-sm">Fecha</span>
                                <span className="font-bold text-stone-900 dark:text-white">
                                    {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : '-'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-stone-50 dark:border-stone-800">
                                <span className="text-stone-500 text-sm">Pasajeros</span>
                                <span className="font-bold text-stone-900 dark:text-white">{guests} personas</span>
                            </div>
                            <div className="pt-3 space-y-2.5">
                                <h4 className="text-sm font-bold text-stone-800 dark:text-stone-100">Datos de contacto</h4>
                                <div className="space-y-2">
                                    <div className="space-y-1">
                                        <label htmlFor="contact-name" className="text-xs font-bold uppercase text-stone-400">Nombre completo</label>
                                        <input
                                            id="contact-name"
                                            type="text"
                                            value={contactName}
                                            onChange={(e) => setContactName(e.target.value)}
                                            className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-moma-green"
                                            placeholder="Tu nombre"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="contact-email" className="text-xs font-bold uppercase text-stone-400">Correo electrónico</label>
                                        <input
                                            id="contact-email"
                                            type="email"
                                            value={contactEmail}
                                            onChange={(e) => setContactEmail(e.target.value)}
                                            className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-moma-green"
                                            placeholder="tucorreo@ejemplo.com"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="contact-phone" className="text-xs font-bold uppercase text-stone-400">Teléfono</label>
                                        <input
                                            id="contact-phone"
                                            type="tel"
                                            value={contactPhone}
                                            onChange={(e) => setContactPhone(e.target.value)}
                                            className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-moma-green"
                                            placeholder="+57 300 000 0000"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-3 mt-0">
                                <div className="flex justify-between items-center bg-stone-50 dark:bg-stone-800 px-3 py-3 rounded-xl">
                                    <span className="font-bold text-lg text-stone-700 dark:text-stone-300">Total a Pagar</span>
                                    <span className="font-bold text-2xl text-moma-earth">${totalCop.toLocaleString('es-CO')}</span>
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
        </>
    );
}
