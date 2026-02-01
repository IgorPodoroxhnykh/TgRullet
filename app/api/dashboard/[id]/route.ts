import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/prisma-client'

interface Params {
    params: { id: string }
}

// PUT - обновить приз
export async function PUT(request: Request, { params }: Params) {
    try {
        const { id } = await params // ← ДОБАВИТЬ await
        const body = await request.json()
        const { name, description, imageUrl, probability, totalCount, isActive } = body

        console.log('🔄 Обновляем приз:', id)
        console.log('📝 Данные:', body)

        const prize = await prisma.prize.update({
            where: { id }, // ← ИСПРАВЛЕНО: id теперь определён
            data: {
                name,
                description,
                imageUrl: imageUrl || null,
                probability: parseFloat(probability),
                totalCount: parseInt(totalCount),
                isActive
            }
        })

        console.log('✅ Приз обновлён:', prize)
        return NextResponse.json(prize)
    } catch (error) {
        console.error('❌ Ошибка обновления приза:', error)
        return NextResponse.json({ error: 'Ошибка обновления приза' }, { status: 500 })
    }
}

// DELETE - удалить приз
export async function DELETE(request: Request, { params }: { params: Params['params'] }) {
    try {
        const { id } = await params // ← Await params

        console.log('🗑️ Удаляем приз:', id)

        await prisma.prize.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Приз удалён' })
    } catch (error) {
        console.error('❌ Ошибка:', error)
        return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 })
    }
}