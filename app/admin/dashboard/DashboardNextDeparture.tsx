'use client';

import { format, isToday, isTomorrow, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapPin, Users, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface DashboardNextDepartureProps {
    bookings: any[];
}

export default function DashboardNextDeparture({ bookings }: DashboardNextDepartureProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find next confirmed booking
    const nextBooking = bookings
        .filter(b => b.status === 'confirmed' && parseISO(b.travel_date) >= today)
        .sort((a, b) => parseISO(a.travel_date).getTime() - parseISO(b.travel_date).getTime())[0];

    // Count pending bookings
    const pendingCount = bookings.filter(b => b.status === 'pending').length;

    // Helper to format relative time
    const getRelativeTime = (dateStr: string) => {
        const date = parseISO(dateStr);
        if (isToday(date)) return 'Hoy';
        if (isTomorrow(date)) return 'Mañana';
        const diff = differenceInDays(date, today);
        return `En ${diff} días`;
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Next Departure Card */}
            <div className="bg-[#061a15] rounded-[2.5rem] shadow-xl overflow-hidden relative flex-1 flex flex-col group">
                {nextBooking ? (
                    <>
                        {/* Background Image with Gradient */}
                        <div className="absolute inset-0 z-0">
                            {nextBooking.experiences?.image && (
                                <img 
                                    src={nextBooking.experiences.image} 
                                    alt={nextBooking.experiences.title}
                                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#061a15] via-[#061a15]/80 to-transparent" />
                        </div>

                        <div className="relative z-10 p-6 md:p-8 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-moma-green/20 text-moma-green text-[10px] font-black uppercase tracking-wider backdrop-blur-sm border border-moma-green/20">
                                        <Clock className="w-3 h-3" />
                                        Próxima Salida
                                    </span>
                                    <h3 className="text-2xl md:text-3xl font-black text-white mt-4 leading-tight">
                                        {getRelativeTime(nextBooking.travel_date)}
                                    </h3>
                                    <p className="text-stone-300 font-bold text-sm">
                                        {format(parseISO(nextBooking.travel_date), "EEEE d 'de' MMMM", { locale: es })}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                                    <MapPin className="w-6 h-6 text-moma-green" />
                                </div>
                            </div>

                            <div className="space-y-4 mt-6 md:mt-0">
                                <div>
                                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-1">Experiencia</p>
                                    <h4 className="text-lg md:text-xl font-bold text-white leading-snug">
                                        {nextBooking.experiences?.title || 'Experiencia'}
                                    </h4>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                            <Users className="w-4 h-4 text-moma-green" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-stone-400 uppercase">Pasajeros</p>
                                            <p className="text-sm font-bold text-white">{nextBooking.guests_count} Personas</p>
                                        </div>
                                    </div>
                                    <div className="hidden md:block h-8 w-px bg-white/10" />
                                    <div>
                                        <p className="text-[10px] font-bold text-stone-400 uppercase">Cliente</p>
                                        <p className="text-sm font-bold text-white truncate max-w-[120px]">
                                            {nextBooking.customer_name.split('|')[0]}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="relative z-10 p-8 flex flex-col h-full justify-center items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Clock className="w-8 h-8 text-stone-500" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Sin salidas próximas</h3>
                        <p className="text-stone-400 text-sm">No tienes reservas confirmadas para los próximos días.</p>
                    </div>
                )}
            </div>

            {/* Pending Actions Mini-Card */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#eef1f4] flex items-center justify-between group cursor-pointer hover:border-moma-green/30 transition-all">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        pendingCount > 0 ? 'bg-orange-50 text-orange-500' : 'bg-stone-50 text-stone-400'
                    }`}>
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-[#1a1a1a] text-lg leading-none mb-1">
                            {pendingCount} Pendientes
                        </h4>
                        <p className="text-xs text-stone-400 font-bold uppercase tracking-wide">
                            {pendingCount === 1 ? 'Requiere aprobación' : 'Requieren aprobación'}
                        </p>
                    </div>
                </div>
                <Link href="/admin/bookings" className="w-10 h-10 rounded-full border border-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-moma-green group-hover:border-moma-green group-hover:text-white transition-all">
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
}
