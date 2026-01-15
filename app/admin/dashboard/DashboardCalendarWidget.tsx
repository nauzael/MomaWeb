'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, MapPin, User, Clock } from 'lucide-react';
import 'react-day-picker/dist/style.css';

interface DashboardCalendarWidgetProps {
    bookings: any[];
}

export default function DashboardCalendarWidget({ bookings }: DashboardCalendarWidgetProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    // Extract dates with bookings
    const bookedDates = bookings
        .filter(b => b.status !== 'cancelled')
        .map(b => parseISO(b.travel_date));
    
    // Filter bookings for selected date
    const selectedBookings = selectedDate 
        ? bookings.filter(b => isSameDay(parseISO(b.travel_date), selectedDate) && b.status !== 'cancelled')
        : [];

    return (
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-[#eef1f4] overflow-hidden flex flex-col md:flex-row h-auto md:h-[450px]">
            {/* Calendar Side */}
            <div className="p-6 md:p-8 flex-1 border-r-0 md:border-r border-b md:border-b-0 border-[#f5f7f9] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black text-[#1a1a1a] flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-moma-green" />
                        Calendario de Salidas
                    </h3>
                </div>
                
                <div className="flex-1 flex justify-center items-center">
                    <style>{`
                        .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #29afb7; --rdp-background-color: #e0f2f1; margin: 0; }
                        .rdp-day_selected:not([disabled]) { background-color: var(--rdp-accent-color); color: white; font-weight: bold; }
                        .rdp-day_selected:hover:not([disabled]) { background-color: var(--rdp-accent-color); opacity: 0.8; }
                        .rdp-day_booked { position: relative; font-weight: bold; color: #29afb7; }
                        .rdp-day_booked::after {
                            content: '';
                            position: absolute;
                            bottom: 6px;
                            left: 50%;
                            transform: translateX(-50%);
                            width: 4px;
                            height: 4px;
                            border-radius: 50%;
                            background-color: currentColor;
                        }
                        .rdp-caption_label { font-size: 1rem; font-weight: 800; color: #1c1917; text-transform: capitalize; }
                        .rdp-head_cell { font-weight: 700; color: #a8a29e; font-size: 0.75rem; text-transform: uppercase; }
                    `}</style>
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        locale={es}
                        modifiers={{ booked: bookedDates }}
                        modifiersClassNames={{ booked: 'rdp-day_booked' }}
                    />
                </div>
            </div>

            {/* Details Side */}
            <div className="p-6 md:p-8 flex-1 bg-[#fcfdfd] flex flex-col overflow-hidden min-h-[300px] md:min-h-0">
                <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wide mb-4">
                    {selectedDate ? format(selectedDate, 'EEEE d, MMMM', { locale: es }) : 'Selecciona una fecha'}
                </h4>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {selectedBookings.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-stone-300 text-center">
                            <Clock className="w-10 h-10 opacity-20 mb-2" />
                            <p className="font-bold text-sm">Sin salidas programadas</p>
                        </div>
                    ) : (
                        selectedBookings.map((booking) => (
                            <div key={booking.id} className="bg-white p-4 rounded-2xl border border-[#eef1f4] shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-black text-stone-600">
                                            {booking.customer_name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-sm text-[#1a1a1a] truncate w-32">{booking.customer_name.split('|')[0]}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                                        booking.status === 'confirmed' ? 'bg-[#ccfcf3] text-[#00b894]' : 'bg-orange-50 text-orange-500'
                                    }`}>
                                        {booking.status === 'confirmed' ? 'CONFIRMADO' : 'PENDIENTE'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-stone-500 font-medium pl-1">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate flex-1">{booking.experiences?.title}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-stone-500 font-medium pl-1 mt-1">
                                    <User className="w-3 h-3" />
                                    <span>{booking.guests_count} Pasajeros</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
