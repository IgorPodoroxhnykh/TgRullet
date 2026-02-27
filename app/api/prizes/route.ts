import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/prisma-client'

export async function GET() {
    try {
        const prizes = await prisma.prize.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 20
        })

        return NextResponse.json({ prizes })
    } catch (error) {
        console.error('Error fetching prizes:', error)
        return NextResponse.json({ prizes: [] }, { status: 500 })
    }
}