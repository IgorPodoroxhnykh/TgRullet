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
//     // В демо-режеме isSpinning здесь не нужен, 
//     // так как CarouselPrizes сама управляет состоянием isAnimating

//     // Логика демо-вращения
//     const handleSpin = async (): Promise<boolean> => {
//         // В демо-режиме не ждем ничего, просто разрешаем крутиться
//         return true;
//     };

//     return (
//         <div className="relative min-h-screen flex flex-col items-center">
//             {/* Основной контент */}
//             <div className="w-full min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 p-8 pt-20 flex flex-col items-center">
//                 <CarouselPrizes
//                     prizes={prizes}
//                     onSpin={handleSpin}
//                     // balance и isSpinning можно не передавать, но для типизации оставим дефолты
//                     balance={0}
//                     isSpinning={false}
//                     requireTokens={false}
//                 />
//                 {/* Кнопка "Войти" по центру под каруселью */}
//                 <div className="mt-6 z-10">
//                     <button
//                         onClick={() => setIsAuthModalOpen(true)}
//                         className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95"
//                     >
//                         Войти для игры
//                     </button>
//                 </div>
//             </div>
//             {/* Модальное окно авторизации */}
//             <AuthModal
//                 isOpen={isAuthModalOpen}
//                 onClose={() => setIsAuthModalOpen(false)}
//             />
//         </div>
//     )
// }



//=============

'use client'
import { useState } from 'react'
import { Prize } from '@/types/prize'
import CarouselPrizes from './CarouselPrizes'
import AuthModal from './AuthModal'

interface HomeContentProps {
    prizes: Prize[]
}

export default function HomeContent({ prizes }: HomeContentProps) {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

    const handleSpin = async (): Promise<boolean> => {
        return true;
    };

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
                        balance={0}
                        isSpinning={false}
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