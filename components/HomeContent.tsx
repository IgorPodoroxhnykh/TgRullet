// 'use client'

// import { useState } from 'react'
// import { Prize } from '@/types/prize'
// import CarouselPrizes from './CarouselPrizes'
// import AuthModal from './AuthModal'

// interface HomeContentProps {
//     prizes: Prize[]
//     initialBalance?: number
// }

// export default function HomeContent({ prizes, initialBalance = 0 }: HomeContentProps) {
//     const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
//     const [balance, setBalance] = useState(initialBalance)

//     // Демо-режим: просто возвращаем true, звуки теперь в CarouselPrizes
//     const handleSpin = async (): Promise<boolean> => {
//         return true
//     }

//     return (
//         <div className="relative min-h-screen bg-slate-950 flex flex-col items-center pt-4 px-4">
//             <div className="w-full max-w-2xl mx-auto space-y-8 flex flex-col items-center">

//                 <div className="w-full bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-800">
//                     <CarouselPrizes
//                         prizes={prizes}
//                         onSpin={handleSpin}
//                         balance={balance}
//                         isSpinning={false}
//                         requireTokens={false}
//                     />
//                 </div>

//                 <button
//                     onClick={() => setIsAuthModalOpen(true)}
//                     className="w-full max-w-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-purple-900/50 transition-all transform hover:scale-105 active:scale-95 border border-slate-700"
//                 >
//                     Войти для игры
//                 </button>
//             </div>

//             <AuthModal
//                 isOpen={isAuthModalOpen}
//                 onClose={() => setIsAuthModalOpen(false)}
//             />
//         </div>
//     )
// }

//===============



'use client'
import { useState, useEffect } from 'react'
import { Prize } from '@/types/prize'
import CarouselPrizes from './CarouselPrizes'
import AuthModal from './AuthModal'

interface HomeContentProps {
    prizes: Prize[]
    initialBalance?: number
}

export default function HomeContent({ prizes: initialPrizes, initialBalance = 0 }: HomeContentProps) {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [balance, setBalance] = useState(initialBalance)
    const [prizes, setPrizes] = useState<Prize[]>(initialPrizes)
    const [isLoading, setIsLoading] = useState(true)

    // Загружаем актуальные призы с сервера при монтировании
    useEffect(() => {
        const loadPrizes = async () => {
            try {
                const response = await fetch('/api/prizes')
                const data = await response.json()
                if (data.prizes && data.prizes.length > 0) {
                    setPrizes(data.prizes)
                }
            } catch (error) {
                console.error('Error loading prizes:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadPrizes()

        // Обновляем каждые 30 секунд
        const interval = setInterval(loadPrizes, 30000)
        return () => clearInterval(interval)
    }, [])

    // Загружаем баланс пользователя
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const response = await fetch('/api/user')
                if (response.ok) {
                    const data = await response.json()
                    if (data.user) {
                        setBalance(data.user.tokenBalance || 0)
                    }
                }
            } catch (error) {
                console.error('Error loading user:', error)
            }
        }

        loadUserData()

        // Обновляем каждые 5 секунд пока открыто приложение
        const interval = setInterval(loadUserData, 5000)
        return () => clearInterval(interval)
    }, [])

    const handleSpin = async (): Promise<boolean> => {
        return true
    }

    // Показываем старые призы пока загружаются новые
    if (isLoading && prizes.length === 0) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white text-lg">Загрузка призов...</div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-slate-950 flex flex-col items-center pt-4 px-4">
            <div className="w-full max-w-2xl mx-auto space-y-8 flex flex-col items-center">
                <div className="w-full bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-800">
                    <CarouselPrizes
                        prizes={prizes}
                        onSpin={handleSpin}
                        balance={balance}
                        isSpinning={false}
                        requireTokens={false}
                    />
                </div>

                <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full max-w-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-purple-900/50 transition-all transform hover:scale-105 active:scale-95 border border-slate-700"
                >
                    Войти для игры
                </button>
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </div>
    )
}