'use client'
import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react'
import PrizeCard from '../PrizeCard'
import { useCarousel } from './useCarousel'
import { useCarouselSounds } from './useCarouselSounds'
import { ICarouselPrizesProps, CarouselRef } from './types'

const CarouselPrizes = forwardRef<CarouselRef, ICarouselPrizesProps>(
    ({ prizes, className = '', onPrizeSelect, onSpin, balance = 0, isSpinning = false, requireTokens = false }, ref) => {
        const [localSpinning, setLocalSpinning] = useState(false)
        const { playStartSound, playWrongSound, playStopSound } = useCarouselSounds()
        const hasTokens = balance > 0

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

        // Управление звуком вращения
        useEffect(() => {
            if (isAnimating && animationPhase === 'spin') {
                const audio = new Audio('/sounds/spin.mp3')
                audio.loop = true
                audio.play().catch(() => { })
                    ; (window as any).__spinAudio = audio
            } else if (!isAnimating && animationPhase === 'idle') {
                const audio = (window as any).__spinAudio as HTMLAudioElement
                if (audio) {
                    audio.pause()
                    audio.currentTime = 0
                }
                // Звук при остановке
                playStopSound()
            }
        }, [isAnimating, animationPhase, playStopSound])

        useImperativeHandle(ref, () => ({ spinTo }), [spinTo])

        const handleSpinClick = async () => {
            if (isAnimating || localSpinning) return

            if (requireTokens && !hasTokens) {
                playWrongSound()
                console.log('Нет токенов! balance:', balance)
                return
            }

            playStartSound()
            setLocalSpinning(true)

            const randomIndex = Math.floor(Math.random() * totalCards)
            spinTo(randomIndex)

            if (onSpin) {
                onSpin().finally(() => setLocalSpinning(false))
            } else {
                setTimeout(() => setLocalSpinning(false), 5000)
            }
        }

        const isButtonDisabled = isAnimating || localSpinning

        const buttonText = requireTokens && !hasTokens
            ? 'Нет токенов'
            : localSpinning || isAnimating
                ? 'Вращение...'
                : '🎰 Крутить барабан'

        const buttonClass = `
      px-6 py-3 text-white font-semibold rounded-xl shadow-lg 
      transition-all duration-200 active:scale-95 disabled:cursor-not-allowed
      ${requireTokens && !hasTokens
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-xl hover:from-purple-700 hover:to-pink-700'
            }
      ${(localSpinning || isAnimating) ? 'opacity-70' : ''}
    `

        return (
            <div className={`relative w-full ${className}`}>
                <div
                    ref={containerRef}
                    className="relative mx-auto overflow-hidden"
                    style={{ height: dimensions.cardHeight + 80, maxWidth: 1000 }}
                >
                    {/* Arrow Top */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                        <div className="w-0 h-0 border-l-[min(12px,2vw)] border-r-[min(12px,2vw)] border-b-[min(16px,2.5vw)] border-l-transparent border-r-transparent border-b-red-500 drop-shadow-md" />
                    </div>

                    {/* Arrow Bottom */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                        <div className="w-0 h-0 border-l-[min(12px,2vw)] border-r-[min(12px,2vw)] border-t-[min(16px,2.5vw)] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-md" />
                    </div>

                    {/* Light Effect */}
                    <div
                        className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-opacity duration-300"
                        style={{
                            width: dimensions.cardWidth + 20,
                            background: !isAnimating ? 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.15), transparent)' : 'transparent',
                            opacity: isAnimating ? 0 : 1
                        }}
                    />

                    {/* Loading Spinner */}
                    {isAnimating && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {/* Cards */}
                    {totalCards === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-500">Нет доступных призов</div>
                    ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                            {visibleItems.map((item) => (
                                <div key={item.prize.id} className="absolute top-1/2 -translate-y-1/2" style={item.style}>
                                    <div className={`w-full h-full shadow-lg rounded-lg overflow-hidden transition-all duration-300 ${item.isCenter ? 'ring-4 ring-yellow-400/50 shadow-2xl' : ''}`}>
                                        <PrizeCard
                                            id={item.prize.id}
                                            name={item.prize.name}
                                            description={item.prize.description}
                                            imageUrl={item.prize.imageUrl}
                                            className="w-full h-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Button */}
                {totalCards > 1 && (
                    <div className="flex justify-center mt-4">
                        <button onClick={handleSpinClick} disabled={isButtonDisabled} className={buttonClass}>
                            {buttonText}
                        </button>
                    </div>
                )}

                {/* Info */}
                {currentPrize && (
                    <div className="mt-4 md:mt-6 mx-auto text-center p-3 md:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg md:rounded-xl border border-yellow-200 shadow-sm max-w-md">
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