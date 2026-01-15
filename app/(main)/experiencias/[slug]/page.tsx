import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getExperience, type Experience } from '@/lib/experience-service';
import ExperienceDetails from './ExperienceDetails';
import { createClient as createSupabaseServerClient } from '@/utils/supabase/server';

interface PageProps {
    params: Promise<{ slug: string }>;
}

function isSupabaseConfigured() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anonKey) return false
    if (url === 'https://example.com') return false
    if (anonKey === 'mock-key') return false
    return true
}

function toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return []
    return value.map(v => String(v)).filter(v => v.trim().length > 0)
}

function mapRowToExperience(row: any): Experience {
    const locationLat = Number(row?.location_lat)
    const locationLng = Number(row?.location_lng)
    const hasCoords = Number.isFinite(locationLat) && Number.isFinite(locationLng)

    return {
        id: String(row?.id ?? ''),
        title: String(row?.title ?? ''),
        slug: String(row?.slug ?? ''),
        description: String(row?.description ?? ''),
        image: String(row?.image ?? ''),
        gallery: toStringArray(row?.gallery),
        price_cop: Number(row?.price_cop) || 0,
        price_usd: Number(row?.price_usd) || 0,
        max_capacity: Number(row?.max_capacity) || 0,
        includes: toStringArray(row?.includes),
        excludes: toStringArray(row?.excludes),
        location_name: row?.location_name ? String(row.location_name) : undefined,
        location_coords: hasCoords ? { lat: locationLat, lng: locationLng } : { lat: 4.5709, lng: -74.2973 },
        created_at: row?.created_at ? String(row.created_at) : undefined,
        updated_at: row?.updated_at ? String(row.updated_at) : undefined
    }
}

async function getExperienceForPage(slug: string): Promise<Experience | null> {
    if (isSupabaseConfigured()) {
        try {
            const supabase = await createSupabaseServerClient()
            const { data, error } = await supabase.from('experiences').select('*').eq('slug', slug).maybeSingle()
            if (!error && data) return mapRowToExperience(data)
        } catch {
        }
    }

    return getExperience(slug)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const experience = await getExperienceForPage(slug);

    if (!experience) {
        return {
            title: 'Experiencia no encontrada',
        };
    }

    return {
        title: experience.title,
        description: experience.description.slice(0, 160),
        openGraph: {
            title: experience.title,
            description: experience.description.slice(0, 160),
            images: [experience.image || '/images/hero-bg.jpg'],
        },
    };
}

export default async function ExperiencePage({ params }: PageProps) {
    const { slug } = await params;
    const experience = await getExperienceForPage(slug);

    if (!experience) {
        notFound();
    }
    
    // JSON-LD Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: experience.title,
        description: experience.description,
        image: experience.image,
        offers: {
            '@type': 'Offer',
            price: experience.price_cop,
            priceCurrency: 'COP',
            availability: 'https://schema.org/InStock',
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ExperienceDetails experience={experience} />
        </>
    );
}
