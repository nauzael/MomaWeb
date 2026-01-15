'use client';
import { X } from 'lucide-react';
import Link from 'next/link';
import ExperienceForm from '../components/ExperienceForm';

export default function NewExperiencePage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Crear Nueva Experiencia</h1>
                <Link href="/admin/experiences" className="text-stone-500 hover:text-stone-700">
                    <X className="w-6 h-6" />
                </Link>
            </div>

            <ExperienceForm />
        </div>
    )
}

