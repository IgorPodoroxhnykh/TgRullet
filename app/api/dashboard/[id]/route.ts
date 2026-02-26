
import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/prisma-client'

// PUT - обновить приз
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()

        console.log('🔄 Обновляем приз:', id)
        console.log('📝 Данные:', body)

        const { name, description, imageUrl, probability, totalCount, isActive, isValuable } = body

        // Формируем данные для обновления
        const updateData: any = {
            name,
            description,
            probability: parseFloat(probability),
            totalCount: parseInt(totalCount),
            isActive,
            isValuable: isValuable ?? false,
        }

        // Обновляем imageUrl только если он явно передан и не undefined
        // (т.е. было изменение изображения)
        if (body.hasOwnProperty('imageUrl') && body.imageUrl !== undefined) {
            updateData.imageUrl = imageUrl || null
        }

        console.log('📦 Данные для Prisma:', updateData)

        const prize = await prisma.prize.update({
            where: { id },
            data: updateData,
        })

        console.log('✅ Приз обновлён:', prize)
        return NextResponse.json(prize)
    } catch (error) {
        console.error('❌ Ошибка обновления приза:', error)
        return NextResponse.json({ error: 'Ошибка обновления приза' }, { status: 500 })
    }
}

// DELETE - удалить приз
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        console.log('🗑️ Удаляем приз:', id)
        await prisma.prize.delete({
            where: { id },
        })
        return NextResponse.json({ message: 'Приз удалён' })
    } catch (error) {
        console.error('❌ Ошибка:', error)
        return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 })
    }
}