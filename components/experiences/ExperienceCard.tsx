import Image from 'next/image';
import Link from 'next/link';
import { type Experience } from '@/lib/experience-service';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/api-client';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ExperienceCardProps {
    experience: Experience;
    priority?: boolean;
}

export default function ExperienceCard({ experience, priority = false }: ExperienceCardProps) {
    const { t } = useLanguage();
    const coverImage = getImageUrl(experience.image) || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2574&auto=format&fit=crop';

    // Moma Green HSL: approx 168 100% 36% (for #00b894)
    // Using a slightly darker/richer variant for better contrast in gradients
    const themeColor = "168 85% 30%";

    return (
        <div
            style={{
                // @ts-ignore
                "--theme-color": themeColor,
            } as React.CSSProperties}
            className="group w-full h-full"
        >
            <Link
                href={`/experiencia?slug=${experience.slug}`}
                className="relative block w-full h-full rounded-2xl overflow-hidden shadow-lg 
                     transition-all duration-500 ease-in-out 
                     group-hover:scale-105 group-hover:shadow-[0_0_60px_-15px_hsl(var(--theme-color)/0.6)]"
                aria-label={t.experienceDetail.viewDetailsAria.replace('{title}', experience.title)}
                style={{
                    boxShadow: `0 0 40px -15px hsl(var(--theme-color) / 0.5)`
                }}
            >
                {/* Background Image with Parallax Zoom */}
                <div className="relative w-full h-full aspect-3/4">
                    <Image
                        src={coverImage}
                        alt={experience.title}
                        fill
                        priority={priority}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                    />

                    {/* Themed Gradient Overlay */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(to top, hsl(var(--theme-color) / 0.9), hsl(var(--theme-color) / 0.6) 30%, transparent 60%)`,
                        }}
                    />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 text-white text-left">
                        <h3 className="text-2xl font-bold tracking-tight mb-1 font-heading leading-tight drop-shadow-md">
                            {experience.title}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-white/90 font-medium mt-1">
                            <span>{experience.location_name || 'Colombia'}</span>
                            <span>•</span>
                            <span className="font-bold">${Number(experience.price_cop).toLocaleString()}</span>
                        </div>

                        {/* Explore Button */}
                        <div className="mt-6 flex items-center justify-between bg-[hsl(var(--theme-color)/0.2)] backdrop-blur-md border border-[hsl(var(--theme-color)/0.3)] 
                                    rounded-lg px-4 py-3 
                                    transition-all duration-300 
                                    group-hover/btn:bg-white group-hover/btn:border-white group-hover/btn:text-[hsl(var(--theme-color))]
                                    hover:bg-white! hover:border-white! hover:text-[hsl(var(--theme-color))]! hover:shadow-lg hover:scale-[1.05]">
                            <span className="text-sm font-semibold tracking-wide">{t.hero.viewExperience}</span>
                            <ArrowRight className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
