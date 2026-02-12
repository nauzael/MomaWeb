
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning database images...');

    // 1. Clear gallery_images
    const galleryCount = await prisma.galleryImage.deleteMany();
    console.log(`Deleted ${galleryCount.count} gallery images.`);

    // 2. Clear experience_media
    const mediaCount = await prisma.experienceMedia.deleteMany();
    console.log(`Deleted ${mediaCount.count} experience media records.`);

    // 3. Reset image and gallery fields in experiences
    const experienceCount = await prisma.experience.updateMany({
        data: {
            image: '',
            gallery: []
        }
    });
    console.log(`Reset ${experienceCount.count} experiences.`);

    console.log('Database cleaned successfully.');
}

main()
    .catch((e) => {
        console.error('Error cleaning database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
