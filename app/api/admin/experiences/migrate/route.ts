import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

function asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return []
    return value.map(v => String(v)).filter(v => v.trim().length > 0)
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const experiences: unknown[] = Array.isArray(body?.experiences) ? body.experiences : []

        if (experiences.length === 0) {
            return NextResponse.json({ error: 'No experiences provided' }, { status: 400 })
        }

        const rows = experiences
            .filter(e => e && typeof e === 'object')
            .map((experience: any) => {
                const title = String(experience.title || '').trim()
                const slug = String(experience.slug || '').trim()
                if (!title || !slug) return null

                return {
                    title,
                    slug,
                    description: typeof experience.description === 'string' ? experience.description : '',
                    image: typeof experience.image === 'string' ? experience.image : '',
                    gallery: asStringArray(experience.gallery),
                    price_cop: Number(experience.price_cop) || 0,
                    price_usd: Number(experience.price_usd) || 0,
                    max_capacity: Number(experience.max_capacity) || 0,
                    includes: asStringArray(experience.includes),
                    excludes: asStringArray(experience.excludes),
                    location_name: typeof experience.location_name === 'string' ? experience.location_name : null,
                    location_lat: Number.isFinite(Number(experience?.location_coords?.lat)) ? Number(experience.location_coords.lat) : null,
                    location_lng: Number.isFinite(Number(experience?.location_coords?.lng)) ? Number(experience.location_coords.lng) : null,
                    updated_at: new Date().toISOString()
                }
            })
            .filter(Boolean)

        if (rows.length === 0) {
            return NextResponse.json({ error: 'No valid experiences provided' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const { error } = await supabase.from('experiences').upsert(rows, { onConflict: 'slug' })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ ok: true, count: rows.length })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

