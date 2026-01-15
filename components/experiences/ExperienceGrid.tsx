import { type Experience } from '@/lib/experience-service';
import ExperienceCard from './ExperienceCard';

interface ExperienceGridProps {
    experiences: Experience[];
}

export default function ExperienceGrid({ experiences }: ExperienceGridProps) {
    if (experiences.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-stone-500">No hay experiencias disponibles en este momento.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {experiences.map((exp) => (
                <ExperienceCard key={exp.id} experience={exp} />
            ))}
        </div>
    );
}
