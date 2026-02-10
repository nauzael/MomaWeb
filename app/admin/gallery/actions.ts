'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function getGalleryImages() {
    const supabase = await createClient()

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminSupabase = serviceRoleKey
        ? createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })
        : supabase;

    const { data, error } = await adminSupabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching gallery images:', error)
        return []
    }

    return data
}

export async function uploadGalleryImages(formData: FormData) {
    const results = [];
    console.log("Starting upload. Service Role Key present:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    try {
        const supabase = await createClient()

        const files = formData.getAll('files') as File[]
        if (!files || files.length === 0) {
            return { error: 'No files uploaded' }
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            console.error("Auth Error:", authError);
            return { error: 'Unauthorized: User not found' }
        }

        // FAILSAFE: Allow hardcoded admin emails
        if (user.email === 'admin@momaturismo.com' || user.email === 'admin@moma.com') {
            // authorized
        } else {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
                return { error: 'Unauthorized: Admin access required' }
            }
        }

        // Create admin client for storage operations to bypass RLS
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const adminSupabase = serviceRoleKey
            ? createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
                auth: { autoRefreshToken: false, persistSession: false }
            })
            : supabase;

        // Verify bucket exists with admin client
        const { data: buckets, error: bucketError } = await adminSupabase.storage.listBuckets();
        if (bucketError) {
            console.error("Bucket List Error:", bucketError);
            return { error: `Failed to list buckets: ${bucketError.message}` };
        }

        const galleryBucket = buckets?.find(b => b.name === 'gallery');

        if (!galleryBucket) {
            console.log("Bucket 'gallery' not found (creating with admin privs)...");
            const { error: createError } = await adminSupabase.storage.createBucket('gallery', {
                public: true,
                fileSizeLimit: 10485760,
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/jpg']
            });
            if (createError) console.error("Create bucket error:", createError);
        }

        for (const file of files) {
            // Sanitize filename to avoid weird characters
            const fileExt = file.name.split('.').pop()
            const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toLowerCase()
            const fileName = `${Date.now()}-${cleanName}-gallery_${Math.random().toString(36).substring(7)}.${fileExt}`

            // Upload to storage using admin client
            const { error: uploadError } = await adminSupabase
                .storage
                .from('gallery')
                .upload(fileName, file)

            if (uploadError) {
                console.error(`Error uploading image ${file.name}:`, uploadError)
                results.push({ file: file.name, status: 'failed', error: uploadError.message })
                continue
            }

            // Get public URL
            const { data: { publicUrl } } = supabase
                .storage
                .from('gallery')
                .getPublicUrl(fileName)

            // Insert into database using admin client to bypass INSERT RLS
            const { error: dbError } = await adminSupabase
                .from('gallery_images')
                .insert({
                    url: publicUrl,
                    alt_text: file.name
                })

            if (dbError) {
                console.error(`Error saving ${file.name} to database:`, dbError)
                results.push({ file: file.name, status: 'failed_db', error: dbError.message })
            } else {
                results.push({ file: file.name, status: 'success', url: publicUrl })
            }
        }

        revalidatePath('/admin/gallery')
        revalidatePath('/')

        const failed = results.filter(r => r.status !== 'success')
        if (failed.length > 0) {
            return { success: true, warning: `${failed.length} images failed to upload`, results: results }
        }

        return { success: true, results: results }

    } catch (e: any) {
        console.error("Unexpected error in uploadGalleryImages:", e);
        return { error: `Server Error: ${e.message || 'Unknown error'}` };
    }
}

export async function deleteGalleryImage(id: string, url: string) {
    const supabase = await createClient()

    // Check for admin/editor authorization first
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Unauthorized' }
    }

    // Check if admin
    // FAILSAFE: Allow hardcoded admin emails
    if (user.email === 'admin@momaturismo.com' || user.email === 'admin@moma.com') {
        // authorized
    } else {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'editor')) {
            return { error: 'Unauthorized: Admin access required' }
        }
    }

    // Delete from storage
    // Extract filename properly from the URL
    // The public URL is typically: .../storage/v1/object/public/gallery/FILENAME
    // We need just the FILENAME.

    // Safety check: ensure URL belongs to our bucket
    if (url.includes('/gallery/')) {
        const fileName = url.substring(url.lastIndexOf('/') + 1)

        if (fileName) {
            // Use admin client for deletion too if possible, though we need to instantiate it again or reuse logic
            // Ideally refactor admin client creation, but for now:
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            const adminSupabase = serviceRoleKey
                ? createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
                : supabase;

            const { error: storageError } = await adminSupabase
                .storage
                .from('gallery')
                .remove([fileName])

            if (storageError) {
                console.error('Error deleting from storage:', storageError)
            }
        }
    }

    // Delete from DB using admin privilege (need to instantiate if not already available in scope or reuse)
    // We reused adminSupabase above inside the block, but need it here too.
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const adminSupabase = serviceRoleKey
        ? createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
        : supabase;

    const { error: dbError } = await adminSupabase
        .from('gallery_images')
        .delete()
        .eq('id', id)

    if (dbError) {
        return { error: 'Failed to delete image record' }
    }

    revalidatePath('/admin/gallery')
    revalidatePath('/')

    return { success: true }
}
