export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

let csrfToken: string | null = null;
let isAuthenticated = false;

export function setAuthenticated(auth: boolean): void {
    isAuthenticated = auth;
    if (!auth) {
        csrfToken = null;
    }
}

export function setCsrfToken(token: string): void {
    csrfToken = token;
}

export function clearCsrfToken(): void {
    csrfToken = null;
}

async function getCsrfToken(): Promise<string> {
    if (csrfToken) return csrfToken;
    
    // Only fetch CSRF token if we have an authenticated session
    if (!isAuthenticated) return '';
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/csrf_token.php`, {
            credentials: 'include'
        });
        const data = await response.json();
        csrfToken = data.csrf_token;
        return csrfToken || '';
    } catch {
        return '';
    }
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const cleanEndpoint = endpoint.startsWith(API_BASE_URL)
        ? endpoint.substring(API_BASE_URL.length)
        : endpoint;

    const url = cleanEndpoint.startsWith('http')
        ? cleanEndpoint
        : `${API_BASE_URL}${cleanEndpoint.startsWith('/') ? cleanEndpoint : '/' + cleanEndpoint}`;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 60000);

    const isFormData = options.body instanceof FormData;
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || '');

    const headers: Record<string, string> = {
        ...((options.headers as Record<string, string>) || {}),
    };

    if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    // Agregar token CSRF solo en mutaciones autenticadas
    if (isMutation && !endpoint.includes('/auth/login') && isAuthenticated) {
        const token = await getCsrfToken();
        if (token) {
            headers['X-CSRF-Token'] = token;
        }
    }

    const config: RequestInit = {
        ...options,
        headers,
        credentials: 'include',
        signal: controller.signal,
        cache: 'no-store'
    };

    try {
        const response = await fetch(url, config);
        clearTimeout(id);

        if (response.status === 204) {
            return {} as T;
        }

        const text = await response.text();

        if (!response.ok) {
            let errorMessage = `Error HTTP ${response.status}`;
            try {
                const errorData = JSON.parse(text);
                if (errorData && errorData.error) {
                    errorMessage = errorData.error;
                }
            } catch {
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
            return data;
        } catch {
            console.error("Error al parsear JSON:", text.substring(0, 100));
            if (text.includes('<?php')) {
                throw new Error("El servidor devolvió el archivo PHP en lugar de ejecutarlo.");
            }
            throw new Error("La respuesta del servidor no es un JSON válido.");
        }
    } catch (error) {
        clearTimeout(id);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error("Tiempo de espera agotado. El servidor tardó demasiado en responder.");
        }
        throw error;
    }
}

export function getImageUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;

    if (url.includes('uploads')) {
        let cleanUrl = url.startsWith('/') ? url : '/' + url;

        const baseUrl = API_BASE_URL.endsWith('/api')
            ? API_BASE_URL.substring(0, API_BASE_URL.length - 4)
            : API_BASE_URL;

        if (!baseUrl.startsWith('http') && typeof window !== 'undefined' && !API_BASE_URL.startsWith('http')) {
            return cleanUrl;
        }

        const finalBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        return `${finalBase}${cleanUrl}`;
    }

    return url;
}
