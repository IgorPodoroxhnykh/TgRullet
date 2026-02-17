import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { User } from '@/types/user';
// Импортируем вашу функцию получения сессии
import { getSession } from '@/utils/session';

export async function GET() {
    try {
        const session = await getSession();

        // ИСПРАВЛЕНИЕ: Проверяем session.user.id вместо session.userId
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ИСПРАВЛЕНИЕ: Используем session.user.id для поиска
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                telegramId: true,
                username: true,
                firstName: true,
                lastName: true,
                tokenBalance: true,
                createdAt: true,
            },
        }) as User | null;

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('[API_USER_GET]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}