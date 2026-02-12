'use client';

import { useEffect, useState, useMemo } from 'react';
import { CheckCircle2, TrendingUp, AlertCircle, Clock } from "lucide-react";
import DashboardCalendarWidget from './DashboardCalendarWidget';
import DashboardNextDeparture from './DashboardNextDeparture';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api-client';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (user) {
            fetchApi<any[]>('admin/bookings/list.php')
                .then(data => {
                    setBookings(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to load dashboard data', err);
                    setLoading(false);
                });
        }
    }, [user]);

    // Calculate Stats
    const stats = useMemo(() => {
        const totalBookings = bookings.length;
        const totalRevenue = bookings
            .filter((b: any) => b.status !== 'cancelled')
            .reduce((sum: number, b: any) => sum + Number(b.total_amount), 0);

        // Active tours could be distinct experiences booked
        const activeTours = new Set(bookings.map((b: any) => b.experience_id)).size;

        // New customers could be distinct emails
        const uniqueCustomers = new Set(bookings.map((b: any) => b.customer_email)).size;

        return { totalBookings, totalRevenue, activeTours, uniqueCustomers };
    }, [bookings]);

    // Recent bookings (top 5)
    // Assuming list.php returns order by created_at desc
    const recentBookings = bookings.slice(0, 5);

    if (authLoading || loading) {
        return <div className="p-8 text-center text-stone-500">Cargando tablero...</div>;
    }

    if (!user) return null;

    return (
        <div className="space-y-6 md:space-y-8 max-w-[1600px] mx-auto pb-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                    { title: "Total Reservas", value: stats.totalBookings.toString(), change: "Global", color: "#00f5c4" },
                    { title: "Ingresos Totales", value: `$${stats.totalRevenue.toLocaleString('es-CO')}`, change: "COP", color: "#00f5c4" },
                    { title: "Experiencias Activas", value: stats.activeTours.toString(), change: "Reservadas", color: "#00f5c4" },
                    { title: "Clientes Únicos", value: stats.uniqueCustomers.toString(), change: "Total", color: "#00f5c4" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 md:p-6 rounded-4xl shadow-sm border border-[#eef1f4] relative overflow-hidden group">
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
                                    className="flex-1 bg-moma-green/20 rounded-full group-hover:bg-moma-green transition-colors"
                                    style={{ height: `${h}%` }}
                                ></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Next Departure & Pending Actions */}
                <DashboardNextDeparture bookings={bookings} />

                {/* Booking Trends Chart - REPLACED WITH CALENDAR */}
                <DashboardCalendarWidget bookings={bookings} />
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
                                                    {(booking.customer_name || 'UC').substring(0, 2)}
                                                </div>
                                                <span className="text-sm font-black text-[#1a1a1a] truncate max-w-[150px]">
                                                    {booking.customer_name ? booking.customer_name.split('|')[0] : 'Cliente'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-8 py-5 text-sm font-bold text-stone-600 truncate max-w-[200px]">
                                            {booking.experience_title || 'Experiencia Eliminada'}
                                        </td>
                                        <td className="px-4 md:px-8 py-5">
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center w-fit gap-1.5 ${booking.status === 'confirmed' ? 'bg-[#ccfcf3] text-[#00b894]' :
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
