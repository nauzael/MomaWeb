'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Users, Minus, Plus, Loader2, X, CheckCircle } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useLanguage } from '@/context/LanguageContext';
import 'react-day-picker/dist/style.css';
import { cn } from '@/lib/utils';

import { type Experience } from '@/lib/experience-service';
import { fetchApi } from '@/lib/api-client';

interface BookingWidgetProps {
    experience: Experience;
}

import ButtonFlex from '@/components/ui/ButtonFlex';

export default function BookingWidget({ experience }: BookingWidgetProps) {
    const { t, language } = useLanguage();
    const dateLocale = language === 'es' ? es : enUS;
    // Extract props from experience object for backward compatibility with internal logic
    const priceCop = experience.price_cop;
    const priceUsd = experience.price_usd;
    const maxCapacity = experience.max_capacity;
    const experienceTitle = experience.title;
    const experienceId = experience.id;

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
                const data = await fetchApi<{ availability: Record<string, number> }>(`bookings/availability.php?experienceId=${experienceId}`);
                setAvailability(data.availability || {});
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
            alert(t.booking.dateError);
            return;
        }
        setShowConfirmation(true);
    };

    const confirmBooking = async () => {
        if (!contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
            alert(t.booking.formError);
            return;
        }

        setLoading(true);

        try {
            const data: any = await fetchApi('bookings/create.php', {
                method: 'POST',
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

            setLastBookingId(data.bookingId || data.booking?.id);
            setShowConfirmation(false);
            setShowSuccess(true);

        } catch (error: any) {
            console.error('Booking error:', error);
            alert(`${language === 'es' ? 'Hubo un error al procesar tu reserva' : 'Ther was an error processing your booking'}: ${error.message}`);
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
            <div id="booking-widget-container" className="sticky top-24 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6 transition-all font-sans z-10">
                <div className="mb-6">
                    <span className="text-stone-500 text-sm font-medium">{t.booking.pricePerPerson}</span>
                    <div className="flex items-baseline font-heading">
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-moma-green to-teal-500">
                            ${numPriceCop.toLocaleString(language === 'es' ? 'es-CO' : 'en-US')}
                        </span>
                        <span className="text-sm text-stone-400 ml-2 font-bold font-sans">COP</span>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">{t.booking.approx} ${Math.round(numPriceUsd)} USD</p>
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
                            aria-label={selectedDate ? `${language === 'es' ? 'Fecha seleccionada' : 'Selected date'}: ${format(selectedDate, 'PPP', { locale: dateLocale })}` : t.booking.travelDateLabel}
                        >
                            <div className="flex-1">
                                <span className="block text-xs font-bold uppercase text-stone-400 mb-2 group-hover:text-moma-green transition-colors">{t.booking.travelDateLabel}</span>
                                <div className="flex items-center text-stone-700 dark:text-stone-200">
                                    <CalendarIcon className="w-5 h-5 mr-3 text-stone-400 group-hover:text-moma-green" aria-hidden="true" />
                                    <span className={cn("text-sm font-medium", !selectedDate && "text-stone-400 font-normal")}>
                                        {selectedDate ? format(selectedDate, 'PPP', { locale: dateLocale }) : t.booking.selectDate}
                                    </span>
                                </div>
                            </div>
                        </button>

                        {/* Calendar Popup */}
                        {isCalendarOpen && (
                            <div
                                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200"
                                role="dialog"
                                aria-label={t.booking.availabilityCalendar}
                            >
                                <div className="flex justify-between items-center mb-2 px-2">
                                    <span className="text-xs font-bold uppercase text-stone-500">{t.booking.availability}</span>
                                    <button onClick={() => setIsCalendarOpen(false)} className="text-stone-400 hover:text-stone-600" aria-label={language === 'es' ? "Cerrar calendario" : "Close calendar"}>
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
                                    locale={dateLocale}
                                    disabled={isDateDisabled}
                                    modifiersStyles={{
                                        disabled: { textDecoration: 'line-through', color: '#a8a29e', background: 'transparent' }
                                    }}
                                    footer={
                                        <div className="mt-4 text-xs text-center border-t pt-2 border-stone-100 dark:border-stone-800 text-stone-400 flex justify-center gap-4">
                                            <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-moma-green mr-1"></div> {t.booking.free}</div>
                                            <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-stone-300 mr-1"></div> {t.booking.busy}</div>
                                        </div>
                                    }
                                />
                            </div>
                        )}
                    </div>

                    {/* Guest Selection */}
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 dark:bg-stone-800 dark:border-stone-700">
                        <label className="block text-xs font-bold uppercase text-stone-400 mb-2">{t.booking.travelers}</label>
                        <div className="flex items-center justify-between text-stone-700 dark:text-stone-200">
                            <div className="flex items-center">
                                <Users className="w-5 h-5 mr-3 text-stone-400" />
                                <span className="text-sm font-medium">{guests} {guests === 1 ? t.booking.guest : t.booking.guests}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleGuestChange(-1)}
                                    disabled={guests <= 1}
                                    className="w-8 h-8 rounded-full bg-white dark:bg-stone-700 flex items-center justify-center text-stone-500 hover:bg-stone-200 disabled:opacity-50 transition-colors shadow-sm"
                                    aria-label={t.booking.decreaseGuests}
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleGuestChange(1)}
                                    disabled={guests >= maxCapacity}
                                    className="w-8 h-8 rounded-full bg-white dark:bg-stone-700 flex items-center justify-center text-stone-500 hover:bg-stone-200 disabled:opacity-50 transition-colors shadow-sm"
                                    aria-label={t.booking.increaseGuests}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary (Conditional) */}
                    <div className="pt-2 pb-2">
                        <div className="flex justify-between items-center text-sm font-medium text-stone-600 dark:text-stone-300 font-sans">
                            <span>{t.booking.totalEstimated}</span>
                            <span className="text-lg font-bold text-stone-900 dark:text-white font-heading">${totalCop.toLocaleString(language === 'es' ? 'es-CO' : 'en-US')}</span>
                        </div>
                    </div>

                    <div className="flex justify-center w-full">
                        <ButtonFlex
                            onClick={handleBookingClick}
                            text={t.booking.reserveButton}
                            className="w-full"
                            disabled={guests < 1}
                        />
                    </div>

                    <p className="text-xs text-center text-stone-400 mt-4">
                        {t.booking.noChargeNote}
                    </p>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200 dark:border-stone-800">
                        <div className="px-5 py-3 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900 text-center font-sans">
                            <h3 className="text-xl font-heading font-bold text-stone-900 dark:text-white">{t.booking.confirmTitle}</h3>
                            <p className="text-xs text-stone-500 mt-0.5">{t.booking.confirmSubtitle}</p>
                        </div>

                        <div className="px-4 py-3 space-y-2 bg-white dark:bg-stone-900">
                            <div className="flex justify-between items-center py-1 border-b border-stone-50 dark:border-stone-800">
                                <span className="text-stone-500 text-xs font-medium">{t.booking.experience}</span>
                                <span className="font-bold text-stone-900 dark:text-white text-right max-w-[60%] truncate text-sm">{experienceTitle}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-stone-50 dark:border-stone-800">
                                <span className="text-stone-500 text-xs font-medium">{t.booking.date}</span>
                                <span className="font-bold text-stone-900 dark:text-white text-sm">
                                    {selectedDate ? format(selectedDate, 'PPP', { locale: dateLocale }) : '-'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-stone-50 dark:border-stone-800">
                                <span className="text-stone-500 text-xs font-medium">{t.booking.travelers}</span>
                                <span className="font-bold text-stone-900 dark:text-white text-sm">{guests} {guests === 1 ? t.booking.guest : t.booking.guests}</span>
                            </div>
                            <div className="pt-2 space-y-2 font-sans">
                                <h4 className="text-xs font-heading font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wide">{t.booking.contactData}</h4>
                                <div className="space-y-2">
                                    <div className="space-y-0.5">
                                        <label htmlFor="contact-name" className="text-[10px] font-bold uppercase text-stone-400">{t.booking.fullNameTitle}</label>
                                        <input
                                            id="contact-name"
                                            type="text"
                                            value={contactName}
                                            onChange={(e) => setContactName(e.target.value)}
                                            className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-moma-green"
                                            placeholder={t.booking.fullNamePlaceholder}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-0.5">
                                            <label htmlFor="contact-email" className="text-[10px] font-bold uppercase text-stone-400">{t.booking.emailTitle}</label>
                                            <input
                                                id="contact-email"
                                                type="email"
                                                value={contactEmail}
                                                onChange={(e) => setContactEmail(e.target.value)}
                                                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-moma-green"
                                                placeholder={t.booking.emailPlaceholder}
                                            />
                                        </div>
                                        <div className="space-y-0.5">
                                            <label htmlFor="contact-phone" className="text-[10px] font-bold uppercase text-stone-400">{t.booking.phoneTitle}</label>
                                            <input
                                                id="contact-phone"
                                                type="tel"
                                                value={contactPhone}
                                                onChange={(e) => setContactPhone(e.target.value)}
                                                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-moma-green"
                                                placeholder={t.booking.phonePlaceholder}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2 mt-0 font-sans">
                                <div className="flex justify-between items-center bg-stone-50 dark:bg-stone-800 px-3 py-2 rounded-xl">
                                    <span className="font-bold text-sm text-stone-700 dark:text-stone-300">{t.booking.totalToPay}</span>
                                    <span className="font-bold text-xl text-moma-earth font-heading">${totalCop.toLocaleString(language === 'es' ? 'es-CO' : 'en-US')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-4 py-3 bg-stone-50 dark:bg-stone-950 flex gap-2 border-t border-stone-100 dark:border-stone-800">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="flex-1 px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            >
                                {t.booking.cancel}
                            </button>
                            <button
                                onClick={confirmBooking}
                                disabled={loading}
                                className="flex-1 px-4 py-3 rounded-xl bg-moma-green text-white font-bold hover:bg-opacity-90 transition-colors flex items-center justify-center shadow-lg shadow-moma-green/20"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.booking.acceptAndPay}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-stone-200 dark:border-stone-800">
                        <div className="px-5 py-6 flex flex-col items-center text-center font-sans">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-2xl font-heading font-black text-stone-900 dark:text-white">{t.booking.successTitle}</h3>
                            <p className="text-stone-500 mt-2 text-sm max-w-[80%]">
                                {t.booking.successSubtitle}
                            </p>
                        </div>

                        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-800/50 space-y-3">
                            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">{t.booking.summaryTitle}</h4>

                            <div className="flex justify-between items-start">
                                <span className="text-sm text-stone-500">{t.booking.reference}</span>
                                <span className="text-sm font-mono font-bold text-stone-900 dark:text-white bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                                    {lastBookingId.slice(0, 8).toUpperCase()}
                                </span>
                            </div>

                            <div className="h-px bg-stone-200 dark:bg-stone-700 my-2" />

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-stone-500">{t.booking.experience}</span>
                                <span className="text-sm font-bold text-stone-900 dark:text-white text-right max-w-[60%] truncate">
                                    {experienceTitle}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-stone-500">{t.booking.date}</span>
                                <span className="text-sm font-bold text-stone-900 dark:text-white">
                                    {selectedDate ? format(selectedDate, 'PPP', { locale: dateLocale }) : '-'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-stone-500">{t.booking.travelers}</span>
                                <span className="text-sm font-bold text-stone-900 dark:text-white">
                                    {guests} {guests === 1 ? t.booking.guest : t.booking.guests}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <span className="text-sm font-bold text-stone-700 dark:text-stone-300">{t.booking.totalPaid}</span>
                                <span className="text-lg font-black text-moma-green">
                                    ${totalCop.toLocaleString(language === 'es' ? 'es-CO' : 'en-US')}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 border-t border-stone-100 dark:border-stone-800">
                            <button
                                onClick={handleCloseSuccess}
                                className="w-full py-3.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {t.booking.closeButton}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
