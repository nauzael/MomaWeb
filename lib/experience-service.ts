import { MOCK_EXPERIENCES } from './mock-data';
import { createClient as createSupabaseBrowserClient } from '@/utils/supabase/client';

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

function isSupabaseConfigured() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anonKey) return false
    if (url === 'https://example.com') return false
    if (anonKey === 'mock-key') return false
    return true
}

function toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return []
    return value.map(v => String(v)).filter(v => v.trim().length > 0)
}

function mapSupabaseRowToExperience(row: any): Experience {
    const locationLat = Number(row?.location_lat)
    const locationLng = Number(row?.location_lng)
    const hasCoords = Number.isFinite(locationLat) && Number.isFinite(locationLng)

    return {
        id: String(row?.id ?? ''),
        title: String(row?.title ?? ''),
        slug: String(row?.slug ?? ''),
        description: String(row?.description ?? ''),
        image: String(row?.image ?? ''),
        gallery: toStringArray(row?.gallery),
        price_cop: Number(row?.price_cop) || 0,
        price_usd: Number(row?.price_usd) || 0,
        max_capacity: Number(row?.max_capacity) || 0,
        includes: toStringArray(row?.includes),
        excludes: toStringArray(row?.excludes),
        location_name: row?.location_name ? String(row.location_name) : undefined,
        location_coords: hasCoords ? { lat: locationLat, lng: locationLng } : { lat: 4.5709, lng: -74.2973 },
        created_at: row?.created_at ? String(row.created_at) : undefined,
        updated_at: row?.updated_at ? String(row.updated_at) : undefined
    }
}

async function fetchAllExperiencesFromSupabase(): Promise<Experience[]> {
    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    if (!Array.isArray(data)) return []
    return data.map(mapSupabaseRowToExperience)
}

async function fetchExperienceFromSupabase(identifier: string): Promise<Experience | null> {
    const supabase = createSupabaseBrowserClient()
    const clean = identifier.trim()

    const bySlug = await supabase.from('experiences').select('*').eq('slug', clean).maybeSingle()
    if (bySlug.error) throw new Error(bySlug.error.message)
    if (bySlug.data) return mapSupabaseRowToExperience(bySlug.data)

    const byId = await supabase.from('experiences').select('*').eq('id', clean).maybeSingle()
    if (byId.error) throw new Error(byId.error.message)
    if (byId.data) return mapSupabaseRowToExperience(byId.data)

    return null
}

export async function getAllExperiencesPersisted(): Promise<Experience[]> {
    if (typeof window === 'undefined') return MOCK_EXPERIENCES as unknown as Experience[]

    if (isSupabaseConfigured()) {
        try {
            const remote = await fetchAllExperiencesFromSupabase()
            if (remote.length > 0) return remote
        } catch {
        }
    }

    return getAllExperiences()
}

export async function getExperiencePersisted(identifier: string): Promise<Experience | null> {
    if (typeof window === 'undefined') return null

    if (isSupabaseConfigured()) {
        try {
            const remote = await fetchExperienceFromSupabase(identifier)
            if (remote) return remote
        } catch {
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
