import { MOCK_EXPERIENCES } from './mock-data';

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
