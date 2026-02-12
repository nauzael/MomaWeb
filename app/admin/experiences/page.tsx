'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2, Search, Map, LayoutGrid, List, Users, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllExperiencesPersisted, deleteExperiencePersisted, type Experience } from '@/lib/experience-service';
import { usePollingExperiences } from '@/hooks/usePollingExperiences';
import { cn } from '@/lib/utils';

export default function ExperiencesPage() {
    const [initialExperiences, setInitialExperiences] = useState<Experience[]>([]);
    const { experiences, refresh } = usePollingExperiences(initialExperiences, 4000);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        getAllExperiencesPersisted()
            .then(setInitialExperiences)
            .catch((e) => {
                console.error(e);
            });
    }, []);

    const filteredExperiences = useMemo(() => experiences.filter(exp =>
        exp.title.toLowerCase().includes(searchTerm.toLowerCase())
    ), [experiences, searchTerm]);

    const handleDelete = async (slug?: string) => {
        if (!slug) {
            alert('No se pudo identificar la experiencia para eliminar.');
            return;
        }
        if (!confirm('¿Estás seguro de eliminar esta experiencia?')) return;
        try {
            await deleteExperiencePersisted(slug);
            await refresh();
        } catch (err) {
            console.error('Delete failed:', err);
            alert('No se pudo eliminar la experiencia.');
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-20 space-y-8">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-moma-dark tracking-tight">Experiencias</h1>
                    <p className="text-stone-500 font-medium text-lg">
                        Gestiona el catálogo de tours y aventuras de Moma.
                    </p>
                </div>

                {/* Status Badges - REMOVED */}
            </header>

            {/* Toolbar Section */}
            <div className="sticky top-0 z-10 bg-[#f5f7f9]/80 backdrop-blur-md py-4 -mx-4 px-4 md:mx-0 md:px-0 flex flex-col md:flex-row gap-4 justify-between items-center transition-all">
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-stone-400 group-focus-within:text-moma-green transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-moma-green/20 focus:border-moma-green transition-all shadow-sm outline-none"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="bg-white p-1 rounded-xl border border-stone-200 flex shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === 'grid' ? "bg-moma-dark text-white shadow-md" : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"
                            )}
                            aria-label="Vista de cuadrícula"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === 'list' ? "bg-moma-dark text-white shadow-md" : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"
                            )}
                            aria-label="Vista de lista"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <Link
                        href="/admin/experiences/new"
                        className="flex-1 md:flex-none bg-moma-green hover:bg-[#229ca3] text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-moma-green/20 hover:shadow-xl hover:shadow-moma-green/30 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Nueva</span>
                    </Link>
                </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {filteredExperiences.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6">
                            <Search className="w-10 h-10 text-stone-300" />
                        </div>
                        <h3 className="text-xl font-bold text-stone-700 mb-2">No se encontraron experiencias</h3>
                        <p className="text-stone-500 max-w-md">
                            No hay resultados para "{searchTerm}". Intenta con otro término o crea una nueva experiencia.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key={viewMode}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredExperiences.map((exp, index) => (
                                    <ExperienceCard
                                        key={exp.id || exp.slug}
                                        experience={exp}
                                        onDelete={() => handleDelete(exp.slug)}
                                        index={index}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-stone-50/50 border-b border-stone-100 text-xs uppercase tracking-wider font-bold text-stone-400">
                                                <th className="px-6 py-4">Experiencia</th>
                                                <th className="px-6 py-4">Precio</th>
                                                <th className="px-6 py-4">Capacidad</th>
                                                <th className="px-6 py-4 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-100">
                                            {filteredExperiences.map((exp) => (
                                                <ExperienceRow
                                                    key={exp.id || exp.slug}
                                                    experience={exp}
                                                    onDelete={() => handleDelete(exp.slug)}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ExperienceCard({ experience, onDelete, index }: { experience: Experience, onDelete: () => void, index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white rounded-4xl border border-stone-100 overflow-hidden hover:shadow-xl hover:shadow-stone-200/50 hover:border-stone-200 transition-all duration-300 flex flex-col h-full"
        >
            <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                {experience.image ? (
                    <Image
                        src={experience.image}
                        alt={experience.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <Map className="w-10 h-10" />
                    </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                    <Link
                        href={`/admin/experiences/edit?id=${experience.slug}`}
                        className="p-2 bg-white/90 backdrop-blur text-moma-dark hover:text-moma-green rounded-xl shadow-lg hover:scale-110 transition-all"
                        aria-label="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onDelete();
                        }}
                        className="p-2 bg-white/90 backdrop-blur text-red-500 hover:bg-red-50 rounded-xl shadow-lg hover:scale-110 transition-all"
                        aria-label="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <div className="flex-1 space-y-2">
                    <h3 className="font-bold text-lg text-moma-dark line-clamp-2 leading-tight group-hover:text-moma-green transition-colors">
                        {experience.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-medium text-stone-500">
                        <div className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5" />
                            <span>${experience.price_cop?.toLocaleString('es-CO')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>Max {experience.max_capacity}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ExperienceRow({ experience, onDelete }: { experience: Experience, onDelete: () => void }) {
    return (
        <tr className="group hover:bg-stone-50/50 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        {experience.image ? (
                            <Image
                                src={experience.image}
                                alt={experience.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                                <Map className="w-5 h-5" />
                            </div>
                        )}
                    </div>
                    <span className="font-bold text-moma-dark">{experience.title}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-sm font-medium text-stone-600">
                ${experience.price_cop?.toLocaleString('es-CO')}
            </td>
            <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-700">
                    {experience.max_capacity} pax
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                        href={`/admin/experiences/edit?id=${experience.slug}`}
                        className="p-2 text-stone-400 hover:text-moma-green hover:bg-moma-green/10 rounded-lg transition-all"
                        aria-label="Editar"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={onDelete}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        aria-label="Eliminar"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}
