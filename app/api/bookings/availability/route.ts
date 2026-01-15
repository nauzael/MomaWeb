import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const experienceId = searchParams.get('experienceId');

        if (!experienceId) {
            return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
        }

        const supabase = await createClient();
        const today = new Date().toISOString().split('T')[0];

        // Fetch all future bookings for this experience
        // We only care about confirmed or pending bookings, not cancelled ones
        const { data, error } = await supabase
            .from('bookings')
            .select('travel_date, guests_count')
            .eq('experience_id', experienceId)
            .neq('status', 'cancelled')
            .gte('travel_date', today);

        if (error) {
            throw error;
        }

        // Aggregate guests per date
        const availability: Record<string, number> = {};
        
        data?.forEach(booking => {
            const dateStr = booking.travel_date; // Assuming YYYY-MM-DD format from DB date column
            availability[dateStr] = (availability[dateStr] || 0) + booking.guests_count;
        });

        return NextResponse.json({ availability });
    } catch (error: any) {
        console.error('Error fetching availability:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
