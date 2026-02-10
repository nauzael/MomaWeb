
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkGallery() {
    console.log('Checking gallery_images table...');
    const { data: images, error } = await supabase.from('gallery_images').select('*');

    if (error) {
        console.error('Error fetching images:', error);
    } else {
        console.log(`Found ${images.length} images in database:`);
        images.forEach(img => console.log(`- ID: ${img.id}, URL: ${img.url}`));
    }

    console.log('\nChecking storage bucket content...');
    const { data: files, error: storageError } = await supabase.storage.from('gallery').list();

    if (storageError) {
        console.error('Error listing storage files:', storageError);
    } else {
        console.log(`Found ${files.length} files in 'gallery' bucket:`);
        files.forEach(f => console.log(`- ${f.name}`));
    }
}

checkGallery();
