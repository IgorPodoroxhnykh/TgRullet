// 'use client'

// import React, { forwardRef, useImperativeHandle } from 'react'
// import PrizeCard from '../PrizeCard' // Обратите внимание на путь к PrizeCard
// import { useCarousel } from './useCarousel'
// import { ICarouselPrizesProps, CarouselRef } from './types'

// const CarouselPrizes = forwardRef<CarouselRef, ICarouselPrizesProps>(
//     ({ prizes, className = '', onPrizeSelect }, ref) => {
//         const {
//             containerRef,
//             dimensions,
//             isAnimating,
//             animationPhase,
//             totalCards,
//             visibleItems,
//             currentPrize,
//             spinTo,
//         } = useCarousel(prizes, onPrizeSelect)

//         // Экспорт методов наружу через ref
//         useImperativeHandle(ref, () => ({ spinTo }), [spinTo])

//         return (
//             <div className={`relative w-full ${className}`}>
//                 <div
//                     ref={containerRef}
//                     className="relative mx-auto overflow-hidden"
//                     style={{
//                         height: dimensions.cardHeight + 80,
//                         maxWidth: 1000,
//                     }}
//                 >
//                     {/* Arrows & Lights */}
//                     <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
//                         <div className="w-0 h-0 border-l-[min(12px,2vw)] border-r-[min(12px,2vw)] border-b-[min(16px,2.5vw)] border-l-transparent border-r-transparent border-b-red-500 drop-shadow-md" />
//                     </div>
//                     <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
//                         <div className="w-0 h-0 border-l-[min(12px,2vw)] border-r-[min(12px,2vw)] border-t-[min(16px,2.5vw)] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-md" />
//                     </div>

//                     <div
//                         className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-opacity duration-300"
//                         style={{
//                             width: dimensions.cardWidth + 20,
//                             background: !isAnimating
//                                 ? 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.15), transparent)'
//                                 : 'transparent',
//                             opacity: isAnimating ? 0 : 1
//                         }}
//                     />

//                     {isAnimating && (
//                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
//                             <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
//                         </div>
//                     )}

//                     {/* Cards Layer */}
//                     {totalCards === 0 ? (
//                         <div className="flex items-center justify-center h-full text-gray-500 text-sm md:text-base">
//                             Нет доступных призов
//                         </div>
//                     ) : (
//                         <div className="relative w-full h-full flex items-center justify-center">
//                             {visibleItems.map((item) => (
//                                 <div
//                                     key={item.prize.id}
//                                     className="absolute top-1/2 -translate-y-1/2"
//                                     style={item.style}
//                                 >
//                                     <div className={`w-full h-full shadow-lg rounded-lg overflow-hidden transition-all duration-300 ${item.isCenter ? 'ring-4 ring-yellow-400/50 shadow-2xl' : ''}`}>
//                                         <PrizeCard
//                                             id={item.prize.id}
//                                             name={item.prize.name}
//                                             description={item.prize.description}
//                                             className="w-full h-full"
//                                         />
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>

//                 {/* Controls */}
//                 {totalCards > 1 && (
//                     <div className="flex justify-center mt-4">
//                         <button
//                             onClick={() => {
//                                 const randomIndex = Math.floor(Math.random() * totalCards)
//                                 spinTo(randomIndex)
//                             }}
//                             disabled={isAnimating}
//                             className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:from-purple-700 hover:to-pink-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             🎰 Крутить барабан
//                         </button>
//                     </div>
//                 )}

//                 {/* Info */}
//                 {currentPrize && (
//                     <div className="mt-4 md:mt-6 mx-auto text-center p-3 md:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg md:rounded-xl border border-yellow-200 shadow-sm max-w-md transition-all">
//                         <p className="text-xs md:text-sm text-gray-500 mb-1">🎯 Выбранный приз</p>
//                         <p className="text-base md:text-xl font-bold text-gray-800">{currentPrize.name}</p>
//                         <p className="text-sm md:text-base text-gray-600 mt-1 line-clamp-2">{currentPrize.description}</p>
//                     </div>
//                 )}
//             </div>
//         )
//     }
// )

// CarouselPrizes.displayName = 'CarouselPrizes'

// export default CarouselPrizes



//==================

'use client'
import React, { forwardRef, useImperativeHandle } from 'react'
import PrizeCard from '../PrizeCard'
import { useCarousel } from './useCarousel'
import { ICarouselPrizesProps, CarouselRef } from './types'

