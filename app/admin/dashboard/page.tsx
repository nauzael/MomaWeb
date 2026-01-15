import { createClient } from '@/utils/supabase/server';
import { CheckCircle2, TrendingUp, AlertCircle, Clock } from "lucide-react";
import DashboardCalendarWidget from './DashboardCalendarWidget';
import DashboardNextDeparture from './DashboardNextDeparture';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch all bookings
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
            *,
            experiences (
                title,
                image
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching dashboard data:", error);
    }

    const allBookings = bookings || [];
    
    // Calculate Stats
    const totalBookings = allBookings.length;
    const totalRevenue = allBookings
        .filter((b: any) => b.status !== 'cancelled')
        .reduce((sum: number, b: any) => sum + Number(b.total_amount), 0);
    
    // Active tours could be distinct experiences booked
    const activeTours = new Set(allBookings.map((b: any) => b.experience_id)).size;
    
    // New customers could be distinct emails
    const uniqueCustomers = new Set(allBookings.map((b: any) => b.customer_email)).size;

    // Recent bookings (top 5)
    const recentBookings = allBookings.slice(0, 5);

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "Total Reservas", value: totalBookings.toString(), change: "Global", color: "#00f5c4" },
                    { title: "Ingresos Totales", value: `$${totalRevenue.toLocaleString('es-CO')}`, change: "COP", color: "#00f5c4" },
                    { title: "Experiencias Activas", value: activeTours.toString(), change: "Reservadas", color: "#00f5c4" },
                    { title: "Clientes Únicos", value: uniqueCustomers.toString(), change: "Total", color: "#00f5c4" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#eef1f4] relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-bold text-stone-400 uppercase tracking-tight">{stat.title}</span>
                            <span className="bg-[#ccfcf3] text-[#00b894] text-[10px] font-extrabold px-2 py-1 rounded-lg">
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-2xl lg:text-3xl font-black text-[#1a1a1a] mb-4 truncate" title={stat.value}>{stat.value}</h3>
                        {/* Mock Sparkline */}
                        <div className="h-10 flex items-end gap-1">
                            {[40, 60, 45, 70, 50, 80, 65, 90].map((h, j) => (
                                <div
                                    key={j}
                                    className="flex-1 bg-moma-green/20 rounded-full group-hover:bg-moma-green/40 transition-colors"
                                    style={{ height: `${h}%` }}
                                ></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Next Departure & Pending Actions */}
                <DashboardNextDeparture bookings={allBookings} />

                {/* Booking Trends Chart - REPLACED WITH CALENDAR */}
                <DashboardCalendarWidget bookings={allBookings} />
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#eef1f4] overflow-hidden">
                <div className="p-4 md:p-8 flex justify-between items-center border-b border-[#f5f7f9]">
                    <h3 className="text-xl font-black text-[#1a1a1a]">Reservas Recientes</h3>
                    <a href="/admin/bookings" className="bg-[#061a15] text-white px-6 py-3 rounded-2xl text-sm font-black hover:opacity-90 transition-all">
                        Ver Todas
                    </a>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f5fbf9] text-[10px] uppercase tracking-widest font-black text-stone-400">
                                <th className="px-4 md:px-8 py-4">Fecha Viaje</th>
                                <th className="px-4 md:px-8 py-4">Cliente</th>
                                <th className="px-4 md:px-8 py-4">Experiencia</th>
                                <th className="px-4 md:px-8 py-4">Estado</th>
                                <th className="px-4 md:px-8 py-4">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f5f7f9]">
                            {recentBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 md:px-8 py-8 text-center text-stone-400 font-medium">No hay reservas recientes.</td>
                                </tr>
                            ) : (
                                recentBookings.map((booking: any) => (
                                    <tr key={booking.id} className="group hover:bg-[#fcfdfd] transition-colors">
                                        <td className="px-4 md:px-8 py-5 text-sm font-bold text-stone-500">
                                            {format(new Date(booking.travel_date), 'MMM d, yyyy', { locale: es })}
                                        </td>
                                        <td className="px-4 md:px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-moma-green/20 flex items-center justify-center text-[10px] font-black text-moma-green uppercase">
                                                    {booking.customer_name.substring(0, 2)}
                                                </div>
                                                <span className="text-sm font-black text-[#1a1a1a] truncate max-w-[150px]">
                                                    {booking.customer_name.split('|')[0]}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-8 py-5 text-sm font-bold text-stone-600 truncate max-w-[200px]">
                                            {booking.experiences?.title || 'Experiencia Eliminada'}
                                        </td>
                                        <td className="px-4 md:px-8 py-5">
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center w-fit gap-1.5 ${
                                                booking.status === 'confirmed' ? 'bg-[#ccfcf3] text-[#00b894]' :
                                                booking.status === 'pending' ? 'bg-orange-50 text-orange-500' : 
                                                'bg-red-50 text-red-500'
                                            }`}>
                                                {booking.status === 'confirmed' ? <CheckCircle2 className="w-3 h-3" /> : 
                                                 booking.status === 'cancelled' ? <AlertCircle className="w-3 h-3" /> :
                                                 <Clock className="w-3 h-3" />}
                                                {booking.status === 'pending' ? 'PENDIENTE' : 
                                                 booking.status === 'confirmed' ? 'CONFIRMADO' : 'CANCELADO'}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-8 py-5 text-sm font-black text-[#1a1a1a]">
                                            ${Number(booking.total_amount).toLocaleString('es-CO')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

