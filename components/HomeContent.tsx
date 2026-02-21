// 'use client'
// import { useState } from 'react'
// import { Prize } from '@/types/prize'
// import CarouselPrizes from './CarouselPrizes'
// import AuthModal from './AuthModal'

// interface HomeContentProps {
//     prizes: Prize[]
// }

// export default function HomeContent({ prizes }: HomeContentProps) {
//     const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

//     const handleSpin = async (): Promise<boolean> => {
//         return true;
//     };

//     return (
//         <div className="relative min-h-screen bg-slate-950 flex flex-col items-center pt-24 px-4">

//             <div className="w-full max-w-2xl mx-auto space-y-8 flex flex-col items-center">

//                 {/* Заголовок */}
//                 <div className="text-center space-y-2">
//                     <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 animate-fade-in drop-shadow-lg">
//                         Лотерея Призов
//                     </h1>

//                 </div>

//                 {/* Карточка с каруселью */}
//                 <div className="w-full bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-800">
//                     <CarouselPrizes
//                         prizes={prizes}
//                         onSpin={handleSpin}
//                         balance={0}
//                         isSpinning={false}
//                         requireTokens={false}
//                     />
//                 </div>

//                 {/* Кнопка входа */}
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


//======================


'use client'

import { useState } from 'react'
import { Prize } from '@/types/prize'
import CarouselPrizes from './CarouselPrizes'
import AuthModal from './AuthModal'
import { spinWheel } from '@/app/actions' // <--- Импорт действия

interface HomeContentProps {
    prizes: Prize[]
    initialBalance?: number // <--- Добавил пропс для начального баланса
}

export default function HomeContent({ prizes, initialBalance = 0 }: HomeContentProps) {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

    // Состояния для игры
    const [isSpinning, setIsSpinning] = useState(false)
    const [balance, setBalance] = useState(initialBalance)

    const handleSpin = async (): Promise<boolean> => {
        setIsSpinning(true)
        try {
            const result = await spinWheel()

            if (result.success) {
                // Обновляем баланс, если он вернулся с сервера
                if (result.user) {
                    setBalance(result.user.tokenBalance)
                }

                // Если выиграл приз - показываем уведомление
                if (result.prize) {
                    alert(`🎉 Поздравляем! Вы выиграли: ${result.prize.name}`)
                }

                return true
            } else {
                // Обработка ошибок
                if (result.message === 'Не авторизован' || result.message === 'Ошибка сессии') {
                    setIsAuthModalOpen(true)
                } else {
                    alert(result.message || 'Произошла ошибка')
                }
                return false
            }
        } catch (error) {
            console.error('Ошибка при вращении:', error)
            alert('Ошибка соединения с сервером')
            return false
        } finally {
            setIsSpinning(false)
        }
    }

    return (
        <div className="relative min-h-screen bg-slate-950 flex flex-col items-center pt-24 px-4">
            <div className="w-full max-w-2xl mx-auto space-y-8 flex flex-col items-center">
                {/* Заголовок */}
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 animate-fade-in drop-shadow-lg">
                        Лотерея Призов
                    </h1>
                </div>

                {/* Карточка с каруселью */}
                <div className="w-full bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-800">
                    <CarouselPrizes
                        prizes={prizes}
                        onSpin={handleSpin}
                        balance={balance}
                        isSpinning={isSpinning}
                        requireTokens={false}
                    />
                </div>

                {/* Кнопка входа */}
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