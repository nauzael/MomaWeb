
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'admin@moma.com';
    console.log(`Checking user ${email} in database...`);

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (user) {
            console.log('User found:', user);
            console.log('Password hash start:', user.password.substring(0, 7));
        } else {
            console.log('User NOT found.');
        }

        // Also list all admin users to be sure
        const admins = await prisma.user.findMany({
            where: { role: 'admin' },
            select: { email: true, role: true, id: true }
        });
        console.log('All Admins:', admins);

    } catch (e) {
        console.error('Error querying database:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
