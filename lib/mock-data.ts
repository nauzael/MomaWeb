import { Experience } from '@/types/database';

export const MOCK_EXPERIENCES: Experience[] = [
    {
        id: '1',
        title: 'Amazonas Salvaje & Lujo',
        slug: 'amazonas-salvaje-lujo',
        description: 'Explora la selva amazónica con comfort. Avistamiento de delfines rosados, caminatas nocturnas y alojamiento en eco-lodge premium. Una experiencia inmersiva en el corazón del mundo.',
        price_cop: 2500000,
        price_usd: 650,
        location_name: 'Amazonas, Leticia',
        location_coords: { lat: -4.2153, lng: -69.9406 }, // Leticia approx
        includes: ['Alojamiento 4 noches', 'Alimentación completa', 'Guianza experta', 'Transporte fluvial'],
        excludes: ['Vuelos a Leticia', 'Gastos personales'],
        recommendations: 'Llevar ropa ligera, repelente y vacuna fiebre amarilla.',
        max_capacity: 8,
        image: 'https://images.unsplash.com/photo-1544979590-37e9b47cd705?q=80&w=2574&auto=format&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1544979590-37e9b47cd705?q=80&w=2574&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2568&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1523538415841-86088863f600?q=80&w=2574&auto=format&fit=crop'
        ],
        created_at: new Date().toISOString()
    },
    {
        id: '2',
        title: 'Desierto de la Tatacoa Estelar',
        slug: 'desierto-tatacoa-estelar',
        description: 'Bajo las estrellas en el desierto. Glamping de lujo, visita al observatorio astronómico y recorrido por el valle de los Xilópalos. Un paisaje surrealista.',
        price_cop: 1200000,
        price_usd: 300,
        location_name: 'Desierto de la Tatacoa, Huila',
        location_coords: { lat: 3.2359, lng: -75.1685 }, // Villavieja approx
        includes: ['Alojamiento 2 noches', 'Desayunos y Cenas', 'Telescopio privado'],
        excludes: ['Transporte a Neiva'],
        recommendations: 'Protector solar alto, cámara fotográfica.',
        max_capacity: 4,
        image: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?q=80&w=2570&auto=format&fit=crop',
        created_at: new Date().toISOString()
    },
    {
        id: '3',
        title: 'Ciudad Perdida Trek VIP',
        slug: 'ciudad-perdida-vip',
        description: 'El trekking más legendario de Sudamérica con servicios mejorados. Campamentos cómodos, porteadores para equipaje pesado y comida gourmet en la selva.',
        price_cop: 1800000,
        price_usd: 450,
        location_name: 'Ciudad Perdida, Sierra Nevada',
        location_coords: { lat: 11.0378, lng: -73.9264 }, // Sierra Nevada approx
        includes: ['Permisos indígenas', 'Guía bilingüe', 'Seguro médico', 'Alimentación e hidratación'],
        excludes: ['Propinas'],
        recommendations: 'Botas de trekking, buena condición física.',
        max_capacity: 10,
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2670&auto=format&fit=crop',
        created_at: new Date().toISOString()
    }
];
