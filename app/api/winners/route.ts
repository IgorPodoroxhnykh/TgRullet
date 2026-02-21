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
                    },
                },
            },
        });

        return NextResponse.json(winners);
    } catch (error) {
        console.error('Ошибка при получении победителей:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}