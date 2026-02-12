const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@momaturismo.com'
    const password = 'admin_moma_2024' // Cambiar esto después

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'admin'
        },
        create: {
            email,
            name: 'Admin Moma',
            password: hashedPassword,
            role: 'admin',
        },
    })

    console.log('Usuario administrador creado/actualizado:', user.email)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
