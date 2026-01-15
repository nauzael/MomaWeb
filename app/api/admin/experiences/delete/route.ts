import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(request: Request) {
    try {
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

