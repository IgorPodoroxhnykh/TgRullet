'use client'

import { useEffect, useState, useMemo } from 'react'

type Winner = {
    id: string
    createdAt: string
    isIssued: boolean
    prize: {
        name: string
        imageUrl: string | null
        isValuable: boolean
    }
}

export default function UserWinnings() {
    const [winners, setWinners] = useState<Winner[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isCollapsed, setIsCollapsed] = useState(false)

    useEffect(() => {
        async function fetchWinners() {
            try {
                console.log('Загрузка выигрышей...')
                const res = await fetch('/api/winners/user',
                    { cache: 'no-store' }
                )

                console.log('Ответ API:', res.status)

                if (!res.ok) {
                    const errorData = await res.text()
                    console.error('Ошибка от API:', errorData)
                    setError(`Ошибка: ${res.status}`)
                    return
                }

                const data = await res.json()
                console.log('Данные получены:', data)
                setWinners(data)
            } catch (error) {
                console.error('Ошибка загрузки победителей:', error)
                setError('Ошибка загрузки')
            } finally {
                setLoading(false)
            }
        }

        fetchWinners()
    }, [])

    // Сортировка: Сначала Ожидающие, потом Выданные
    const sortedWinners = useMemo(() => {
        return [...winners].sort((a, b) => {
            if (a.isIssued !== b.isIssued) {
                return a.isIssued ? 1 : -1
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    }, [winners])

    return (
        <div className="bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-800">
            {/* Заголовок */}
            <div
                className="flex justify-between items-center cursor-pointer mb-4"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <h2 className="text-xl font-bold text-white">🎁 Ваши выигрыши</h2>
                <span className={`text-gray-400 transform transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}>
                    ▼
                </span>
            </div>

            {/* Список */}
            {!isCollapsed && (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                        </div>
                    ) : error ? (
                        <p className="text-red-400 text-center py-4">{error}</p>
                    ) : winners.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">
                            У вас пока нет выигрышей
                        </p>
                    ) : (
                        sortedWinners.map((winner) => (
                            <div
                                key={winner.id}
                                className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700"
                            >
                                <div className="flex items-center gap-3">

                                    <div>
                                        <p className="font-medium text-sm text-white">{winner.prize.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(winner.createdAt).toLocaleDateString('ru-RU')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {winner.prize.isValuable && (
                                        <span className="text-purple-400 text-sm">💎</span>
                                    )}
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${winner.isIssued
                                            ? 'bg-green-900 text-green-300'
                                            : 'bg-yellow-900 text-yellow-300'
                                            }`}
                                    >
                                        {winner.isIssued ? 'Выдан' : 'Ожидает'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {winners.length > 0 && !isCollapsed && (
                <div className="mt-4 pt-3 border-t border-slate-700 text-center text-sm text-gray-500">
                    Всего: {winners.length}
                </div>
            )}
        </div>
    )
}