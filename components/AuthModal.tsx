'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TelegramAuth from './TelegramAuth'

interface User {
    id: string
    role?: 'ADMIN' | 'USER'
    [key: string]: any
}

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true) // Для проверки сессии
    const [isSubmitting, setIsSubmitting] = useState(false) // Для отправки формы

    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true)
            try {
                const response = await fetch('/api/session')
                if (response.ok) {
                    const data = await response.json()
                    if (data.isAuthenticated) {
                        router.push(data.user.role === 'ADMIN' ? '/dashboard' : '/profile')
                        return
                    }
                }
            } catch (error) {
                console.error('Ошибка проверки авторизации:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (isOpen) {
            checkAuth()
        }
    }, [isOpen, router])

    const redirectUser = (user: User) => {
        onClose()
        const role = user.role || 'USER'
        if (role === 'ADMIN') {
            router.push('/dashboard')
        } else {
            router.push('/profile')
        }
    }

    const handleManualLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password }),
            })

            if (response.ok) {
                const user = await response.json()
                redirectUser(user)
            } else {
                const errorData = await response.json()
                setError(errorData.error || 'Неверный логин или пароль')
                setIsSubmitting(false)
            }
        } catch (err) {
            console.error('Ошибка входа:', err)
            setError('Произошла ошибка сети')
            setIsSubmitting(false)
        }
    }

    if (!isOpen) {
        return null
    }

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="text-white font-medium">Загрузка...</div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center transform transition-all scale-100 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>

                <div className="mb-6">
                    <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Вход в аккаунт</h2>
                    <p className="text-gray-600 text-sm mb-6">
                        Выберите способ входа
                    </p>

                    {/* Кнопка входа через Telegram */}
                    <TelegramAuth
                        onAuthSuccess={redirectUser}
                        onError={(err) => setError(err)}
                    />

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">или</span></div>
                    </div>

                    {/* Форма ручного входа (для Админа) */}
                    <form onSubmit={handleManualLogin} className="space-y-4 text-left">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
                            <input
                                type="text"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="admin"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-xs text-center bg-red-50 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition font-medium disabled:opacity-50"
                        >
                            {isSubmitting ? 'Вход...' : 'Войти'}
                        </button>
                    </form>

                    <div className="mt-4 text-xs text-gray-400">
                        Для разработки: <br />
                        Админ: <b>admin</b> / <b>admin123</b><br />
                        Юзер: <b>testuser</b> / <b>password</b>
                    </div>
                </div>
            </div>
        </div>
    )
}