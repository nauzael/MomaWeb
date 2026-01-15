import { MOCK_EXPERIENCES } from './mock-data';
import { createClient as createSupabaseBrowserClient } from '@/utils/supabase/client';
import { mapSupabaseRowToExperience } from './experience-mapper';

export interface Experience {
    id: string;
    title: string;
    slug: string;
    description: string;
    image: string;
    gallery: string[];
    price_cop: number;
    price_usd: number;
    max_capacity: number;
    includes: string[];
    excludes: string[];
    location_name?: string;
    location_coords: { lat: number; lng: number };
    created_at?: string;
    updated_at?: string;
}

const STORAGE_KEY = 'moma_experiences';
const DELETED_KEY = 'moma_deleted_ids';

/**
 * Robustly parses localStorage JSON
 */
function getStorageItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const item = localStorage.getItem(key);
        if (!item) return defaultValue;
        return JSON.parse(item);
    } catch (e) {
        console.error(`Error parsing localStorage key "${key}":`, e);
        return defaultValue;
    }
}

function setStorageItem(key: string, value: unknown) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Error saving to localStorage key "${key}":`, e);
        if (e instanceof Error && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
            throw new Error('Almacenamiento lleno. Por favor elimina algunas experiencias o imágenes.');
        }
        throw e;
    }
}

/**
 * Gets all active experiences by merging mocks and local storage,
 * and filtering out those in the deleted list.
 */
export function getAllExperiences(): Experience[] {
    const deletedArray = getStorageItem<string[]>(DELETED_KEY, []);
    const deletedIds = new Set(deletedArray.map(id => String(id).trim()));

    const savedArray = getStorageItem<Experience[]>(STORAGE_KEY, []);
    const savedById: Record<string, Experience> = {};

    savedArray.forEach(item => {
        if (item && item.id) {
            const cleanId = String(item.id).trim();
            savedById[cleanId] = item;
        }
    });

    const result: Experience[] = [];

    // 1. Process Mocks
    MOCK_EXPERIENCES.forEach(mock => {
        const mockId = String(mock.id).trim();

        // Skip if explicitly deleted
        if (deletedIds.has(mockId)) return;

        // Use saved override if available, else mock
        if (savedById[mockId]) {
            result.push(savedById[mockId]);
            delete savedById[mockId];
        } else {
            result.push(mock as unknown as Experience);
        }
    });

    // 2. Add remaining saved (customs)
    Object.values(savedById).forEach(exp => {
        const expId = String(exp.id).trim();
        if (exp && expId && !deletedIds.has(expId)) {
            result.push(exp);
        }
    });

    return result;
}

/**
 * Finds a single experience by ID or Slug
 */
export function getExperience(identifier: string): Experience | null {
    const all = getAllExperiences();
    const cleanId = identifier.trim();

    return all.find(e =>
        String(e.id).trim() === cleanId ||
        e.slug === cleanId
    ) || null;
}

/**
 * Deletes an experience permanently (via exclusion list)
 */
export function deleteExperience(id: string | number) {
    const idStr = String(id).trim();

    // 1. Add to deleted list
    const deletedArray = getStorageItem<string[]>(DELETED_KEY, []);
    const deletedSet = new Set(deletedArray.map(i => String(i).trim()));
    deletedSet.add(idStr);
    setStorageItem(DELETED_KEY, Array.from(deletedSet));

    // 2. Cleanup from custom list if it was there
    const saved = getStorageItem<Experience[]>(STORAGE_KEY, []);
    const filtered = saved.filter(s => s && String(s.id).trim() !== idStr);
    setStorageItem(STORAGE_KEY, filtered);
}

/**
 * Saves or updates an experience
 */
export function saveExperience(data: Partial<Experience> & { id?: string | number }) {
    const saved = getStorageItem<Experience[]>(STORAGE_KEY, []);
    const idToSave = data.id ? String(data.id).trim() : Math.random().toString(36).substr(2, 9);

    const experienceToSave = {
        ...data,
        id: idToSave,
        updated_at: new Date().toISOString()
    };

    const index = saved.findIndex(s => s && String(s.id).trim() === idToSave);

    if (index !== -1) {
        saved[index] = { ...saved[index], ...experienceToSave } as Experience;
    } else {
        experienceToSave.created_at = experienceToSave.created_at || new Date().toISOString();
        saved.push(experienceToSave as Experience);
    }

    setStorageItem(STORAGE_KEY, saved);

    // CRITICAL: If we are saving an experience that was in the deleted list, remove it from there
    const deleted = getStorageItem<string[]>(DELETED_KEY, []);
    const filteredDeleted = deleted.filter(id => String(id).trim() !== idToSave);
    if (filteredDeleted.length !== deleted.length) {
        setStorageItem(DELETED_KEY, filteredDeleted);
    }

    return experienceToSave;
}

/**
 * Resets the entire local database
 */
export function resetExperiences() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DELETED_KEY);
}

export function isSupabaseConfigured() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anonKey) return false
    if (url === 'https://example.com') return false
    if (anonKey === 'mock-key') return false
    return true
}

export async function getConnectionStatus(): Promise<{ connected: boolean, mode: 'supabase' | 'local', message: string }> {
    const configured = isSupabaseConfigured();
    if (!configured) {
        return { 
            connected: false, 
            mode: 'local', 
            message: 'Modo Local (Sin conexión a base de datos)' 
        };
    }

    try {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase.from('experiences').select('count', { count: 'exact', head: true });
        
        if (error) {
            return { 
                connected: false, 
                mode: 'local', 
                message: `Error de conexión: ${error.message}` 
            };
        }

        return { 
            connected: true, 
            mode: 'supabase', 
            message: 'Sincronizado con Supabase' 
        };
    } catch (e) {
        return { 
            connected: false, 
            mode: 'local', 
            message: 'Error inesperado de conexión' 
        };
    }
}

// Separate client-side fetch logic
async function fetchAllExperiencesFromSupabaseClient(): Promise<Experience[]> {
    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Supabase fetch error:', error)
        throw new Error(error.message)
    }
    if (!Array.isArray(data)) return []
    return data.map(mapSupabaseRowToExperience)
}

async function fetchExperienceFromSupabaseClient(identifier: string): Promise<Experience | null> {
    const supabase = createSupabaseBrowserClient()
    const clean = identifier.trim()

    const bySlug = await supabase.from('experiences').select('*').eq('slug', clean).maybeSingle()
    if (bySlug.error) console.error('Supabase slug error:', bySlug.error)
    if (bySlug.data) return mapSupabaseRowToExperience(bySlug.data)

    const byId = await supabase.from('experiences').select('*').eq('id', clean).maybeSingle()
    if (byId.error) console.error('Supabase id error:', byId.error)
    if (byId.data) return mapSupabaseRowToExperience(byId.data)

    return null
}

export async function getAllExperiencesPersisted(): Promise<Experience[]> {
    const isServer = typeof window === 'undefined'

    if (isSupabaseConfigured()) {
        try {
            // Use different functions based on environment
            if (isServer) {
                // If this is called on the server, we can't use dynamic imports of server modules here
                // because this file is imported by client components.
                // Instead, we return empty or fallback. Server components should use lib/experience-service-server.ts
                console.warn('SERVER WARNING: getAllExperiencesPersisted called on server from client-safe module. Returning empty.')
                return []
            } else {
                return await fetchAllExperiencesFromSupabaseClient()
            }
        } catch (error) {
            console.error('Failed to fetch from Supabase:', error)
            return []
        }
    }

    // Fallback only if Supabase is NOT configured (which shouldn't happen in this flow)
    try {
        return getAllExperiences();
    } catch (e) {
        console.error('Error reading local experiences:', e);
        return [];
    }
}

export async function getExperiencePersisted(identifier: string): Promise<Experience | null> {
    const isServer = typeof window === 'undefined'

    if (isSupabaseConfigured()) {
        try {
            if (isServer) {
                 // See warning above
                 console.warn('SERVER WARNING: getExperiencePersisted called on server from client-safe module.')
                 return null
            } else {
                return await fetchExperienceFromSupabaseClient(identifier)
            }
        } catch {
            return null
        }
    }

    return getExperience(identifier)
}

export async function saveExperiencePersisted(data: Partial<Experience> & { id?: string | number }) {
    if (isSupabaseConfigured()) {
        const res = await fetch('/api/admin/experiences/upsert', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ experience: data })
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err?.error || 'Error al guardar en Supabase')
        }

        const json = await res.json()
        if (json?.experience) return mapSupabaseRowToExperience(json.experience)
    }

    return saveExperience(data)
}

export async function deleteExperiencePersisted(slugOrId: string) {
    if (isSupabaseConfigured()) {
        const res = await fetch('/api/admin/experiences/delete', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ slug: slugOrId })
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err?.error || 'Error al eliminar en Supabase')
        }

        return
    }

    deleteExperience(slugOrId)
}

export async function migrateLocalExperiencesToSupabase() {
    const experiences = getAllExperiences()

    const res = await fetch('/api/admin/experiences/migrate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ experiences })
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Error al migrar a Supabase')
    }

    const json = await res.json()
    return { count: Number(json?.count) || 0 }
}
