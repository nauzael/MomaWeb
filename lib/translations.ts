export type Language = 'es' | 'en';

export const translations = {
    es: {
        nav: {
            experiences: 'Experiencias',
            about: 'Nosotros',
            blog: 'Blog',
            contact: 'Contacto',
            agency: 'Agencia',
            logoAria: 'Moma Excursiones - Inicio',
            logoAlt: 'Logo Moma Excursiones',
            openMenu: 'Abrir menú principal',
            closeMenu: 'Cerrar menú principal',
            englishLabel: 'English (EN)',
            spanishLabel: 'Español (ES)',
            allExperiences: 'Todas las Experiencias',
            allExperiencesDesc: 'Explora nuestra colección completa de aventuras y conexiones con la naturaleza.',
            discoverBadge: 'Descubre',
            blogRelatos: 'Expediciones en Blanco y Negro',
            blogSubtitle: 'Relatos y Aventuras',
            blogDesc: 'Explora los tesoros escondidos de Sucre y más allá. Historias de viaje, guías locales y la magia de lo desconocido.',
            blogAll: 'Todos',
            blogFeatured: 'Destacado',
            blogStoryNotWritten: 'Esta historia aún no ha sido escrita...',
            blogBack: 'Volver al Blog',
            blogMetaShare: 'Compartir:',
            blogMetaNext: 'Siguiente lectura',
            blogMetaRelated: 'Historias relacionadas'
        },
        hero: {
            title: 'Expediciones en Blanco y Negro',
            subtitle: 'Relatos y Aventuras',
            description: 'Explora los tesoros escondidos de Sucre y más allá. Historias de viaje, guías locales y la magia de lo desconocido.',
            viewExperience: 'Ver Experiencia',
            prev: 'Anterior',
            next: 'Siguiente',
            slideAria: 'Ir a la diapositiva'
        },
        destinations: {
            subtitle: 'Lugares para ir',
            title: 'Un destino perfecto',
            description: '¡Descubre el mundo a tu manera! Te invitamos a embarcarte en una emocionante aventura a través de nuestras rutas turísticas.'
        },
        whyChooseUs: {
            subtitle: 'Una elección brillante',
            title: '¿Por qué elegirnos?',
            description: 'Compartimos una pasión por el detalle, la sostenibilidad y la conexión auténtica con cada territorio que exploramos.',
            features: [
                { title: 'Autenticidad y Cultura', desc: 'Compromiso con el turismo sostenible y el desarrollo de comunidades locales.' },
                { title: 'Conservación', desc: 'Protección activa del patrimonio natural y biodiversidad de la región.' },
                { title: 'Experiencias Únicas', desc: 'Rutas exclusivas fuera de los caminos convencionales para viajeros audaces.' },
                { title: 'Apoyo Local', desc: 'Generación de oportunidades para el talento y proveedores de Sucre.' }
            ]
        },
        cta: {
            subtitle: 'Ideas que transforman',
            title: 'Únete a nuestra aventura y deja huellas positivas',
            button: 'Empezar la Aventura'
        },
        gallery: {
            title: 'Naturaleza Indómita',
            imageAlt: 'Imagen de la galería',
            viewAlt: 'Vista de la galería'
        },
        blog: {
            title: 'Relatos del Desconocido',
            subtitle: 'Historias de Expedición',
            viewAll: 'Ver todo el Blog',
            readMore: 'Leer Historia',
            noPosts: 'Nuevas historias están en camino...'
        },
        contact: {
            subtitle: 'Ponte en contacto',
            title: 'Envíanos un mensaje',
            location: 'Ubicación',
            whatsapp: 'Whatsapp',
            email: 'Email',
            form: {
                name: 'Nombre',
                email: 'Email',
                message: 'Mensaje',
                namePlaceholder: 'Tu nombre',
                emailPlaceholder: 'tucorreo@email.com',
                messagePlaceholder: 'Cuéntanos tus planes...',
                send: 'Enviar Mensaje'
            }
        },
        experienceDetail: {
            maxTravelers: 'Máximo {count} viajeros',
            tabs: {
                description: 'Descripción',
                itinerary: 'Itinerario',
                reviews: 'Reseñas'
            },
            aboutTitle: 'Sobre esta experiencia',
            includes: 'Incluye',
            excludes: 'No Incluye',
            recommendations: 'Recomendaciones',
            locationTitle: 'Ubicación de la aventura',
            meetingPoint: 'Punto de encuentro',
            meetingPointCoord: 'Se coordinará directamente con el guía tras la reserva.',
            itineraryTitle: 'Plan de Aventura',
            itineraryFallback: 'El itinerario detallado estará disponible próximamente.',
            reviewsFallback: 'Sé el primero en dejar una reseña para esta experiencia.',
            viewDetailsAria: 'Ver detalles de {title}',
            experienceNotFound: 'Experiencia no encontrada',
            experienceNotFoundDesc: 'La experiencia que buscas no existe o ha sido eliminada.',
            imageAlt: '{title} - Imagen {index}',
            dotAria: 'Ir a imagen {index}'
        },
        booking: {
            pricePerPerson: 'Precio por persona',
            approx: 'Aprox.',
            travelDateLabel: 'Fecha de Viaje',
            selectDate: 'Seleccionar fecha',
            availability: 'Disponibilidad',
            free: 'Libre',
            busy: 'Ocupado',
            guest: 'Viajero',
            guests: 'Viajeros',
            totalEstimated: 'Total estimado',
            reserveButton: 'Reservar Ahora',
            noChargeNote: 'No se cobrará nada todavía.',
            confirmTitle: 'Confirma tu Reserva',
            confirmSubtitle: 'Revisa los detalles antes de continuar.',
            experience: 'Experiencia',
            date: 'Fecha',
            travelers: 'Pasajeros',
            contactData: 'Datos de contacto',
            fullNameTitle: 'Nombre completo',
            emailTitle: 'Correo',
            phoneTitle: 'Teléfono',
            fullNamePlaceholder: 'Tu nombre',
            emailPlaceholder: 'tucorreo@ejemplo.com',
            phonePlaceholder: '+57 300...',
            totalToPay: 'Total a Pagar',
            cancel: 'Cancelar',
            acceptAndPay: 'Aceptar y Pagar',
            successTitle: '¡Gracias por tu compra!',
            successSubtitle: 'Tu reserva ha sido confirmada exitosamente. Hemos enviado los detalles a tu correo.',
            summaryTitle: 'Resumen de la Reserva',
            reference: 'Referencia',
            totalPaid: 'Total Pagado',
            closeButton: 'Entendido, gracias',
            dateError: 'Por favor selecciona una fecha para tu viaje.',
            formError: 'Por favor completa tu nombre, correo y teléfono.',
            availabilityCalendar: 'Calendario de disponibilidad',
            decreaseGuests: 'Disminuir número de viajeros',
            increaseGuests: 'Aumentar número de viajeros'
        },
        footer: {
            description: 'Excursiones Montes de María es una iniciativa que busca mostrar el majestuoso aporte visual y cultural de nuestra región a través del turismo sostenible.',
            navTitle: 'Navegación',
            infoTitle: 'Información',
            home: 'Inicio',
            about: 'Quienes somos',
            privacy: 'Política de privacidad',
            terms: 'Términos de servicio',
            sustainability: 'Sostenibilidad',
            certified: 'Experiencia Certificada',
            allRightsReserved: 'Todos los derechos reservados.'
        }
    },
    en: {
        nav: {
            experiences: 'Experiences',
            about: 'About Us',
            blog: 'Blog',
            contact: 'Contact',
            agency: 'Agency',
            logoAria: 'Moma Excursiones - Home',
            logoAlt: 'Moma Excursiones Logo',
            openMenu: 'Open main menu',
            closeMenu: 'Close main menu',
            englishLabel: 'English (EN)',
            spanishLabel: 'Spanish (ES)',
            allExperiences: 'All Experiences',
            allExperiencesDesc: 'Explore our complete collection of adventures and connections with nature.',
            discoverBadge: 'Discover',
            blogRelatos: 'Expeditions in Black and White',
            blogSubtitle: 'Stories and Adventures',
            blogDesc: 'Explore the hidden treasures of Sucre and beyond. Travel stories, local guides, and the magic of the unknown.',
            blogAll: 'All',
            blogFeatured: 'Featured',
            blogStoryNotWritten: 'This story has not been written yet...',
            blogBack: 'Back to Blog',
            blogMetaShare: 'Share:',
            blogMetaNext: 'Next reading',
            blogMetaRelated: 'Related Stories'
        },
        hero: {
            title: 'Black and White Expeditions',
            subtitle: 'Stories and Adventures',
            description: 'Explore the hidden treasures of Sucre and beyond. Travel stories, local guides, and the magic of the unknown.',
            viewExperience: 'View Experience',
            prev: 'Previous',
            next: 'Next',
            slideAria: 'Go to slide'
        },
        destinations: {
            subtitle: 'Places to Go',
            title: 'A Perfect Destination',
            description: 'Discover the world your way! We invite you to embark on an exciting adventure through our tourist routes.'
        },
        whyChooseUs: {
            subtitle: 'A Brilliant Choice',
            title: 'Why Choose Us?',
            description: 'We share a passion for detail, sustainability, and authentic connection with every territory we explore.',
            features: [
                { title: 'Authenticity & Culture', desc: 'Commitment to sustainable tourism and the development of local communities.' },
                { title: 'Conservation', desc: 'Active protection of the natural heritage and biodiversity of the region.' },
                { title: 'Unique Experiences', desc: 'Exclusive routes off the conventional paths for bold travelers.' },
                { title: 'Local Support', desc: 'Creating opportunities for talent and providers in Sucre.' }
            ]
        },
        cta: {
            subtitle: 'Ideas that Transform',
            title: 'Join our adventure and leave positive tracks',
            button: 'Start the Adventure'
        },
        gallery: {
            title: 'Untamed Nature',
            imageAlt: 'Gallery image',
            viewAlt: 'Gallery view'
        },
        blog: {
            title: 'Stories of the Unknown',
            subtitle: 'Expedition Tales',
            viewAll: 'View All Blog',
            readMore: 'Read Story',
            noPosts: 'New stories are on the way...'
        },
        contact: {
            subtitle: 'Get in Touch',
            title: 'Send us a Message',
            location: 'Location',
            whatsapp: 'Whatsapp',
            email: 'Email',
            form: {
                name: 'Name',
                email: 'Email',
                message: 'Message',
                namePlaceholder: 'Your name',
                emailPlaceholder: 'your@email.com',
                messagePlaceholder: 'Tell us your plans...',
                send: 'Send Message'
            }
        },
        experienceDetail: {
            maxTravelers: 'Maximum {count} travelers',
            tabs: {
                description: 'Description',
                itinerary: 'Itinerary',
                reviews: 'Reviews'
            },
            aboutTitle: 'About this experience',
            includes: 'Includes',
            excludes: 'Not Included',
            recommendations: 'Recommendations',
            locationTitle: 'Adventure Location',
            meetingPoint: 'Meeting Point',
            meetingPointCoord: 'Will be coordinated directly with the guide after booking.',
            itineraryTitle: 'Adventure Plan',
            itineraryFallback: 'Detailed itinerary will be available soon.',
            reviewsFallback: 'Be the first to leave a review for this experience.',
            viewDetailsAria: 'View details for {title}',
            experienceNotFound: 'Experience not found',
            experienceNotFoundDesc: 'The experience you are looking for does not exist or has been removed.',
            imageAlt: '{title} - Image {index}',
            dotAria: 'Go to image {index}'
        },
        booking: {
            pricePerPerson: 'Price per person',
            approx: 'Approx.',
            travelDateLabel: 'Travel Date',
            selectDate: 'Select date',
            availability: 'Availability',
            free: 'Available',
            busy: 'Full',
            guest: 'Traveler',
            guests: 'Travelers',
            totalEstimated: 'Estimated Total',
            reserveButton: 'Book Now',
            noChargeNote: 'No payment will be taken yet.',
            confirmTitle: 'Confirm your Booking',
            confirmSubtitle: 'Review the details before continuing.',
            experience: 'Experience',
            date: 'Date',
            travelers: 'Travelers',
            contactData: 'Contact Details',
            fullNameTitle: 'Full Name',
            emailTitle: 'Email',
            phoneTitle: 'Phone',
            fullNamePlaceholder: 'Your name',
            emailPlaceholder: 'your@email.com',
            phonePlaceholder: '+57 300...',
            totalToPay: 'Total to Pay',
            cancel: 'Cancel',
            acceptAndPay: 'Accept and Pay',
            successTitle: 'Thanks for your purchase!',
            successSubtitle: 'Your booking has been successfully confirmed. We have sent the details to your email.',
            summaryTitle: 'Booking Summary',
            reference: 'Reference',
            totalPaid: 'Total Paid',
            closeButton: 'Got it, thanks',
            dateError: 'Please select a date for your trip.',
            formError: 'Please complete your name, email and phone.',
            availabilityCalendar: 'Availability calendar',
            decreaseGuests: 'Decrease number of travelers',
            increaseGuests: 'Increase number of travelers'
        },
        footer: {
            description: 'Montes de María Excursions is an initiative that seeks to show the majestic visual and cultural contribution of our region through sustainable tourism.',
            navTitle: 'Navigation',
            infoTitle: 'Information',
            home: 'Home',
            about: 'About Us',
            privacy: 'Privacy Policy',
            terms: 'Terms of Service',
            sustainability: 'Sustainability',
            certified: 'Certified Experience',
            certified: 'Certified Experience',
            allRightsReserved: 'All rights reserved.'
        }
    }
};
