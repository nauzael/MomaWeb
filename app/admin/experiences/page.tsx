'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2, Search, Map } from 'lucide-react';
import { getAllExperiencesPersisted, deleteExperiencePersisted, migrateLocalExperiencesToSupabase, resetExperiences, getConnectionStatus, getAllExperiences, type Experience } from '@/lib/experience-service';
import { usePollingExperiences } from '@/hooks/usePollingExperiences';
import { MOCK_EXPERIENCES } from '@/lib/mock-data';

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

        // Check for orphaned local data
        // FORCE READ from localStorage to debug
        if (typeof window !== 'undefined') {
            try {
                const rawData = localStorage.getItem('moma_experiences');
                console.log('DEBUG: Local Storage raw data:', rawData);
                
                if (rawData) {
                    const parsed = JSON.parse(rawData);
                    console.log('DEBUG: Parsed local experiences:', parsed);
                    
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setLocalCount(parsed.length);
                        console.log(`DEBUG: Found ${parsed.length} local items to migrate`);
                    } else {
                        console.log('DEBUG: Local storage array is empty or invalid');
                    }
                } else {
                    console.log('DEBUG: No local storage data found for key "moma_experiences"');
                }
            } catch (e) {
                console.error('DEBUG: Error checking local storage:', e);
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
        <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[#1a1a1a]">Gestión de Experiencias</h1>
                    <p className="text-stone-400 font-medium">Administra tu catálogo de rutas y tours.</p>
                </div>
                <div className="flex gap-4">
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
                        <button
                            onClick={() => handleMigration(true)}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-200 transition-colors flex items-center gap-2"
                            title="Subir todos los productos (Mocks + Locales) a la nube"
                        >
                            ☁️ Cargar Todo a BD
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleManualSync}
                        className="px-6 py-4 rounded-2xl border border-stone-200 text-stone-500 hover:bg-stone-50 transition-all font-bold text-sm flex items-center gap-2 active:scale-95"
                        title="Sincronizar ahora"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                            <path d="M16 21h5v-5" />
                        </svg>
                        Sincronizar
                    </button>
                    <Link href="/admin/experiences/new" className="bg-[#061a15] text-white px-8 py-4 rounded-2xl flex items-center hover:opacity-90 transition-all shadow-lg font-black text-sm">
                        <Plus className="w-5 h-5 mr-3" />
                        Nueva Experiencia
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#eef1f4] overflow-hidden">
                <div className="p-8 border-b border-[#f5f7f9] flex justify-between items-center">
                    <h3 className="text-xl font-black text-[#1a1a1a]">Todas las Experiencias</h3>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Buscar experiencia..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#f5fbf9] border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-moma-green outline-none w-64"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f5fbf9] text-[10px] uppercase tracking-widest font-black text-stone-400">
                                <th className="px-8 py-4">Título</th>
                                <th className="px-8 py-4">Precio COP</th>
                                <th className="px-8 py-4">Capacidad</th>
                                <th className="px-8 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f5f7f9]">
                            {filteredExperiences.map((exp) => (
                                <tr key={exp.id} className="group hover:bg-[#fcfdfd] transition-colors">
                                    <td className="px-8 py-5">
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
                                            <span className="text-sm font-black text-[#1a1a1a]">{exp.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-stone-600">
                                        ${typeof exp.price_cop === 'number' ? exp.price_cop.toLocaleString('es-CO') : exp.price_cop}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="bg-stone-100 text-stone-600 text-[10px] font-black px-3 py-1 rounded-lg">
                                            {exp.max_capacity} pax
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
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


