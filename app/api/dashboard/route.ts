import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/prisma-client'

/// GET - получить все призы
export async function GET() {
    try {
        const prizes = await prisma.prize.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(prizes)
    } catch (error) {
        console.error('Ошибка получения призов:', error)
        return NextResponse.json({ error: 'Ошибка получения призов' }, { status: 500 })
    }
}

/// POST - создать новый приз
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, description, imageUrl, probability, totalCount, isActive } = body

        const prize = await prisma.prize.create({
            data: {
                name,
                description,
                imageUrl: imageUrl || null,
                probability: parseFloat(probability),
                totalCount: parseInt(totalCount),
                isActive: isActive ?? true
            }
        })

        return NextResponse.json(prize)
    } catch (error) {
        console.error('Ошибка создания приза:', error)
        return NextResponse.json({ error: 'Ошибка создания приза' }, { status: 500 })
    }
}

