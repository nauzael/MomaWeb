import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
    try {
        // 1. Security Check
        const supabaseAuth = await createClient()
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabaseAuth
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile && profile.role !== 'admin' && profile.role !== 'editor') {
            return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 })
        }

        const body = await request.json()
        const slug = String(body?.slug || '').trim()

        if (!slug) {
            return NextResponse.json({ error: 'slug is required' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const { error } = await supabase.from('experiences').delete().eq('slug', slug)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ ok: true })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

