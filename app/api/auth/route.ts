import { encrypt, SESSION_DURATION } from "@/utils/session"
import { validateTelegramWebAppData } from "@/utils/telegramAuth"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"


export async function POST(request: Request) {
    try {

        const { initData } = await request.json()


        if (!initData) {
            return NextResponse.json(
                { message: 'initData is required' },
                { status: 400 }
            )
        }
        const ValidationResult = validateTelegramWebAppData(initData)

        if (ValidationResult.validatedData) {
            const user = { telegramId: ValidationResult.user.id }

            const expires = new Date(Date.now() + SESSION_DURATION)

            const session = await encrypt({ user, expires })

            const cookieStore = await cookies()
            cookieStore.set('session', session, {
                expires,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            })


            return NextResponse.json({
                message: 'Authentication successful',
                user: ValidationResult.user
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
