
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Creating system_settings table...');
    try {
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS system_settings (
        \`key\` VARCHAR(191) NOT NULL,
        \`value\` TEXT NOT NULL,
        \`description\` VARCHAR(191) NULL,
        \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`key\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
        console.log('Table created successfully.');
    } catch (e) {
        console.error('Error creating table:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
