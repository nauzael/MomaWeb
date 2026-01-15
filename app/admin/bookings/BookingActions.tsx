'use client';

import { useState } from 'react';
import { Download, Calendar } from "lucide-react";
import * as XLSX from 'xlsx';
import AdminBookingCalendar from './AdminBookingCalendar';

interface BookingActionsProps {
    bookings: any[];
}

export default function BookingActions({ bookings }: BookingActionsProps) {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const handleExport = () => {
        if (!bookings || bookings.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        // Prepare data for export
        const data = bookings.map(b => ({
            ID: b.id,
            Cliente: b.customer_name,
            Email: b.customer_email,
            'Fecha Viaje': b.travel_date,
            Pasajeros: b.guests_count,
            Experiencia: b.experiences?.title || 'N/A',
            Monto: b.total_amount,
            Moneda: b.currency,
            Estado: b.status,
            'Fecha Creación': new Date(b.created_at).toLocaleString()
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reservas");
        XLSX.writeFile(wb, `Reservas_Moma_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <>
            <div className="flex items-center gap-3">
                <button 
                    onClick={handleExport}
                    className="bg-white border border-[#eef1f4] text-[#1a1a1a] px-6 py-4 rounded-2xl font-black text-sm hover:bg-stone-50 transition-all shadow-sm flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Exportar Reporte
                </button>
                <button 
                    onClick={() => setIsCalendarOpen(true)}
                    className="bg-[#061a15] text-white px-6 py-4 rounded-2xl font-black text-sm hover:opacity-90 transition-all shadow-lg flex items-center gap-2"
                >
                    <Calendar className="w-4 h-4" />
                    Ver Calendario
                </button>
            </div>

            <AdminBookingCalendar 
                bookings={bookings} 
                isOpen={isCalendarOpen} 
                onClose={() => setIsCalendarOpen(false)} 
            />
        </>
    );
}
