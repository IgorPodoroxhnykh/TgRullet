import { NextResponse } from 'next/server'
import { getSession } from "@/utils/session" // Импортируем нашу функцию

export async function GET() {
    try {
        // Получаем данные сессии (расшифровываем куку)
        const session = await getSession()

        if (!session) {
            return NextResponse.json({ isAuthenticated: false })
        }

        // Возвращаем данные пользователя из сессии
        return NextResponse.json({
            isAuthenticated: true,
            user: session.user
        })

    } catch (error) {
        console.error('Session error:', error)
        return NextResponse.json({ isAuthenticated: false })
    }
}