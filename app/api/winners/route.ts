import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';

export async function GET() {
    try {
        const winners = await prisma.winner.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                prize: {
                    select: {
                        name: true,
                        imageUrl: true,
                        isValuable: true, // <--- Добавляем поле isValuable
                    },
                },
            },
        });

        // Фильтруем: оставляем только победителей с ценными призами
        const valuableWinners = winners.filter(winner => winner.prize.isValuable === true);

        return NextResponse.json(valuableWinners);
    } catch (error) {
        console.error('Ошибка при получении победителей:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}