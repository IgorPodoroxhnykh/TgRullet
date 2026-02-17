import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { encrypt, SESSION_DURATION } from "@/utils/session" // Импортируем функции сессии

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
    try {
        const { login, password } = await req.json()

        if (!login || !password) {
            return NextResponse.json(
                { error: 'Логин и пароль обязательны' },
                { status: 400 }
            )
        }

        // 1. Поиск пользователя
        const user = await prisma.user.findUnique({
            where: { login: login }
        })

        if (!user || !user.password) {
            return NextResponse.json(
                { error: 'Неверный логин или пароль' },
                { status: 401 }
            )
        }

        // 2. Проверка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Неверный логин или пароль' },
                { status: 401 }
            )
        }

        // 3. Создаем зашифрованную сессию (как в Telegram Auth)
        const { password: _, ...userWithoutPassword } = user

        const expires = new Date(Date.now() + SESSION_DURATION)
        const session = await encrypt({
            user: {
                id: user.id,
                telegramId: user.telegramId,
                role: user.role
            },
            expires
        })

        // 4. Устанавливаем куку с названием 'session'
        const response = NextResponse.json(userWithoutPassword)

        response.cookies.set('session', session, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: expires,
            path: '/'
        })

        return response

    } catch (error) {
        console.error('Ошибка при входе:', error)
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        )
    }
}