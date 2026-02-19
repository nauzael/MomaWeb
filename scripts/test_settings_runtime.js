
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Testing SystemSetting access...');
    try {
        // Attempt to access the property, even if TS complains, JS should run if generated
        if (!prisma.systemSetting) {
            console.error('ERROR: prisma.systemSetting is undefined at runtime!');
        } else {
            console.log('SUCCESS: prisma.systemSetting exists.');
            const count = await prisma.systemSetting.count();
            console.log('Current count:', count);
        }
    } catch (e) {
        console.error('Runtime Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
