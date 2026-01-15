import Image from 'next/image';
import Link from 'next/link';
import { type Experience } from '@/lib/experience-service';

interface ExperienceCardProps {
    experience: Experience;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
    const coverImage = experience.image || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2574&auto=format&fit=crop';

    return (
        <div className="group relative rounded-3xl overflow-hidden shadow-lg bg-transparent h-full flex flex-col hover:-translate-y-1.5 transition-transform duration-500">
            <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                    src={coverImage}
                    alt={experience.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/0" />

                <div className="absolute inset-x-0 bottom-0">
                    <div className="backdrop-blur-xl bg-[linear-gradient(to_top,rgba(0,0,0,0.98)_0%,rgba(0,0,0,0.75)_35%,rgba(0,0,0,0.4)_70%,rgba(0,0,0,0)_100%)]">
                        <div className="px-4 pb-4 pt-3 text-white">
                            <h3 className="text-base font-bold mb-1 leading-tight tracking-tight line-clamp-2">
                                {experience.title}
                            </h3>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] text-stone-200/80 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M20 10c0 6-9 13-9 13S2 16 2 10a9 9 0 0 1 18 0Z" />
                                        <circle cx="11" cy="10" r="3" />
                                    </svg>
                                    <span className="font-medium truncate max-w-[100px]">
                                        {experience.location_name || 'Colombia'}
                                    </span>
                                </p>
                                <div className="flex items-center gap-1.5 text-[10px] text-stone-200/90">
                                    <span className="uppercase tracking-wider text-stone-300/90">
                                        Desde
                                    </span>
                                    <span className="text-sm font-bold">
                                        ${experience.price_cop.toLocaleString('es-CO')}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2 flex justify-center">
                                <div className="relative inline-flex w-full items-center justify-center px-4 py-2 rounded-full bg-white text-stone-900 text-xs font-semibold shadow-md overflow-hidden group-hover:shadow-lg group-hover:-translate-y-0.5 transition-all duration-500">
                                    <span className="relative z-10 group-hover:text-white">
                                        Ver experiencia
                                    </span>
                                    <span className="absolute inset-0 bg-moma-green scale-x-0 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-x-100" />
                                </div>
                            </div>
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
