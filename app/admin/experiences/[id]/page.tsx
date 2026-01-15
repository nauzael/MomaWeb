'use client';
import { use, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import ExperienceForm from '../components/ExperienceForm';
import { getExperiencePersisted, type Experience } from '@/lib/experience-service';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditExperiencePage({ params }: PageProps) {
    const { id } = use(params);
    const [experience, setExperience] = useState<Experience | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        getExperiencePersisted(id)
            .then((data) => {
                if (!cancelled) setExperience(data);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (isLoading) {
        return (
            <div className="bg-white p-12 rounded-[2.5rem] border border-[#eef1f4] text-center">
                <p className="text-stone-400">Cargando...</p>
            </div>
        );
    }

    if (!experience) {
        return (
            <div className="bg-white p-12 rounded-[2.5rem] border border-[#eef1f4] text-center">
                <h1 className="text-2xl font-black text-[#1a1a1a] mb-4">Experiencia no encontrada</h1>
                <p className="text-stone-400 mb-8">El tour que intentas editar no existe o fue eliminado.</p>
                <Link href="/admin/experiences" className="bg-[#061a15] text-white px-8 py-4 rounded-2xl font-bold">
                    Volver a la lista
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[#1a1a1a]">Editar Experiencia</h1>
                    <p className="text-stone-400 font-medium">Actualiza los detalles de la ruta.</p>
                </div>
                <Link href="/admin/experiences" className="p-4 bg-white border border-[#eef1f4] text-[#1a1a1a] rounded-2xl hover:bg-stone-50 transition-all">
                    <X className="w-6 h-6" />
                </Link>
            </div>

            <ExperienceForm initialData={experience} />
        </div>
    );
}
