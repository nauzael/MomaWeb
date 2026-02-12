'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-client';
import { fetchApi } from '@/lib/api-client';
import { CheckCircle, Clock, Search, MoreVertical, AlertCircle, Calendar } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import BookingActions from './BookingActions';
import BookingRowActions from './BookingRowActions';

export default function BookingsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [authLoading, user, router]);

    const loadBookings = () => {
        setLoading(true);
        fetchApi<any[]>('admin/bookings/list.php')
            .then(data => {
                setBookings(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load bookings', err);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (user) {
            loadBookings();
        }
    }, [user]);

    // Optional: expose loadBookings via context or prop if needed, 
    // but here we just rely on parent re-render or explicit refresh.

    const filteredBookings = bookings.filter(b =>
        (b.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.experience_title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (authLoading || loading) {
        return <div className="p-12 text-center text-stone-500">Cargando reservas...</div>;
    }

    if (!user) return null;

    const hasBookings = filteredBookings.length > 0;

    return (
        <div className="space-y-6 md:space-y-8 max-w-[1600px] mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-[#1a1a1a]">Reservas y Calendario</h1>
                    <p className="text-stone-400 font-medium text-sm md:text-base">Gestiona las reservas y salidas de tus clientes.</p>
                </div>
                <BookingActions bookings={bookings} />
            </div>

            <div className="bg-white rounded-4xl md:rounded-[2.5rem] shadow-sm border border-[#eef1f4]">
                <div className="p-5 md:p-8 border-b border-[#f5f7f9] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="text-lg md:text-xl font-black text-[#1a1a1a]">Registro de Reservas</h3>
                    <div className="relative w-full md:w-auto">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Buscar reserva..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#f5fbf9] border-none rounded-xl pl-10 pr-4 py-3 md:py-2 text-sm focus:ring-2 focus:ring-moma-green outline-none w-full md:w-64"
                        />
                    </div>
                </div>
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f5fbf9] text-[10px] uppercase tracking-widest font-black text-stone-400">
                                <th className="px-4 md:px-6 py-4 whitespace-nowrap">Cliente</th>
                                <th className="px-4 md:px-6 py-4 whitespace-nowrap">Experiencia</th>
                                <th className="px-4 md:px-6 py-4 whitespace-nowrap">Fecha Viaje</th>
                                <th className="px-4 md:px-6 py-4 whitespace-nowrap">Pasajeros</th>
                                <th className="px-4 md:px-6 py-4 whitespace-nowrap">Monto</th>
                                <th className="px-4 md:px-6 py-4 whitespace-nowrap">Estado</th>
                                <th className="px-4 md:px-6 py-4 text-center whitespace-nowrap">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f5f7f9]">
                            {!hasBookings ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-stone-400 font-medium">
                                        No se encontraron reservas.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking: any) => (
                                    <tr key={booking.id} className="group hover:bg-[#fcfdfd] transition-colors">
                                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-moma-green/10 flex items-center justify-center text-[10px] font-black text-moma-green uppercase shrink-0">
                                                    {(booking.customer_name || 'UC').substring(0, 2)}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-black text-[#1a1a1a] truncate max-w-[180px]">
                                                        {booking.customer_name ? booking.customer_name.split('|')[0].trim() : 'Cliente'}
                                                    </span>
                                                    {booking.customer_name && booking.customer_name.includes('|') && (
                                                        <span className="text-[10px] text-stone-500 font-bold bg-stone-100 px-1.5 py-0.5 rounded-md w-fit mt-0.5">
                                                            {booking.customer_name.split('|')[1].trim()}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-stone-400 truncate max-w-[180px] mt-0.5">{booking.customer_email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-bold text-stone-500 truncate max-w-[180px]">
                                            {booking.experience_title || 'Experiencia Eliminada'}
                                        </td>
                                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-bold text-stone-500">
                                            {format(new Date(booking.travel_date), 'MMM d, yyyy', { locale: es })}
                                        </td>
                                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-bold text-stone-500 text-center">
                                            {booking.guests_count}
                                        </td>
                                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-black text-[#1a1a1a]">
                                            ${Number(booking.total_amount).toLocaleString('es-CO')} {booking.currency}
                                        </td>
                                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center w-fit gap-1.5 ${booking.status === 'confirmed' ? 'bg-[#ccfcf3] text-[#00b894]' :
                                                booking.status === 'pending' ? 'bg-orange-50 text-orange-500' :
                                                    'bg-red-50 text-red-500'
                                                }`}>
                                                {booking.status === 'confirmed' ? <CheckCircle className="w-3 h-3 shrink-0" /> :
                                                    booking.status === 'cancelled' ? <AlertCircle className="w-3 h-3 shrink-0" /> :
                                                        <Clock className="w-3 h-3 shrink-0" />}
                                                {booking.status === 'pending' ? 'PENDIENTE' :
                                                    booking.status === 'confirmed' ? 'CONFIRMADO' : 'CANCELADO'}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                            <div className="flex justify-center">
                                                <BookingRowActions booking={booking} />
                                            </div>
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
