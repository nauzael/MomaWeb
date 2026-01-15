import { useEffect, useState } from 'react';
import { Experience, getAllExperiencesPersisted } from '@/lib/experience-service';

export function usePollingExperiences(initialExperiences: Experience[] = [], intervalMs: number = 5000) {
    const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);

    // Initial load and sync with props
    useEffect(() => {
        setExperiences(initialExperiences);
    }, [initialExperiences]);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const data = await getAllExperiencesPersisted();
                if (isMounted) {
                    // Simple equality check could be added here to avoid re-renders
                    // but for now we just update to ensure freshness
                    setExperiences(data);
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        };

        // 1. Initial fetch on mount (in case initialData is stale)
        fetchData();

        // 2. Poll interval
        const intervalId = setInterval(fetchData, intervalMs);

        // 3. Focus listener (fetch immediately when user returns to tab)
        const handleFocus = () => fetchData();
        const handleVisibilityChange = () => {
            if (!document.hidden) fetchData();
        };

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [intervalMs]);

    return { experiences, refresh: () => {
        // Trigger manual refresh
        getAllExperiencesPersisted()
            .then((data) => {
                if (Array.isArray(data)) {
                    setExperiences(data);
                } else {
                    setExperiences([]);
                }
            })
            .catch(() => setExperiences([]));
    }};
}
