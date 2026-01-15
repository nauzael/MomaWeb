import { createClient as createServerClient } from '@/utils/supabase/server'
import { Experience } from './experience-service'

function toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return []
    return value.map(v => String(v)).filter(v => v.trim().length > 0)
}

function mapSupabaseRowToExperience(row: any): Experience {
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

export async function fetchAllExperiencesFromSupabaseServer(): Promise<Experience[]> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Supabase fetch error:', error)
        throw new Error(error.message)
    }
    if (!Array.isArray(data)) return []
    return data.map(mapSupabaseRowToExperience)
}

export async function fetchExperienceFromSupabaseServer(identifier: string): Promise<Experience | null> {
    const supabase = await createServerClient()
    const clean = identifier.trim()

    const bySlug = await supabase.from('experiences').select('*').eq('slug', clean).maybeSingle()
    if (bySlug.error) console.error('Supabase slug error:', bySlug.error)
    if (bySlug.data) return mapSupabaseRowToExperience(bySlug.data)

    const byId = await supabase.from('experiences').select('*').eq('id', clean).maybeSingle()
    if (byId.error) console.error('Supabase id error:', byId.error)
    if (byId.data) return mapSupabaseRowToExperience(byId.data)

    return null
}