const CarouselPrizes = forwardRef<CarouselRef, ICarouselPrizesProps>(
    // Добавляем requireTokens в деструктуризацию (по умолчанию false)
    ({ prizes, className = '', onPrizeSelect, onSpin, balance = 0, isSpinning = false, requireTokens = false }, ref) => {
        const {
            containerRef,
            dimensions,
            isAnimating,
            animationPhase,
            totalCards,
            visibleItems,
            currentPrize,
            spinTo,
        } = useCarousel(prizes, onPrizeSelect)

        useImperativeHandle(ref, () => ({ spinTo }), [spinTo])

        const handleSpinClick = async () => {
            if (isAnimating || isSpinning) return;

            // Если требуются токены и их нет - блокируем (двойная защита)
            if (requireTokens && balance <= 0) return;

            const success = await onSpin?.();
            if (success) {
                const randomIndex = Math.floor(Math.random() * totalCards);
                spinTo(randomIndex);
            }
        }

        const hasTokens = balance > 0;

        // ИЗМЕНЕННАЯ ЛОГИКА:
        // Кнопка отключена, если:
        // 1. Идет анимация ИЛИ
        // 2. Идет запрос к серверу ИЛИ
        // 3. (requireTokens === true И токенов нет)
        const isButtonDisabled = isAnimating || isSpinning || (requireTokens && !hasTokens);

        const getButtonText = () => {
            // Если это профиль и нет токенов
            if (requireTokens && !hasTokens) return 'Нет токенов';

            // Если идет процесс
            if (isSpinning || isAnimating) return 'Вращение...';

            // В остальных случаях (Главная страница или Профиль с деньгами)
            return '🎰 Крутить барабан';
        }

        return (
            <div className={`relative w-full ${className}`}>
                <div
                    ref={containerRef}
                    className="relative mx-auto overflow-hidden"
                    style={{
                        height: dimensions.cardHeight + 80,
                        maxWidth: 1000,
                    }}
                >
                    {/* Arrows & Lights */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                        <div className="w-0 h-0 border-l-[min(12px,2vw)] border-r-[min(12px,2vw)] border-b-[min(16px,2.5vw)] border-l-transparent border-r-transparent border-b-red-500 drop-shadow-md" />
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                        <div className="w-0 h-0 border-l-[min(12px,2vw)] border-r-[min(12px,2vw)] border-t-[min(16px,2.5vw)] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-md" />
                    </div>
                    <div
                        className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-opacity duration-300"
                        style={{
                            width: dimensions.cardWidth + 20,
                            background: !isAnimating
                                ? 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.15), transparent)'
                                : 'transparent',
                            opacity: isAnimating ? 0 : 1
                        }}
                    />
                    {isAnimating && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {/* Cards Layer */}
                    {totalCards === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500 text-sm md:text-base">
                            Нет доступных призов
                        </div>
                    ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                            {visibleItems.map((item) => (
                                <div
                                    key={item.prize.id}
                                    className="absolute top-1/2 -translate-y-1/2"
                                    style={item.style}
                                >
                                    <div className={`w-full h-full shadow-lg rounded-lg overflow-hidden transition-all duration-300 ${item.isCenter ? 'ring-4 ring-yellow-400/50 shadow-2xl' : ''}`}>
                                        <PrizeCard
                                            id={item.prize.id}
                                            name={item.prize.name}
                                            description={item.prize.description}
                                            className="w-full h-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Controls */}
                {totalCards > 1 && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={handleSpinClick}
                            disabled={isButtonDisabled}
                            className={`
                px-6 py-3 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 active:scale-95 disabled:cursor-not-allowed
                ${requireTokens && !hasTokens
                                    ? 'bg-gray-300 text-gray-500' // Серый, если нет токенов и это профиль
                                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-xl hover:from-purple-700 hover:to-pink-700' // Обычный стиль
                                }
                ${(isSpinning || isAnimating) ? 'opacity-70' : ''}
              `}
                        >
                            {getButtonText()}
                        </button>
                    </div>
                )}

                {/* Info */}
                {currentPrize && (
                    <div className="mt-4 md:mt-6 mx-auto text-center p-3 md:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg md:rounded-xl border border-yellow-200 shadow-sm max-w-md transition-all">
                        <p className="text-xs md:text-sm text-gray-500 mb-1">🎯 Выбранный приз</p>
                        <p className="text-base md:text-xl font-bold text-gray-800">{currentPrize.name}</p>
                        <p className="text-sm md:text-base text-gray-600 mt-1 line-clamp-2">{currentPrize.description}</p>
                    </div>
                )}
            </div>
        )
    }
)

CarouselPrizes.displayName = 'CarouselPrizes'
export default CarouselPrizes