export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Evitar duplicar el prefijo /api si ya viene en el endpoint
    const cleanEndpoint = endpoint.startsWith(API_BASE_URL)
        ? endpoint.substring(API_BASE_URL.length)
        : endpoint;

    const sessionId = typeof window !== 'undefined' ? localStorage.getItem('php_session_id') : null;

    // Añadir session_id a la URL como fallback (útil para evitar bloqueos de headers en algunos servidores)
    let finalEndpoint = cleanEndpoint;
    if (sessionId) {
        const separator = finalEndpoint.includes('?') ? '&' : '?';
        finalEndpoint += `${separator}php_session_id=${sessionId}`;
    }

    const url = finalEndpoint.startsWith('http')
        ? finalEndpoint
        : `${API_BASE_URL}${finalEndpoint.startsWith('/') ? finalEndpoint : '/' + finalEndpoint}`;

    // Añadir timeout de 60 segundos
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 60000);

    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
        ...((options.headers as Record<string, string>) || {}),
    };

    if (sessionId) {
        headers['X-Session-ID'] = sessionId;
    }

    if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }



    const config: RequestInit = {
        ...options,
        headers,
        credentials: 'include',
        signal: controller.signal,
        cache: 'no-store' // Ensure we never serve stale data for admin/dynamic content
    };


    try {
        const response = await fetch(url, config);
        clearTimeout(id);

        if (response.status === 204) {
            return {} as T;
        }

        // Leer el cuerpo una sola vez como texto
        const text = await response.text();

        if (!response.ok) {
            let errorMessage = `Error HTTP ${response.status}`;
            try {
                const errorData = JSON.parse(text);
                if (errorData && errorData.error) {
                    errorMessage = errorData.error;
                }
            } catch (e) {
                // Si no es JSON, verificar si es código PHP
                if (text.includes('<?php')) {
                    errorMessage = "Error: El servidor devolvió código PHP. ¿Está el backend PHP configurado?";
                } else if (text) {
                    errorMessage = text.substring(0, 100);
                }
            }
            throw new Error(errorMessage);
        }

        try {
            const data = JSON.parse(text);
            // Si la respuesta trae un session_id (ej: despues del login), guardarlo
            if (data && data.session_id && typeof window !== 'undefined') {
                localStorage.setItem('php_session_id', data.session_id);
            }
            return data;
        } catch (e) {

            console.error("Error al parsear JSON:", text.substring(0, 100));
            if (text.includes('<?php')) {
                throw new Error("El servidor devolvió el archivo PHP en lugar de ejecutarlo.");
            }
            throw new Error("La respuesta del servidor no es un JSON válido.");
        }
    } catch (error: any) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error("Tiempo de espera agotado. El servidor tardó demasiado en responder.");
        }
        throw error;
    }
}

/**
 * Convierte una URL relativa del backend en una URL absoluta funcional.
 */
export function getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;

    // Si es una ruta que contiene 'uploads', construir la URL completa
    if (url.includes('uploads')) {
        let cleanUrl = url.startsWith('/') ? url : '/' + url;

        // Extraer el dominio base eliminando el sufijo /api del final si existe
        const baseUrl = API_BASE_URL.endsWith('/api')
            ? API_BASE_URL.substring(0, API_BASE_URL.length - 4)
            : API_BASE_URL;

        // Si baseUrl es solo '/api' o similar, y no tiene http, devolver url original si estamos en el mismo host
        if (!baseUrl.startsWith('http') && typeof window !== 'undefined' && !API_BASE_URL.startsWith('http')) {
            return cleanUrl;
        }

        // Asegurarse de no tener doble slash entre baseUrl y cleanUrl
        const finalBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        return `${finalBase}${cleanUrl}`;
    }

    return url;
}
