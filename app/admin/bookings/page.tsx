import { CheckCircle, Clock, Search, MoreVertical } from "lucide-react";

const MOCK_BOOKINGS = [
    { id: '1', customer: 'Juan Perez', experience: 'Amazonas Salvaje', date: 'Oct 15, 2023', status: 'confirmed', amount: '$2,500,000 COP' },
    { id: '2', customer: 'Sarah Smith', experience: 'Ciudad Perdida VIP', date: 'Dec 01, 2023', status: 'pending', amount: '$450 USD' },
    { id: '3', customer: 'Carlos Diaz', experience: 'Desierto Tatacoa', date: 'Dec 10, 2023', status: 'confirmed', amount: '$1,200,000 COP' },
];

export default function BookingsPage() {
    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[#1a1a1a]">Reservas y Calendario</h1>
                    <p className="text-stone-400 font-medium">Gestiona las reservas y salidas de tus clientes.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-white border border-[#eef1f4] text-[#1a1a1a] px-6 py-4 rounded-2xl font-black text-sm hover:bg-stone-50 transition-all shadow-sm">
                        Exportar Reporte
                    </button>
                    <button className="bg-[#061a15] text-white px-6 py-4 rounded-2xl font-black text-sm hover:opacity-90 transition-all shadow-lg">
                        Ver Calendario
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#eef1f4] overflow-hidden">
                <div className="p-8 border-b border-[#f5f7f9] flex justify-between items-center">
                    <h3 className="text-xl font-black text-[#1a1a1a]">Registro de Reservas</h3>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Buscar reserva..."
                            className="bg-[#f5fbf9] border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-moma-green outline-none w-64"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f5fbf9] text-[10px] uppercase tracking-widest font-black text-stone-400">
                                <th className="px-8 py-4">Cliente</th>
                                <th className="px-8 py-4">Experiencia</th>
                                <th className="px-8 py-4">Fecha Viaje</th>
                                <th className="px-8 py-4">Monto</th>
                                <th className="px-8 py-4">Estado</th>
                                <th className="px-8 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f5f7f9]">
                            {MOCK_BOOKINGS.map((booking) => (
                                <tr key={booking.id} className="group hover:bg-[#fcfdfd] transition-colors">
                                    <td className="px-8 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-moma-green/10 flex items-center justify-center text-[10px] font-black text-moma-green">
                                                {booking.customer.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-sm font-black text-[#1a1a1a]">{booking.customer}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 whitespace-nowrap text-sm font-bold text-stone-500">{booking.experience}</td>
                                    <td className="px-8 py-4 whitespace-nowrap text-sm font-bold text-stone-500">{booking.date}</td>
                                    <td className="px-8 py-4 whitespace-nowrap text-sm font-black text-[#1a1a1a]">{booking.amount}</td>
                                    <td className="px-8 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center w-fit gap-1.5 ${booking.status === 'confirmed' ? 'bg-[#ccfcf3] text-[#00b894]' :
                                                booking.status === 'pending' ? 'bg-orange-50 text-orange-500' : 'bg-red-50 text-red-500'
                                            }`}>
                                            {booking.status === 'confirmed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                            {booking.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 whitespace-nowrap">
                                        <div className="flex justify-center">
                                            <button className="p-2 hover:bg-stone-50 rounded-lg text-stone-300 hover:text-stone-600 transition-all">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

