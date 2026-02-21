import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // 1. Указываем, что params - это Promise
) {
    try {
        // 2. Ждем разрешения Promise, чтобы получить id
        const { id } = await params;

        const body = await req.json();
        const { isIssued } = body;

        if (typeof isIssued !== 'boolean') {
            return NextResponse.json(
                { error: 'Неверный формат данных' },
                { status: 400 }
            );
        }

        // Для отладки можешь раскомментировать строку ниже и проверить консоль сервера
        // console.log('Updating winner ID:', id, 'to status:', isIssued);

        const updatedWinner = await prisma.winner.update({
            where: { id: id }, // Теперь id будет определен корректно
            data: {
                isIssued,
                issuedAt: isIssued ? new Date() : null,
            },
        });

        return NextResponse.json(updatedWinner);
    } catch (error) {
        console.error('Ошибка обновления победителя:', error);
        return NextResponse.json(
            { error: 'Ошибка при обновлении' },
            { status: 500 }
        );
    }
}