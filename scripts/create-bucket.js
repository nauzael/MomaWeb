const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cqjanilpphtzxylcxeji.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxamFuaWxwcGh0enh5bGN4ZWppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQ4NDMzNSwiZXhwIjoyMDg0MDYwMzM1fQ.edJNW0JAa0Gwad-DVGRVfchz0o7eT2M6GOVxXvzKcbY';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function setup() {
    console.log('Checking storage buckets...');

    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('Error listing buckets:', listError);
        return;
    }

    const galleryBucket = buckets.find(b => b.name === 'gallery');

    if (galleryBucket) {
        console.log("Bucket 'gallery' already exists.");
    } else {
        console.log("Bucket 'gallery' not found. Creating...");
        const { data, error } = await supabase.storage.createBucket('gallery', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/jpg']
        });

        if (error) {
            console.error('Error creating bucket:', error);
        } else {
            console.log("Bucket 'gallery' created successfully!");
        }
    }
}

setup();
