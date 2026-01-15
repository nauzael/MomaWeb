import { createClient as createServerClient } from '@/utils/supabase/server'
import { Experience } from './experience-service'
import { mapSupabaseRowToExperience } from './experience-mapper'

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
