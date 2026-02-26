import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { cookies } from 'next/headers';
import { decrypt } from '@/utils/session';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get('session')?.value;

        if (!sessionToken) {
            return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
        }

        const decrypted = await decrypt(sessionToken);
        const userId = decrypted?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: 'Ошибка сессии' }, { status: 400 });
        }

        const winners = await prisma.winner.findMany({
            where: {
                userId: userId,
                prize: {
                    isValuable: true,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                prize: {
                    select: {
                        id: true,
                        name: true,
                        imageUrl: true,
                        isValuable: true,
                    },
                },
            },
        });

        // Добавляем заголовки против кэширования
        return NextResponse.json(winners, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
            },
        });
    } catch (error) {
        console.error('Ошибка при получении победителей:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}