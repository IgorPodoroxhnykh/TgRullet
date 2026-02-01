'use server'

import { prisma } from '@/prisma/prisma-client'

export async function getPrizes() {
    return await prisma.prize.findMany()
}