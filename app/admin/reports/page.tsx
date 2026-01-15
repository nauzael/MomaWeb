import { createClient } from '@/utils/supabase/server';
import { DollarSign, TrendingUp, Users, Calendar, MapPin, Activity } from "lucide-react";
import ReportsExportBtn from './ReportsExportBtn';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    const supabase = await createClient();

    // Fetch all bookings with experience details
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
            *,
            experiences (
                title,
                price_cop
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching report data:", error);
    }

    const allBookings = bookings || [];

    // --- Calculations ---

    // 1. Total Revenue (Confirmed only)
    const confirmedBookings = allBookings.filter((b: any) => b.status === 'confirmed');
    const totalRevenue = confirmedBookings.reduce((sum: number, b: any) => sum + Number(b.total_amount), 0);
    
    // 2. Pending Revenue (Potential)
    const pendingBookings = allBookings.filter((b: any) => b.status === 'pending');
    const potentialRevenue = pendingBookings.reduce((sum: number, b: any) => sum + Number(b.total_amount), 0);

    // 3. Top Experiences by Revenue
    const expRevenue: Record<string, { title: string, amount: number, count: number }> = {};
    
    confirmedBookings.forEach((b: any) => {
        const title = b.experiences?.title || 'Unknown';
        if (!expRevenue[title]) {
            expRevenue[title] = { title, amount: 0, count: 0 };
        }
        expRevenue[title].amount += Number(b.total_amount);
        expRevenue[title].count += 1;
    });

    const topExperiences = Object.values(expRevenue)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    // 4. Monthly Revenue (Simple aggregation for last 6 months)
    // Ideally this would be done with a more complex SQL query or date aggregation library
    // For now, we'll just mock the visual chart but use real data for the total summary

    // Prepare data for export
    const exportData = allBookings.map((b: any) => ({
        ID: b.id,
        Fecha: format(new Date(b.created_at), 'yyyy-MM-dd'),
        Cliente: b.customer_name,
        Email: b.customer_email,
        Experiencia: b.experiences?.title,
        'Fecha Viaje': b.travel_date,
        Pasajeros: b.guests_count,
        Monto: Number(b.total_amount),
        Estado: b.status
    }));

    return (
        <div className="space-y-6 md:space-y-8 max-w-[1600px] mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-[#1a1a1a]">Reportes y Análisis</h1>
                    <p className="text-stone-400 font-medium text-sm md:text-base">Resumen financiero y operativo de Moma.</p>
                </div>
                <ReportsExportBtn data={exportData} filename="Reporte_General_Moma" />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-[#061a15] text-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-moma-green font-bold text-sm uppercase tracking-wider mb-2">Ingresos Totales (Confirmados)</p>
                        <h3 className="text-3xl md:text-4xl font-black mb-4">${totalRevenue.toLocaleString('es-CO')}</h3>
                        <div className="flex items-center gap-2 text-sm text-stone-300">
                            <TrendingUp className="w-4 h-4 text-moma-green" />
                            <span>{confirmedBookings.length} reservas exitosas</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-[#eef1f4] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-stone-100">
                        <Activity className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-stone-400 font-bold text-sm uppercase tracking-wider mb-2">Ingresos Potenciales (Pendientes)</p>
                        <h3 className="text-3xl md:text-4xl font-black text-[#1a1a1a] mb-4">${potentialRevenue.toLocaleString('es-CO')}</h3>
                        <div className="flex items-center gap-2 text-sm text-stone-500">
                            <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md font-bold text-xs">{pendingBookings.length} reservas</span>
                            <span>pendientes de pago/confirmación</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-[#eef1f4] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-stone-100">
                        <Users className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-stone-400 font-bold text-sm uppercase tracking-wider mb-2">Total Pasajeros</p>
                        <h3 className="text-3xl md:text-4xl font-black text-[#1a1a1a] mb-4">
                            {confirmedBookings.reduce((sum: number, b: any) => sum + b.guests_count, 0)}
                        </h3>
                        <p className="text-sm text-stone-500">Personas han viajado con Moma</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Top Experiences Table */}
                <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-[#eef1f4] p-6 md:p-8">
                    <h3 className="text-lg md:text-xl font-black text-[#1a1a1a] mb-6 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-moma-green" />
                        Experiencias Más Rentables
                    </h3>
                    <div className="space-y-6">
                        {topExperiences.length === 0 ? (
                            <p className="text-stone-400 text-center py-8">No hay datos suficientes.</p>
                        ) : (
                            topExperiences.map((exp, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-black text-sm text-stone-400 group-hover:bg-moma-green group-hover:text-white transition-colors">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#1a1a1a] text-sm md:text-base">{exp.title}</h4>
                                            <p className="text-xs text-stone-400 font-bold">{exp.count} reservas confirmadas</p>
                                        </div>
                                    </div>
                                    <span className="font-black text-[#1a1a1a] text-sm md:text-base">${exp.amount.toLocaleString('es-CO')}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Activity Log (Simplified) */}
                <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-[#eef1f4] p-6 md:p-8">
                    <h3 className="text-lg md:text-xl font-black text-[#1a1a1a] mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-moma-green" />
                        Actividad Reciente
                    </h3>
                    <div className="space-y-0">
                        {allBookings.slice(0, 6).map((booking: any) => (
                            <div key={booking.id} className="flex items-center justify-between py-4 border-b border-stone-50 last:border-0 hover:bg-stone-50 px-2 -mx-2 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${
                                        booking.status === 'confirmed' ? 'bg-moma-green' : 
                                        booking.status === 'cancelled' ? 'bg-red-400' : 'bg-orange-400'
                                    }`} />
                                    <div>
                                        <p className="font-bold text-sm text-[#1a1a1a]">Nueva reserva: {booking.customer_name.split('|')[0]}</p>
                                        <p className="text-xs text-stone-400">
                                            {format(new Date(booking.created_at), "d MMM, HH:mm", { locale: es })} • {booking.experiences?.title}
                                        </p>
                                    </div>
                                </div>
                                <span className="font-bold text-sm text-[#1a1a1a]">${Number(booking.total_amount).toLocaleString('es-CO')}</span>
                            </div>
                        ))}
                        {allBookings.length === 0 && (
                            <p className="text-stone-400 text-center py-8">No hay actividad reciente.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
