import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Experience } from '@/lib/experience-service';

// Función auxiliar para mapear los datos crudos de Supabase a tu tipo Experience
// (Basada en tu lógica actual en lib/experience-service.ts)
const mapRowToExperience = (row: any): Experience => {
    return {
        id: String(row?.id ?? ''),
        title: String(row?.title ?? ''),
        slug: String(row?.slug ?? ''),
        description: String(row?.description ?? ''),
        image: String(row?.image ?? ''),
        gallery: Array.isArray(row?.gallery) ? row.gallery : [],
        price_cop: Number(row?.price_cop) || 0,
        price_usd: Number(row?.price_usd) || 0,
        max_capacity: Number(row?.max_capacity) || 0,
        includes: Array.isArray(row?.includes) ? row.includes : [],
        excludes: Array.isArray(row?.excludes) ? row.excludes : [],
        location_name: row?.location_name,
        // Manejo básico de coordenadas si vienen planas o nulas
        location_coords: { 
            lat: Number(row?.location_lat) || 4.5709, 
            lng: Number(row?.location_lng) || -74.2973 
        },
        created_at: row?.created_at,
        updated_at: row?.updated_at
    };
};

export function useRealtimeExperiences(initialExperiences: Experience[] = []) {
    const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
    const supabase = createClient();

    // Actualizar estado inicial si cambia (ej: carga inicial desde servidor)
    useEffect(() => {
        setExperiences(initialExperiences);
    }, [initialExperiences]);

    useEffect(() => {
        const channel = supabase
            .channel('experiences-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*', // Escuchar INSERT, UPDATE y DELETE
                    schema: 'public',
                    table: 'experiences',
                },
                (payload) => {
                    console.log('Cambio en tiempo real recibido:', payload);

                    if (payload.eventType === 'INSERT') {
                        const newExperience = mapRowToExperience(payload.new);
                        setExperiences((prev) => [newExperience, ...prev]);
                    } 
                    else if (payload.eventType === 'UPDATE') {
                        const updatedExperience = mapRowToExperience(payload.new);
                        setExperiences((prev) =>
                            prev.map((exp) =>
                                exp.id === updatedExperience.id ? updatedExperience : exp
                            )
                        );
                    } 
                    else if (payload.eventType === 'DELETE') {
                        setExperiences((prev) =>
                            prev.filter((exp) => exp.id !== payload.old.id)
                        );
                    }
                }
            )
            .subscribe();

        // Cleanup: desuscribirse al desmontar
        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return experiences;
}
