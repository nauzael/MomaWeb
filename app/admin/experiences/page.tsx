'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2, Search, Map } from 'lucide-react';
import { getAllExperiences, deleteExperience, resetExperiences, type Experience } from '@/lib/experience-service';

export default function ExperiencesPage() {
    const [experiences, setExperiences] = useState<Experience[]>(() => getAllExperiences());
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const handleFocus = () => {
            setExperiences(getAllExperiences());
        };

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                setExperiences(getAllExperiences());
            }
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const filteredExperiences = experiences.filter(exp =>
        exp.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id: string | number) => {
        if (!confirm('¿Estás seguro de eliminar esta experiencia?')) return;

        try {
            deleteExperience(id);
            // Instant UI update
            setExperiences(prev => prev.filter(exp => String(exp.id).trim() !== String(id).trim()));
            console.log('Deleted:', id);
        } catch (err) {
            console.error('Delete failed:', err);
            alert('No se pudo eliminar la experiencia.');
        }
    };

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[#1a1a1a]">Gestión de Experiencias</h1>
                    <p className="text-stone-400 font-medium">Administra tu catálogo de rutas y tours.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => {
                            if (confirm('¿Reiniciar base de datos local? Se perderán todos los cambios personalizados.')) {
                                resetExperiences();
                                window.location.reload();
                            }
                        }}
                        className="px-6 py-4 rounded-2xl border border-red-200 text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
                    >
                        Reset Datos
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
                                                href={`/admin/experiences/${exp.id}`}
                                                className="p-2.5 bg-[#ccfcf3] text-[#00b894] hover:bg-moma-green hover:text-white rounded-xl transition-all"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleDelete(exp.id);
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


