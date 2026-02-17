// import { PrismaClient } from '@prisma/client';

// const globalForPrisma = globalThis as unknown as {
//     prisma: PrismaClient | undefined;
// };

// export const prisma = globalForPrisma.prisma ?? new PrismaClient({
//     log: ['query', 'error', 'warn'],
// });

// if (process.env.NODE_ENV !== 'production') {
//     globalForPrisma.prisma = prisma;
// }


//===============

import { PrismaClient } from '@prisma/client'

// --- Логирование для отладки подключения ---
const dbUrl = process.env.DATABASE_URL
console.log(
    '🔗 Prisma пытается подключиться к:',
    dbUrl ? `${dbUrl.substring(0, 35)}...` : '❌ URL НЕ НАЙДЕН (Проверьте файл .env)'
)
// -------------------------------------------

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: ['query', 'error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}