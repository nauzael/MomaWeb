'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function VersionCheck() {
    const pathname = usePathname();
    const [currentVersion, setCurrentVersion] = useState<string | null>(null);

    useEffect(() => {
        const checkVersion = async () => {
            try {
                // Fetch the version.json with a cache buster timestamp
                const response = await fetch(`/version.json?v=${Date.now()}`, {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });

                if (!response.ok) return;

                const data = await response.json();
                const versionString = data.hash || data.timestamp?.toString();

                if (!versionString) return;

                // If we already have a version in memory and it's different, reload
                const storedVersion = localStorage.getItem('app_version');

                if (storedVersion && storedVersion !== versionString) {
                    console.log(`[VersionCheck] New version detected: ${versionString}. Reloading...`);
                    localStorage.setItem('app_version', versionString);
                    window.location.reload();
                } else {
                    localStorage.setItem('app_version', versionString);
                }
            } catch (error) {
                console.warn('[VersionCheck] Error checking version:', error);
            }
        };

        // Check on initial mount
        checkVersion();

        // Optional: Check every 5 minutes if the user stays on the page
        const interval = setInterval(checkVersion, 1000 * 60 * 5);
        return () => clearInterval(interval);
    }, [pathname]); // Also check when navigating to ensure the target page isn't stale

    return null; // This component doesn't render anything
}
