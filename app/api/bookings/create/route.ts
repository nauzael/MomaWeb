import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { experience_id, customer_name, customer_email, customer_phone, travel_date, guests_count, total_amount, currency } = body;

        if (!experience_id || !customer_name || !customer_email || !travel_date || !guests_count || !total_amount) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        const supabase = await createClient();

        // Workaround: Combine name and phone since column doesn't exist yet
        const nameWithPhone = customer_phone ? `${customer_name} | Tel: ${customer_phone}` : customer_name;

        const { data, error } = await supabase
            .from('bookings')
            .insert([
                {
                    experience_id,
                    customer_name: nameWithPhone, 
                    customer_email,
                    travel_date,
                    guests_count,
                    total_amount,
                    currency: currency || 'COP',
                    status: 'pending'
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating booking:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, booking: data });
    } catch (error: any) {
        console.error('Server error creating booking:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
