import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { createAdminClient } from '@/utils/supabase/admin';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create a unique filename with .webp extension
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        // Clean the filename: remove extension and replace special chars
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${Date.now()}-${randomSuffix}-${cleanName}.webp`;

        // 1. Try Supabase Storage first (Production / Cloud)
        try {
            const supabase = createAdminClient(); // Will throw if env vars missing
            const BUCKET_NAME = 'experiences';

            // Ensure bucket exists (idempotent-ish)
            const { data: buckets } = await supabase.storage.listBuckets();
            const bucketExists = buckets?.find(b => b.name === BUCKET_NAME);
            
            if (!bucketExists) {
                await supabase.storage.createBucket(BUCKET_NAME, {
                    public: true,
                    fileSizeLimit: 5242880, // 5MB
                    allowedMimeTypes: ['image/webp', 'image/jpeg', 'image/png']
                });
            }

            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filename, buffer, {
                    contentType: 'image/webp',
                    upsert: true
                });

            if (error) {
                console.error('Supabase Storage upload error:', error);
                throw error; // Fallback to local
            }

            const { data: { publicUrl } } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filename);

            return NextResponse.json({
                success: true,
                url: publicUrl
            });

        } catch (supabaseError) {
            // Only log if it's not just missing env vars (which is expected in local dev sometimes)
            if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
                console.warn('Supabase upload failed, falling back to local filesystem:', supabaseError);
            }
        }

        // 2. Fallback to Local Filesystem (Dev / No Supabase)
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const filePath = path.join(uploadDir, filename);

        // Ensure directory exists
        await fs.mkdir(uploadDir, { recursive: true });

        // Save the file
        await fs.writeFile(filePath, buffer);

        return NextResponse.json({
            success: true,
            url: `/uploads/${filename}`
        });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
