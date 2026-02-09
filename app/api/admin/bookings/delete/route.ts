import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'ID de reserva requerido' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Verificar autenticación
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Eliminar la reserva
        const { error: deleteError } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting booking:', deleteError);
            return NextResponse.json(
                { error: 'Error al eliminar la reserva' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Reserva eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error in delete booking API:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
