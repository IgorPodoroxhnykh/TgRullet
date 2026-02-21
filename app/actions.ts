// 'use server'

// import { prisma } from '@/prisma/prisma-client'
// import { cookies } from 'next/headers';
// import { decrypt } from "@/utils/session";
// import { User } from '@/types/user';



// export async function getPrizes() {
//     return await prisma.prize.findMany()
// }


// // Новое действие: Крутить барабан
// export async function spinWheel(): Promise<{ success: boolean; user?: User; message?: string }> {
//     const cookieStore = await cookies();
//     const sessionToken = cookieStore.get('session')?.value;

//     if (!sessionToken) return { success: false, message: 'Не авторизован' };

//     const decrypted = await decrypt(sessionToken);
//     const userId = decrypted?.user?.id;

//     if (!userId) return { success: false, message: 'Ошибка сессии' };

//     // Проверяем баланс
//     const user = await prisma.user.findUnique({
//         where: { id: userId },
//         select: { tokenBalance: true },
//     });

//     if (!user || user.tokenBalance < 1) {
//         return { success: false, message: 'Недостаточно токенов' };
//     }

//     // Списываем токен
//     try {
//         const updatedUser = await prisma.user.update({
//             where: { id: userId },
//             data: { tokenBalance: { decrement: 1 } },
//             select: {
//                 id: true,
//                 telegramId: true,
//                 username: true,
//                 firstName: true,
//                 lastName: true,
//                 tokenBalance: true,
//                 createdAt: true,
//             },
//         });

//         return { success: true, user: updatedUser as User };
//     } catch (error) {
//         console.error('Spin Error:', error);
//         return { success: false, message: 'Ошибка обновления' };
//     }
// }


//================


'use server'

import { prisma } from '@/prisma/prisma-client'
import { cookies } from 'next/headers';
import { decrypt } from "@/utils/session";
import { User } from '@/types/user';

export async function getPrizes() {
    return await prisma.prize.findMany()
}

// Тип для возвращаемого приза (упрощенный)
type WonPrize = {
    id: string;
    name: string;
    imageUrl: string | null;
};

// Новое действие: Крутить барабан
export async function spinWheel(): Promise<{
    success: boolean;
    user?: User;
    prize?: WonPrize;
    message?: string
}> {
    // 1. ЛОГИКА АВТОРИЗАЦИИ (Твоя логика)
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) return { success: false, message: 'Не авторизован' };

    const decrypted = await decrypt(sessionToken);
    const userId = decrypted?.user?.id;

    if (!userId) return { success: false, message: 'Ошибка сессии' };

    // 2. ОСНОВНАЯ ЛОГИКА ИГРЫ В ТРАНЗАКЦИИ
    try {
        const result = await prisma.$transaction(async (tx) => {
            // Получаем данные пользователя (нужен баланс для списания и username для таблицы Winner)
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    tokenBalance: true,
                    username: true,
                    firstName: true
                },
            });

            if (!user || user.tokenBalance < 1) {
                throw new Error('Недостаточно токенов');
            }

            // Получаем активные призы
            const prizes = await tx.prize.findMany({
                where: { isActive: true },
            });

            // Фильтруем только те призы, которые еще есть в наличии
            const availablePrizes = prizes.filter(p => p.totalCount > p.redeemedCount);

            // --- RNG ЛОГИКА (Выбор приза) ---
            // Вероятности в seed указаны в долях от 1 (например, 0.01, 0.25), 
            // поэтому используем Math.random() от 0 до 1.
            let wonPrize: typeof prizes[0] | null = null;
            const randomChance = Math.random();

            let cumulativeProbability = 0;

            // Перемешиваем призы, чтобы при равных вероятностях выпадал случайный
            const shuffledPrizes = availablePrizes.sort(() => Math.random() - 0.5);

            for (const prize of shuffledPrizes) {
                cumulativeProbability += prize.probability;
                if (randomChance <= cumulativeProbability) {
                    wonPrize = prize;
                    break;
                }
            }

            // --- ОБНОВЛЕНИЕ ДАННЫХ ---

            // 1. Списываем токен
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { tokenBalance: { decrement: 1 } },
                select: {
                    id: true,
                    telegramId: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    tokenBalance: true,
                    createdAt: true,
                },
            });

            // 2. Создаем запись истории спина
            const spinHistory = await tx.spinHistory.create({
                data: {
                    userId: user.id,
                    prizeId: wonPrize?.id || null,
                    tokensSpent: 1,
                    wheelIndex: Math.floor(Math.random() * 36), // Случайный индекс для анимации
                },
            });

            // 3. Если есть выигрыш - создаем записи в Winner и UserPrize
            if (wonPrize) {
                // Добавляем в таблицу ПОБЕДИТЕЛЕЙ
                await tx.winner.create({
                    data: {
                        userId: user.id,
                        username: user.username || user.firstName || 'Аноним',
                        prizeId: wonPrize.id,
                        isIssued: false,
                    },
                });

                // Добавляем в инвентарь пользователя
                await tx.userPrize.create({
                    data: {
                        userId: user.id,
                        prizeId: wonPrize.id,
                        spinId: spinHistory.id,
                        status: 'PENDING',
                    },
                });

                // Обновляем счетчик выданных призов
                await tx.prize.update({
                    where: { id: wonPrize.id },
                    data: { redeemedCount: { increment: 1 } },
                });
            }

            return { updatedUser, wonPrize };
        });

        // Успешное завершение транзакции
        return {
            success: true,
            user: result.updatedUser as User,
            prize: result.wonPrize ? {
                id: result.wonPrize.id,
                name: result.wonPrize.name,
                imageUrl: result.wonPrize.imageUrl
            } : undefined,
            message: result.wonPrize ? `Вы выиграли ${result.wonPrize.name}!` : 'Не повезло, попробуйте еще раз'
        };

    } catch (error) {
        console.error('Spin Error:', error);

        // Проверяем, если это наша ошибка баланса
        if (error instanceof Error && error.message === 'Недостаточно токенов') {
            return { success: false, message: 'Недостаточно токенов' };
        }

        return { success: false, message: 'Ошибка обновления' };
    }
}