import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from('bookings')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, booking: data });
    } catch (error: any) {
        console.error('Error updating booking:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
