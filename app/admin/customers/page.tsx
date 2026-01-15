import { createClient } from '@/utils/supabase/server';
import { Search, Mail, Phone, Calendar, MapPin } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
    const supabase = await createClient();

    // Fetch all bookings to extract customer info
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
            *,
            experiences (
                title
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching customers:", error);
    }

    // Process customers from bookings (deduplicate by email)
    const customersMap = new Map();

    bookings?.forEach((booking: any) => {
        const email = booking.customer_email.toLowerCase();
        
        if (!customersMap.has(email)) {
            customersMap.set(email, {
                name: booking.customer_name.split('|')[0].trim(),
                email: email,
                phone: booking.customer_name.includes('|') ? booking.customer_name.split('|')[1].trim() : 'N/A',
                totalSpent: 0,
                bookingsCount: 0,
                lastBookingDate: booking.created_at,
                lastExperience: booking.experiences?.title,
                status: 'Activo' // Default status
            });
        }

        const customer = customersMap.get(email);
        if (booking.status !== 'cancelled') {
            customer.totalSpent += Number(booking.total_amount);
        }
        customer.bookingsCount += 1;
        
        // Update last booking if this one is newer
        if (new Date(booking.created_at) > new Date(customer.lastBookingDate)) {
            customer.lastBookingDate = booking.created_at;
            customer.lastExperience = booking.experiences?.title;
        }
    });

    const customers = Array.from(customersMap.values());

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[#1a1a1a]">Gestión de Clientes</h1>
                    <p className="text-stone-400 font-medium">Base de datos de tus viajeros y su historial.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#eef1f4] overflow-visible">
                <div className="p-8 border-b border-[#f5f7f9] flex justify-between items-center">
                    <h3 className="text-xl font-black text-[#1a1a1a]">Lista de Clientes ({customers.length})</h3>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            className="bg-[#f5fbf9] border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-moma-green outline-none w-64"
                        />
                    </div>
                </div>
                <div className="w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f5fbf9] text-[10px] uppercase tracking-widest font-black text-stone-400">
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">Última Experiencia</th>
                                <th className="px-6 py-4 text-center">Reservas</th>
                                <th className="px-6 py-4">Total Invertido</th>
                                <th className="px-6 py-4">Última Actividad</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f5f7f9]">
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-stone-400 font-medium">
                                        No hay clientes registrados aún.
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer, index) => (
                                    <tr key={index} className="group hover:bg-[#fcfdfd] transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-xs font-black text-stone-500 uppercase">
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
                                        <td className="px-6 py-4 whitespace-nowrap">
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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm font-bold text-stone-600">
                                                <MapPin className="w-3 h-3 text-moma-green" />
                                                {customer.lastExperience || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-6 rounded-lg bg-stone-100 text-stone-700 text-xs font-black">
                                                {customer.bookingsCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-black text-[#1a1a1a]">
                                                ${customer.totalSpent.toLocaleString('es-CO')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-500">
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
