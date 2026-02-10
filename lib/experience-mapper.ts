import { Experience } from './experience-service';

export function toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.map(v => String(v)).filter(v => v.trim().length > 0);
}

function getDurationBySlug(slug: string): string {
    const s = slug.toLowerCase();
    if (s.includes('chalan') || s.includes('muralismo')) return '4 Horas';
    if (s.includes('aguacate')) return '4 Horas';
    if (s.includes('los-caminos')) return '2 Días / 1 Noches'; // Checking brochure detail
    if (s.includes('ruta-montemariana')) return '4 Días / 3 Noches';
    return '3-5 Días';
}

export function mapSupabaseRowToExperience(row: any): Experience {
    const locationLat = Number(row?.location_lat);
    const locationLng = Number(row?.location_lng);
    const hasCoords = Number.isFinite(locationLat) && Number.isFinite(locationLng);

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
        duration: row?.duration ? String(row.duration) : getDurationBySlug(String(row?.slug ?? '')),
        created_at: row?.created_at ? String(row.created_at) : undefined,
        updated_at: row?.updated_at ? String(row.updated_at) : undefined
    };
}
