'use server'

import { prisma } from '@/prisma/prisma-client'
import { cookies } from 'next/headers';
import { decrypt } from "@/utils/session";
import { User } from '@/types/user';



export async function getPrizes() {
    return await prisma.prize.findMany()
}


// Новое действие: Крутить барабан
export async function spinWheel(): Promise<{ success: boolean; user?: User; message?: string }> {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) return { success: false, message: 'Не авторизован' };

    const decrypted = await decrypt(sessionToken);
    const userId = decrypted?.user?.id;

    if (!userId) return { success: false, message: 'Ошибка сессии' };

    // Проверяем баланс
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tokenBalance: true },
    });

    if (!user || user.tokenBalance < 1) {
        return { success: false, message: 'Недостаточно токенов' };
    }

    // Списываем токен
    try {
        const updatedUser = await prisma.user.update({
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

        return { success: true, user: updatedUser as User };
    } catch (error) {
        console.error('Spin Error:', error);
        return { success: false, message: 'Ошибка обновления' };
    }
}