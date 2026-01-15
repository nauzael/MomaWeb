'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-stone-100 animate-pulse rounded-xl" />
});

export default Map;
