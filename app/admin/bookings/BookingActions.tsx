'use client';

import { useState } from 'react';
import { Download, Calendar, Loader2 } from "lucide-react";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import AdminBookingCalendar from './AdminBookingCalendar';

interface BookingActionsProps {
    bookings: any[];
}

export default function BookingActions({ bookings }: BookingActionsProps) {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        if (!bookings || bookings.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        setExporting(true);

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Reservas');

            worksheet.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'Cliente', key: 'client', width: 30 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Fecha Viaje', key: 'travel_date', width: 15 },
                { header: 'Pasajeros', key: 'guests', width: 10 },
                { header: 'Experiencia', key: 'experience', width: 30 },
                { header: 'Monto', key: 'amount', width: 15 },
                { header: 'Moneda', key: 'currency', width: 10 },
                { header: 'Estado', key: 'status', width: 15 },
                { header: 'Fecha Creación', key: 'created_at', width: 20 }
            ];

            // Header style
            worksheet.getRow(1).font = { bold: true };

            bookings.forEach(b => {
                worksheet.addRow({
                    id: b.id,
                    client: b.customer_name,
                    email: b.customer_email,
                    travel_date: b.travel_date,
                    guests: b.guests_count,
                    experience: b.experiences?.title || 'N/A',
                    amount: b.total_amount,
                    currency: b.currency,
                    status: b.status,
                    created_at: new Date(b.created_at).toLocaleString()
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `Reservas_Moma_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (error) {
            console.error('Error exporting excel:', error);
            alert('Hubo un error al exportar el reporte.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-3">
                <button 
                    onClick={handleExport}
                    disabled={exporting}
                    className="bg-white border border-[#eef1f4] text-[#1a1a1a] px-6 py-4 rounded-2xl font-black text-sm hover:bg-stone-50 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                    {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {exporting ? 'Exportando...' : 'Exportar Reporte'}
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
