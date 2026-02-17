// 'use client'

// import React, { useEffect, useState } from 'react'

// interface TelegramAuthProps {
//     onAuthSuccess?: (user: any) => void
// }

// export default function TelegramAuth({ onAuthSuccess }: TelegramAuthProps) {
//     const [isLoading, setIsLoading] = useState(false)

//     useEffect(() => {
//         const initTelegram = async () => {
//             try {
//                 // Пытаемся инициализировать SDK, если доступно
//                 const { postEvent, isTMA } = await import('@telegram-apps/sdk')
//                 if (isTMA()) {
//                     postEvent('web_app_ready')
//                 }
//             } catch (e) {
//                 console.log('Telegram SDK not used or error', e)
//             }
//         }
//         initTelegram()
//     }, [])

//     const authenticateUser = async () => {
//         setIsLoading(true)
//         try {
//             // Функция получения данных из хеша (как в вашем примере)
//             const getRawTelegramInitData = () => {
//                 if (typeof window === 'undefined') return null
//                 const hash = window.location.hash.substring(1)
//                 const urlParams = new URLSearchParams(hash)
//                 return urlParams.get('tgWebAppData')
//             }

//             const rawInitData = getRawTelegramInitData()

//             if (!rawInitData) {
//                 console.error('No Telegram init data found')
//                 alert('Ошибка: Не получены данные от Telegram')
//                 return
//             }

//             const response = await fetch('/api/auth', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ initData: rawInitData })
//             })

//             if (response.ok) {
//                 const data = await response.json()
//                 // Предполагаем, что API возвращает объект user
//                 // Важно: Ваш API должен возвращать роль пользователя, если вы хотите редиректить по ролям
//                 const user = data.user

//                 // Если API не возвращает роль, можно установить дефолтную для примера
//                 if (!user.role) {
//                     // В реальном проекте роль должна приходить с бэкенда
//                     // user.role = 'USER' 
//                 }

//                 if (onAuthSuccess) {
//                     onAuthSuccess(user)
//                 }
//             } else {
//                 console.error('Authentication failed')
//                 alert('Ошибка авторизации')
//             }
//         } catch (error) {
//             console.error('Error during authentication:', error)
//             alert('Произошла ошибка при входе')
//         } finally {
//             setIsLoading(false)
//         }
//     }

//     return (
//         <button
//             onClick={authenticateUser}
//             disabled={isLoading}
//             className="w-full bg-[#24A1DE] hover:bg-[#1B8BC0] text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
//         >
//             {isLoading ? (
//                 'Входим...'
//             ) : (
//                 <>
//                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                         <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z" />
//                     </svg>
//                     Войти через Telegram
//                 </>
//             )}
//         </button>
//     )
// }

//=======================


'use client'
import { useState } from 'react'

interface TelegramAuthProps {
    onAuthSuccess: (user: any) => void
    onError?: (error: string) => void
}

export default function TelegramAuth({ onAuthSuccess, onError }: TelegramAuthProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async () => {
        setIsLoading(true)
        try {
            const tg = (window as any).Telegram?.WebApp

            if (!tg) {
                onError?.('Откройте приложение в Telegram')
                setIsLoading(false)
                return
            }

            tg.ready()

            // Берем raw initData (строку) для валидации на сервере
            const initData = tg.initData

            if (!initData) {
                onError?.('Не удалось получить данные для авторизации')
                setIsLoading(false)
                return
            }

            // Отправляем запрос на роут, где вы используете validateTelegramWebAppData
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initData }),
            })

            if (response.ok) {
                const data = await response.json()
                // Возвращаем полного пользователя (с ролью и балансом из БД)
                onAuthSuccess(data.user)
            } else {
                const errorData = await response.json()
                onError?.(errorData.message || 'Ошибка входа')
                setIsLoading(false)
            }
        } catch (error) {
            console.error('Network error:', error)
            onError?.('Ошибка соединения')
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-[#2481cc] hover:bg-[#2068a8] text-white font-bold py-3 px-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
        >
            {isLoading ? 'Загрузка...' : (
                <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.93 1.23-5.46 3.61-.52.35-1.01.53-1.46.52-.48-.01-1.41-.27-2.1-.5-.85-.27-1.52-.42-1.46-.89.03-.24.36-.49.99-.75 3.88-1.69 6.47-2.8 7.76-3.36 3.69-1.54 4.46-1.81 4.96-1.82.11 0 .35.03.51.16.14.11.18.26.2.41z" />
                    </svg>
                    <span>Войти через Telegram</span>
                </>
            )}
        </button>
    )
}