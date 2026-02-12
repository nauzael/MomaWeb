import { fetchApi } from './api-client';
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
    itinerary?: { title: string; description: string }[];
    location_name?: string;
    location_coords: { lat: number; lng: number };
    duration?: string;
    recommendations?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Gets all active experiences from the PHP API
 */
export async function getAllExperiencesPersisted(): Promise<Experience[]> {
    try {
        const data = await fetchApi<Experience[]>('experiences/index.php');
        return data;
    } catch (error) {
        console.error('Failed to load experiences from API:', error);
        // Do NOT fallback to mock data if API fails. We want to see if DB is empty or broken.
        // Returning empty array so UI shows "No experiences found" instead of phantom data.
        return [];
    }
}

/**
 * Finds a single experience by ID or Slug from the PHP API
 */
export async function getExperiencePersisted(identifier: string): Promise<Experience | null> {
    try {
        const data = await fetchApi<Experience>(`experiences/single.php?slug=${encodeURIComponent(identifier)}`);
        return data;
    } catch (error) {
        console.error(`Failed to load experience ${identifier} from API:`, error);
        // Do NOT fallback to mock
        return null;
    }
}

/**
 * Saves or updates an experience via PHP API (Admin only)
 */
export async function saveExperiencePersisted(data: Partial<Experience> & { id?: string | number }) {
    try {
        const response = await fetchApi<{ experience: Experience }>('admin/experiences/upsert.php', {
            method: 'POST',
            body: JSON.stringify({ experience: data })
        });
        return response.experience;
    } catch (error) {
        console.error('Failed to save experience:', error);
        throw error;
    }
}

/**
 * Deletes an experience via PHP API (Admin only)
 */
export async function deleteExperiencePersisted(slugOrId: string) {
    try {
        await fetchApi('admin/experiences/delete.php', {
            method: 'POST',
            body: JSON.stringify({ slug: slugOrId })
        });
    } catch (error) {
        console.error('Failed to delete experience:', error);
        throw error;
    }
}
