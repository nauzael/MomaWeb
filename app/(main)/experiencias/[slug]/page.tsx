import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getExperience, type Experience } from '@/lib/experience-service';
import ExperienceDetails from './ExperienceDetails';
import { createClient as createSupabaseServerClient } from '@/utils/supabase/server';

import { mapSupabaseRowToExperience } from '@/lib/experience-mapper';

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

export const dynamicParams = true;

async function getExperienceForPage(slug: string): Promise<Experience | null> {
    // 1. Try Supabase Server-Side
    if (isSupabaseConfigured()) {
        try {
            const supabase = await createSupabaseServerClient()
            const { data, error } = await supabase.from('experiences').select('*').eq('slug', slug).maybeSingle()
            if (!error && data) return mapSupabaseRowToExperience(data)
        } catch {
            // Continue to fallback
        }
    }

    // 2. Try Local Mock Data (Fallback)
    // IMPORTANT: getExperience() reads from localStorage which is NOT available on server
    // So we need to use a server-safe way to get mocks, or return null and let client handle it.
    // However, since we are in a server component, we can only access static mocks here.

    // Check static mocks first
    const { MOCK_EXPERIENCES } = await import('@/lib/mock-data');
    const mock = MOCK_EXPERIENCES.find(e => e.slug === slug);
    if (mock) return mock as unknown as Experience;

    return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const experience = await getExperienceForPage(slug);

    if (!experience) {
        return {
            title: 'Experiencia no encontrada',
        };
    }

    // Improve description truncation to avoid cutting words
    let description = experience.description;
    if (description.length > 155) {
        // Cut at 155 chars
        const truncated = description.slice(0, 155);
        // Find the last space to avoid cutting a word
        const lastSpaceIndex = truncated.lastIndexOf(' ');
        if (lastSpaceIndex > 0) {
            description = truncated.slice(0, lastSpaceIndex) + '...';
        } else {
            description = truncated + '...';
        }
    }

    return {
        title: experience.title,
        description: description,
        openGraph: {
            title: experience.title,
            description: description,
            images: [experience.image || '/images/hero-bg.jpg', ...(experience.gallery || [])],
        },
        keywords: [
            experience.title,
            'Turismo de Paz',
            'Bosque Seco Tropical',
            'Chalán',
            'Montes de María',
            experience.location_name || 'Sucre',
            'Colombia'
        ],
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
