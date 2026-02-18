import Image from 'next/image';
import Link from 'next/link';
import { type Experience } from '@/lib/experience-service';
import { getImageUrl } from '@/lib/api-client';
import { MapPin, Users, ArrowRight, Clock } from 'lucide-react';

interface ExperienceCardProps {
    experience: Experience;
    priority?: boolean;
}

export default function ExperienceCard({ experience, priority = false }: ExperienceCardProps) {
    const coverImage = getImageUrl(experience.image) || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2574&auto=format&fit=crop';

    return (
        <Link
            href={`/experiencia?slug=${experience.slug}`}
            className="group relative flex flex-col bg-white dark:bg-stone-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
        >
            {/* Image Container */}
            <div className="relative h-56 w-full overflow-hidden">
                <Image
                    src={coverImage}
                    alt={experience.title}
                    fill
                    priority={priority}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    <span className="text-lg font-bold text-moma-green">
                        ${Number(experience.price_cop).toLocaleString('es-CO')}
                    </span>
                </div>

                {/* Location Tag */}
                {experience.location_name && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <MapPin className="w-3.5 h-3.5 text-moma-green" />
                        <span className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                            {experience.location_name}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-6">
                <h3 className="text-xl font-heading font-bold text-stone-900 dark:text-white mb-3 line-clamp-2 group-hover:text-moma-green transition-colors">
                    {experience.title}
                </h3>

                <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-3 mb-4 flex-1">
                    {experience.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 mb-4 text-xs font-medium text-stone-500 dark:text-stone-400">
                    {experience.max_capacity && (
                        <div className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span>Hasta {experience.max_capacity} personas</span>
                        </div>
                    )}
                    {experience.duration && (
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{experience.duration}</span>
                        </div>
                    )}
                </div>

                {/* CTA Button */}
                <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
                    <span className="text-sm font-bold text-moma-green">
                        Ver experiencia
                    </span>
                    <ArrowRight className="w-5 h-5 text-moma-green transform group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </Link>
    );
}
