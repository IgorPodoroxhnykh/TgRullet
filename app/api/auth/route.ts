// import { encrypt, SESSION_DURATION } from "@/utils/session"
// import { validateTelegramWebAppData } from "@/utils/telegramAuth"
// import { cookies } from "next/headers"
// import { NextResponse } from "next/server"


// export async function POST(request: Request) {
//     try {

//         const { initData } = await request.json()


//         if (!initData) {
//             return NextResponse.json(
//                 { message: 'initData is required' },
//                 { status: 400 }
//             )
//         }
//         const ValidationResult = validateTelegramWebAppData(initData)

//         if (ValidationResult.validatedData) {
//             const user = { telegramId: ValidationResult.user.id }

//             const expires = new Date(Date.now() + SESSION_DURATION)

//             const session = await encrypt({ user, expires })

//             const cookieStore = await cookies()
//             cookieStore.set('session', session, {
//                 expires,
//                 httpOnly: true,
//                 secure: process.env.NODE_ENV === 'production',
//                 sameSite: 'lax',
//                 path: '/',
//             })


//             return NextResponse.json({
//                 message: 'Authentication successful',
//                 user: ValidationResult.user
//             })
//         } else {
//             console.log('Validation failed:', ValidationResult.message)
//             return NextResponse.json(
//                 { message: ValidationResult.message },
//                 { status: 401 }
//             )
//         }
//     } catch (error) {
//         console.error('Auth API error:', error)
//         return NextResponse.json(
//             { message: 'Internal server error' },
//             { status: 500 }
//         )
//     }
// }

//============================


import { encrypt, SESSION_DURATION } from "@/utils/session"
import { validateTelegramWebAppData } from "@/utils/telegramAuth"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client" // 1. Добавляем Prisma

const prisma = new PrismaClient()

export async function POST(request: Request) {
    try {
        const { initData } = await request.json()

        if (!initData) {
            return NextResponse.json(
                { message: 'initData is required' },
                { status: 400 }
            )
        }

        // 2. Валидация данных от Telegram (Ваш код)
        const ValidationResult = validateTelegramWebAppData(initData)

        if (ValidationResult.validatedData) {
            const tgUser = ValidationResult.user

            // 3. Логика работы с базой данных (Prisma)
            const user = await prisma.user.upsert({
                where: { telegramId: String(tgUser.id) },
                update: {
                    username: tgUser.username || null,
                    firstName: tgUser.first_name || null,
                    lastName: tgUser.last_name || null,
                },
                create: {
                    telegramId: String(tgUser.id),
                    username: tgUser.username || null,
                    firstName: tgUser.first_name || 'Пользователь',
                    lastName: tgUser.last_name || null,
                    role: 'USER',
                    isActive: true,
                    tokenBalance: 0,
                },
            })

            // 4. Создаем зашифрованную сессию
            // В сессию кладем важные данные (ID и Роль), чтобы не лазить в БД постоянно
            const expires = new Date(Date.now() + SESSION_DURATION)
            const session = await encrypt({
                user: {
                    id: user.id,
                    telegramId: user.telegramId,
                    role: user.role
                },
                expires
            })

            const cookieStore = await cookies()
            cookieStore.set('session', session, {
                expires,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            })

            // 5. Возвращаем ПОЛНЫЕ данные пользователя из БД (включая баланс и роль)
            return NextResponse.json({
                message: 'Authentication successful',
                user: user
            })

        } else {
            console.log('Validation failed:', ValidationResult.message)
            return NextResponse.json(
                { message: ValidationResult.message },
                { status: 401 }
            )
        }
    } catch (error) {
        console.error('Auth API error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}