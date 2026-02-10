import Image from 'next/image';
import Link from 'next/link';
import { type Experience } from '@/lib/experience-service';

interface ExperienceCardProps {
    experience: Experience;
    priority?: boolean;
}

export default function ExperienceCard({ experience, priority = false }: ExperienceCardProps) {
    const coverImage = experience.image || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2574&auto=format&fit=crop';

    return (
        <div className="group relative rounded-4xl rounded-tr-[5rem] rounded-bl-3xl overflow-hidden shadow-lg bg-stone-100 dark:bg-stone-900 h-full flex flex-col hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 ease-out hover:rounded-3xl hover:rounded-tl-[5rem] hover:rounded-br-[5rem]">
            <div className="relative aspect-3/4 w-full overflow-hidden">
                <Image
                    src={coverImage}
                    alt={experience.title}
                    fill
                    priority={priority}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-xs uppercase tracking-widest font-bold text-moma-green mb-2 font-sans">{experience.location_name || 'Montes de María'}</p>
                    <h3 className="text-2xl font-heading font-bold mb-4 leading-tight">{experience.title}</h3>
                    <div className="flex items-center justify-between mb-6 font-sans">
                        <span className="text-sm font-medium opacity-90">Desde</span>
                        <span className="text-xl font-bold">${Number(experience.price_cop).toLocaleString()} COP</span>
                    </div>
                    <div className="overflow-hidden h-0 group-hover:h-auto opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                        <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-center py-3 rounded-xl font-bold text-sm hover:bg-white hover:text-moma-dark transition-colors cursor-pointer">
                            Ver Detalles
                        </div>
                    </div>
                </div>
            </div>

            <Link href={`/experiencias/${experience.slug}`} className="absolute inset-0 z-10">
                <span className="sr-only">Ver detalles de {experience.title}</span>
            </Link>
        </div>
    );
}
