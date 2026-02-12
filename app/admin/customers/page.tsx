'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Mail, Phone, Calendar, MapPin, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api-client';

export default function CustomersPage() {
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

    useEffect(() => {
        if (user) {
            fetchApi<any[]>('admin/bookings/list.php')
                .then(data => {
                    setBookings(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to load customers data', err);
                    setLoading(false);
                });
        }
    }, [user]);

    const customers = useMemo(() => {
        const customersMap = new Map();

        bookings.forEach((booking: any) => {
            const email = (booking.customer_email || '').toLowerCase();
            if (!email) return;

            if (!customersMap.has(email)) {
                customersMap.set(email, {
                    name: booking.customer_name ? booking.customer_name.split('|')[0].trim() : 'Unknown',
                    email: email,
                    phone: booking.customer_name && booking.customer_name.includes('|') ? booking.customer_name.split('|')[1].trim() : 'N/A',
                    totalSpent: 0,
                    bookingsCount: 0,
                    lastBookingDate: booking.created_at,
                    lastExperience: booking.experience_title,
                    status: 'Activo'
                });
            }

            const customer = customersMap.get(email);
            if (booking.status !== 'cancelled') {
                customer.totalSpent += Number(booking.total_amount);
            }
            customer.bookingsCount += 1;

            if (new Date(booking.created_at) > new Date(customer.lastBookingDate)) {
                customer.lastBookingDate = booking.created_at;
                customer.lastExperience = booking.experience_title;
            }
        });

        return Array.from(customersMap.values());
    }, [bookings]);

    const filteredCustomers = useMemo(() => {
        return customers.filter((c: any) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customers, searchTerm]);

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="space-y-6 md:space-y-8 max-w-[1600px] mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-[#1a1a1a]">Gestión de Clientes</h1>
                    <p className="text-stone-400 font-medium text-sm md:text-base">Base de datos de tus viajeros y su historial.</p>
                </div>
            </div>

            <div className="bg-white rounded-4xl md:rounded-[2.5rem] shadow-sm border border-[#eef1f4] overflow-hidden">
                <div className="p-5 md:p-8 border-b border-[#f5f7f9] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="text-lg md:text-xl font-black text-[#1a1a1a]">Lista de Clientes ({filteredCustomers.length})</h3>
                    <div className="relative w-full md:w-auto">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
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
                                <th className="px-4 md:px-6 py-4 whitespace-nowrap">Contacto</th>
                                <th className="px-4 md:px-6 py-4 whitespace-nowrap">Última Experiencia</th>
                                <th className="px-4 md:px-6 py-4 text-center whitespace-nowrap">Reservas</th>
                                <th className="px-4 md:px-6 py-4 whitespace-nowrap">Total Invertido</th>
                                <th className="px-4 md:px-6 py-4 whitespace-nowrap">Última Actividad</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f5f7f9]">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-stone-400 font-medium">
                                        No hay clientes registrados o coincidentes.
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer: any, index: number) => (
                                    <tr key={index} className="group hover:bg-[#fcfdfd] transition-colors">
                                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-xs font-black text-stone-500 uppercase shrink-0">
                                                    {customer.name.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-[#1a1a1a]">{customer.name}</p>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 mt-0.5">
                                                        {customer.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                                                    <Mail className="w-3 h-3 text-stone-400" />
                                                    {customer.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                                                    <Phone className="w-3 h-3 text-stone-400" />
                                                    {customer.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm font-bold text-stone-600">
                                                <MapPin className="w-3 h-3 text-moma-green" />
                                                {customer.lastExperience || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-6 rounded-lg bg-stone-100 text-stone-700 text-xs font-black">
                                                {customer.bookingsCount}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-black text-[#1a1a1a]">
                                                ${customer.totalSpent.toLocaleString('es-CO')}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-stone-400" />
                                                {format(new Date(customer.lastBookingDate), 'd MMM, yyyy', { locale: es })}
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
