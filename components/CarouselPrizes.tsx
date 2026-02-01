'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PrizeCard from './PrizeCard';

interface IPrize {
    id: string;
    name: string;
    description: string;
    redeemedCount?: number;
    expiryDate?: string;
}

interface ICarouselPrizesProps {
    prizes: IPrize[];
    className?: string;
    showControls?: boolean;
    onPrizeSelect?: (prize: IPrize) => void;
}

const CARD_GAP = 16;

// Easing функции
const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const easeOutQuart = (t: number): number => {
    return 1 - Math.pow(1 - t, 4);
};

const CarouselPrizes: React.FC<ICarouselPrizesProps> = ({
    prizes,
    className = '',
    showControls = true,
    onPrizeSelect,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    // Виртуальный индекс — плавно увеличивается, никогда не сбрасывается резко
    const [virtualIndex, setVirtualIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);
    const [animationPhase, setAnimationPhase] = useState<'idle' | 'spin' | 'return'>('idle');

    const animationRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [cardSize, setCardSize] = useState({ width: 220, height: 120 });

    const totalCards = prizes.length;

    // Адаптивный расчет размеров
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const width = containerRef.current.clientWidth;
                setContainerWidth(width);

                const cardWidth = Math.min(220, Math.max(140, width / 3.2));
                const cardHeight = Math.min(120, Math.max(80, cardWidth * 0.55));

                setCardSize({ width: cardWidth, height: cardHeight });
            }
        };

        updateDimensions();

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect) {
                    updateDimensions();
                }
            }
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

    const cardSpacing = cardSize.width + CARD_GAP;

    // Получить физический индекс из виртуального (с зацикливанием)
    const getPhysicalIndex = useCallback((vIndex: number) => {
        const normalized = ((vIndex % totalCards) + totalCards) % totalCards;
        return normalized;
    }, [totalCards]);

    // Получить дробную часть виртуального индекса (это и есть scrollProgress)
    const getFractionalPart = useCallback((vIndex: number) => {
        return vIndex - Math.floor(vIndex);
    }, []);

    // Плавный возврат к целому индексу
    const animateReturn = useCallback((startVirtualIndex: number, targetVirtualIndex: number, onComplete: () => void) => {
        const duration = 400;
        let startTime: number | null = null;

        const animateFrame = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easedProgress = easeOutQuart(progress);

            // Плавно интерполируем от startVirtualIndex к targetVirtualIndex
            const currentVirtualIndex = startVirtualIndex + (targetVirtualIndex - startVirtualIndex) * easedProgress;
            setVirtualIndex(currentVirtualIndex);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animateFrame);
            } else {
                setVirtualIndex(targetVirtualIndex);
                setAnimationPhase('idle');
                setIsAnimating(false);

                // Обновляем currentIndex только в самом конце
                const finalPhysicalIndex = getPhysicalIndex(targetVirtualIndex);
                setCurrentIndex(finalPhysicalIndex);
                onComplete();
            }
        };

        animationRef.current = requestAnimationFrame(animateFrame);
    }, [getPhysicalIndex]);

    // Основная функция анимации вращения
    const animate = useCallback((
        targetVirtualIndex: number,
        onComplete?: () => void
    ) => {
        const startVirtualIndex = virtualIndex;
        const duration = 2500;
        let startTime: number | null = null;

        const animateFrame = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easedProgress = easeInOutCubic(progress);
            const currentVirtualIndex = startVirtualIndex + (targetVirtualIndex - startVirtualIndex) * easedProgress;

            setVirtualIndex(currentVirtualIndex);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animateFrame);
            } else {
                // Анимация вращения завершена, начинаем плавный возврат к целому индексу
                setAnimationPhase('return');

                const finalFractional = getFractionalPart(targetVirtualIndex);

                // Если есть дробная часть, возвращаемся к целому значению
                if (finalFractional > 0.001) {
                    const returnTarget = Math.floor(targetVirtualIndex) + 0.5;
                    animateReturn(targetVirtualIndex, returnTarget, () => {
                        if (onComplete) onComplete();
                    });
                } else {
                    setAnimationPhase('idle');
                    setIsAnimating(false);
                    const finalPhysicalIndex = getPhysicalIndex(targetVirtualIndex);
                    setCurrentIndex(finalPhysicalIndex);
                    if (onComplete) onComplete();
                }
            }
        };

        animationRef.current = requestAnimationFrame(animateFrame);
    }, [virtualIndex, animateReturn, getFractionalPart, getPhysicalIndex]);

    // Быстрая прокрутка на 1 карточку
    const spinFast = useCallback((direction: 1 | -1) => {
        if (isAnimating || totalCards <= 1) return;
        setIsAnimating(true);
        setAnimationPhase('spin');

        const nextPhysicalIndex = (currentIndex + direction + totalCards) % totalCards;
        const nextVirtualIndex = virtualIndex + direction;

        animate(nextVirtualIndex, () => {
            onPrizeSelect?.(prizes[nextPhysicalIndex]);
        });
    }, [isAnimating, totalCards, currentIndex, virtualIndex, animate, onPrizeSelect, prizes]);

    // Медленная прокрутка на 3 цикла
    const spinSlow = useCallback((targetPrizeIndex: number) => {
        if (isAnimating || totalCards <= 1) return;
        setIsAnimating(true);
        setAnimationPhase('spin');

        // Вычисляем сколько шагов нужно прокрутить
        const currentPhysicalIndex = currentIndex;
        let stepsToTarget = (targetPrizeIndex - currentPhysicalIndex + totalCards) % totalCards;

        const fullCycles = 3;
        const totalSteps = stepsToTarget + fullCycles * totalCards;

        // Целевой виртуальный индекс
        const targetVirtualIndex = virtualIndex + totalSteps;

        animate(targetVirtualIndex, () => {
            onPrizeSelect?.(prizes[targetPrizeIndex]);
        });
    }, [isAnimating, totalCards, currentIndex, virtualIndex, animate, onPrizeSelect, prizes]);

    // Экспонируем метод
    useEffect(() => {
        (window as any).__carouselSpinToPrize = spinSlow;
    }, [spinSlow]);

    const spinNext = useCallback(() => spinFast(1), [spinFast]);
    const spinPrevious = useCallback(() => spinFast(-1), [spinFast]);

    // Очистка анимации
    useEffect(() => {
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    // Генерация стилей для карточек
    const getCardItems = useCallback(() => {
        if (totalCards === 0) return [];

        // Используем виртуальный индекс для позиционирования
        const displayIndex = virtualIndex;
        const totalCircumference = totalCards * cardSpacing;

        return prizes.map((prize, index) => {
            // Позиция относительно виртуального центра
            const rawPosition = (index - displayIndex) * cardSpacing;

            // Логика зацикливания
            const wrappedPosition = ((rawPosition % totalCircumference) + totalCircumference) % totalCircumference;

            let visualPosition = wrappedPosition;
            if (visualPosition > totalCircumference / 2) {
                visualPosition -= totalCircumference;
            }

            const isVisible = Math.abs(visualPosition) < (cardSpacing * 2.5);
            if (!isVisible) return null;

            const dist = Math.abs(visualPosition);
            const translateX = visualPosition;

            const scale = 1 - Math.min(dist / (cardSpacing * 2), 0.4);
            const opacity = 1 - Math.min(dist / (cardSpacing * 1.8), 0.6);
            const blur = dist > cardSpacing ? 'blur(2px)' : 'blur(0px)';
            const zIndex = 50 - Math.floor(dist / 10);
            const isCenter = dist < cardSpacing * 0.3;

            return {
                prize,
                style: {
                    width: cardSize.width,
                    height: cardSize.height,
                    transform: `translateX(${translateX}px) scale(${scale}) translateZ(0)`,
                    opacity,
                    filter: blur,
                    zIndex,
                },
                isCenter,
            };
        }).filter((item): item is NonNullable<typeof item> => item !== null);
    }, [prizes, totalCards, cardSize, cardSpacing, virtualIndex]);

    const visibleItems = getCardItems();
    const currentPrize = prizes[currentIndex];

    return (
        <div className={`relative w-full ${className}`}>
            <div
                ref={containerRef}
                className="relative mx-auto overflow-hidden"
                style={{
                    height: cardSize.height + 80,
                    maxWidth: 1000,
                }}
            >
                {/* Красная стрелка сверху */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                    <div
                        className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[16px] border-l-transparent border-r-transparent border-b-red-500 drop-shadow-md"
                        style={{
                            borderLeftWidth: 'min(12px, 2vw)',
                            borderRightWidth: 'min(12px, 2vw)',
                            borderBottomWidth: 'min(16px, 2.5vw)'
                        }}
                    />
                </div>

                {/* Красная стрелка снизу */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                    <div
                        className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[16px] border-l-transparent border-r-transparent border-t-red-500 drop-shadow-md"
                        style={{
                            borderLeftWidth: 'min(12px, 2vw)',
                            borderRightWidth: 'min(12px, 2vw)',
                            borderTopWidth: 'min(16px, 2.5vw)'
                        }}
                    />
                </div>

                {/* Подсветка центра */}
                <div
                    className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-opacity duration-300"
                    style={{
                        width: cardSize.width + 20,
                        background: !isAnimating
                            ? 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.15), transparent)'
                            : 'transparent',
                        opacity: isAnimating ? 0 : 1
                    }}
                />

                {/* Индикатор вращения */}
                {isAnimating && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
                        <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Слой с карточками */}
                {prizes.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm md:text-base">
                        Нет доступных призов
                    </div>
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                        {visibleItems.map((item) => {
                            if (!item) return null;
                            return (
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
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Кнопки управления */}
            {showControls && totalCards > 1 && (
                <div className="flex justify-center gap-3 md:gap-4 mt-4 md:mt-6 px-2">
                    <button
                        onClick={spinPrevious}
                        disabled={isAnimating}
                        className="px-4 py-2 md:px-8 md:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:from-blue-700 hover:to-blue-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base flex items-center gap-2"
                    >
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden sm:inline">Предыдущий</span>
                        <span className="sm:hidden">Назад</span>
                    </button>
                    <button
                        onClick={spinNext}
                        disabled={isAnimating}
                        className="px-4 py-2 md:px-8 md:py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:from-green-700 hover:to-green-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base flex items-center gap-2"
                    >
                        <span className="hidden sm:inline">Следующий</span>
                        <span className="sm:hidden">Далее</span>
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Кнопка прокрутки */}
            {totalCards > 1 && (
                <div className="flex justify-center mt-4">
                    <button
                        onClick={() => {
                            const randomIndex = Math.floor(Math.random() * totalCards);
                            spinSlow(randomIndex);
                        }}
                        disabled={isAnimating}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:from-purple-700 hover:to-pink-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        🎰 Крутить барабан
                    </button>
                </div>
            )}

            {/* Информация о текущем призе */}
            {currentPrize && (
                <div className="mt-4 md:mt-6 mx-auto text-center p-3 md:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg md:rounded-xl border border-yellow-200 shadow-sm max-w-md transition-all">
                    <p className="text-xs md:text-sm text-gray-500 mb-1">🎯 Выбранный приз</p>
                    <p className="text-base md:text-xl font-bold text-gray-800">{currentPrize.name}</p>
                    <p className="text-sm md:text-base text-gray-600 mt-1 line-clamp-2">{currentPrize.description}</p>
                </div>
            )}
        </div>
    );
};

export default CarouselPrizes;




