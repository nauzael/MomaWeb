'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2, Search, Map } from 'lucide-react';
import { getAllExperiencesPersisted, deleteExperiencePersisted, migrateLocalExperiencesToSupabase, getConnectionStatus, type Experience } from '@/lib/experience-service';
import { usePollingExperiences } from '@/hooks/usePollingExperiences';

export default function ExperiencesPage() {
    const [initialExperiences, setInitialExperiences] = useState<Experience[]>([]);
    // Use polling hook (free & robust) instead of realtime subscription
    const { experiences, refresh } = usePollingExperiences(initialExperiences, 4000); 
    const [searchTerm, setSearchTerm] = useState('');
    const [connectionStatus, setConnectionStatus] = useState<{ connected: boolean, message: string } | null>(null);
    const [localCount, setLocalCount] = useState(0);

    const checkConnection = async () => {
        const status = await getConnectionStatus();
        setConnectionStatus({
            connected: status.connected,
            message: status.message
        });

        if (typeof window !== 'undefined') {
            try {
                const rawData = localStorage.getItem('moma_experiences');

                if (rawData) {
                    const parsed = JSON.parse(rawData);

                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setLocalCount(parsed.length);
                    } else {
                        setLocalCount(0);
                    }
                } else {
                    setLocalCount(0);
                }
            } catch {
                setLocalCount(0);
            }
        }
    };

    const handleMigration = async (forceAll: boolean = false) => {
        const count = forceAll ? 'todos los' : localCount;
        const source = forceAll ? 'datos locales y predeterminados (Mocks)' : 'experiencias guardadas localmente';
        
        if (!confirm(`¿Estás seguro de subir ${count} ${source} a Supabase? Esto actualizará la base de datos en la nube.`)) return;
        
        try {
            const result = await migrateLocalExperiencesToSupabase();
            if (result.partial) {
                alert(`⚠️ Migración parcial: Se subieron ${result.count} experiencias, pero hubo errores. Revisa la consola.`);
            } else {
                alert(`¡Éxito! Se migraron ${result.count} experiencias a la nube.`);
            }
            
            // Clear local storage after successful migration to avoid duplicates/confusion
            if (!forceAll && localCount > 0) {
                 localStorage.removeItem('moma_experiences');
                 setLocalCount(0);
            }
            await refresh();
        } catch (e) {
            console.error(e);
            alert('Error al migrar. Verifica tu conexión.');
        }
    };

    useEffect(() => {
        getAllExperiencesPersisted()
            .then(setInitialExperiences)
            .catch((e) => {
                if (e?.message !== 'ABORTED') console.error(e);
            });
        checkConnection();
    }, []);

    const handleManualSync = async () => {
        await checkConnection();
        await refresh();
    };

    const filteredExperiences = experiences.filter(exp =>
        exp.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string | number) => {
        if (!confirm('¿Estás seguro de eliminar esta experiencia?')) return;

        try {
            const identifier = String(id).trim();
            const exp = experiences.find(e => e.slug === identifier || String(e.id).trim() === identifier);
            if (!exp?.slug) throw new Error('No se pudo determinar el slug para eliminar');

            await deleteExperiencePersisted(exp.slug);
            await refresh();
        } catch (err) {
            console.error('Delete failed:', err);
            alert('No se pudo eliminar la experiencia.');
        }
    };

    const isUnstable = connectionStatus?.message?.includes('inestable');
    const statusColor = connectionStatus?.connected 
        ? 'bg-green-100 text-green-700' 
        : isUnstable 
            ? 'bg-amber-100 text-amber-700' 
            : 'bg-red-100 text-red-700';
    const dotColor = connectionStatus?.connected 
        ? 'bg-green-500' 
        : isUnstable 
            ? 'bg-amber-500 animate-pulse' 
            : 'bg-red-500';

    return (
        <div className="space-y-6 md:space-y-8 max-w-[1600px] mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-[#1a1a1a]">Gestión de Experiencias</h1>
                    <p className="text-stone-400 font-medium text-sm md:text-base">Administra tu catálogo de rutas y tours.</p>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-4">
                    {connectionStatus && (
                        <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${statusColor}`}>
                            <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                            {connectionStatus.message}
                        </div>
                    )}
                    {localCount > 0 && (
                        <button
                            onClick={() => handleMigration(false)}
                            className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-200 transition-colors flex items-center gap-2 animate-bounce"
                        >
                            ⚠️ Subir {localCount} locales
                        </button>
                    )}
                    {connectionStatus?.connected && (
                        <div className="hidden">
                             {/* Buttons removed but connection status check kept */}
                        </div>
                    )}
                    <Link href="/admin/experiences/new" className="bg-[#061a15] text-white px-8 py-4 rounded-2xl flex items-center hover:opacity-90 transition-all shadow-lg font-black text-sm flex-1 md:flex-none justify-center">
                        <Plus className="w-5 h-5 md:mr-3" />
                        <span className="ml-2 md:ml-0">Nueva Experiencia</span>
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-[#eef1f4] overflow-hidden">
                <div className="p-5 md:p-8 border-b border-[#f5f7f9] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h3 className="text-lg md:text-xl font-black text-[#1a1a1a]">Todas las Experiencias</h3>
                    <div className="relative w-full md:w-auto">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Buscar experiencia..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#f5fbf9] border-none rounded-xl pl-10 pr-4 py-3 md:py-2 text-sm focus:ring-2 focus:ring-moma-green outline-none w-full md:w-64"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f5fbf9] text-[10px] uppercase tracking-widest font-black text-stone-400">
                                <th className="px-4 md:px-8 py-4 whitespace-nowrap">Título</th>
                                <th className="px-4 md:px-8 py-4 whitespace-nowrap">Precio COP</th>
                                <th className="px-4 md:px-8 py-4 whitespace-nowrap">Capacidad</th>
                                <th className="px-4 md:px-8 py-4 text-center whitespace-nowrap">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f5f7f9]">
                            {filteredExperiences.map((exp) => (
                                <tr key={exp.id} className="group hover:bg-[#fcfdfd] transition-colors">
                                    <td className="px-4 md:px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0 relative border border-[#eef1f4]">
                                                {exp.image ? (
                                                    <Image
                                                        src={exp.image}
                                                        alt={exp.title}
                                                        fill
                                                        unoptimized
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-moma-green/10 flex items-center justify-center text-moma-green font-bold text-xs">
                                                        <Map className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-sm font-black text-[#1a1a1a] min-w-[120px]">{exp.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-8 py-5 text-sm font-bold text-stone-600 whitespace-nowrap">
                                        ${typeof exp.price_cop === 'number' ? exp.price_cop.toLocaleString('es-CO') : exp.price_cop}
                                    </td>
                                    <td className="px-4 md:px-8 py-5 whitespace-nowrap">
                                        <span className="bg-stone-100 text-stone-600 text-[10px] font-black px-3 py-1 rounded-lg">
                                            {exp.max_capacity} pax
                                        </span>
                                    </td>
                                    <td className="px-4 md:px-8 py-5 whitespace-nowrap">
                                        <div className="flex justify-center gap-3">
                                            <Link
                                                href={`/admin/experiences/${exp.slug}`}
                                                className="p-2.5 bg-[#ccfcf3] text-[#00b894] hover:bg-moma-green hover:text-white rounded-xl transition-all"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    void handleDelete(exp.id);
                                                }}
                                                className="p-2.5 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
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


