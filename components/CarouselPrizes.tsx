import React, { useState, useEffect } from 'react';
import PrizeCard, { IPrizeCardProps } from './PrizeCard';

interface ICarouselPrizesProps {
    prizes: Omit<IPrizeCardProps, 'className'>[];
    className?: string;
    showControls?: boolean;
    autoPlay?: boolean;
    autoPlayInterval?: number;
}

const CarouselPrizesSequential: React.FC<ICarouselPrizesProps> = ({
    prizes,
    className = '',
    showControls = true,
    autoPlay = false,
    autoPlayInterval = 5000,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleCards, setVisibleCards] = useState<number[]>([0, 1, 2]);

    // Автоплей
    useEffect(() => {
        if (!autoPlay || prizes.length <= 1) return;

        const interval = setInterval(() => {
            goToNext();
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [autoPlay, autoPlayInterval, prizes.length, currentIndex]);

    // Обновляем видимые карточки при изменении currentIndex
    useEffect(() => {
        updateVisibleCards();
    }, [currentIndex, prizes.length]);

    const updateVisibleCards = () => {
        const total = prizes.length;
        if (total === 0) return;

        const newVisibleCards = [];

        // Всегда показываем 3 карточки
        for (let i = -1; i <= 1; i++) {
            let index = currentIndex + i;

            // Корректируем индексы для кругового поведения
            if (index < 0) {
                index = total + index;
            } else if (index >= total) {
                index = index % total;
            }

            newVisibleCards.push(index);
        }

        setVisibleCards(newVisibleCards);
    };

    const goToPrevious = () => {
        if (prizes.length <= 1) return;

        setCurrentIndex((prevIndex) => {
            return prevIndex === 0 ? prizes.length - 1 : prevIndex - 1;
        });
    };

    const goToNext = () => {
        if (prizes.length <= 1) return;

        setCurrentIndex((prevIndex) => {
            return prevIndex === prizes.length - 1 ? 0 : prevIndex + 1;
        });
    };

    // Стили для каждой позиции
    const getCardPosition = (positionIndex: number) => {
        const positions = [
            { // Левая карточка
                translateX: '-110%',
                scale: '0.85',
                opacity: '0.7',
                zIndex: 20
            },
            { // Центральная карточка
                translateX: '0%',
                scale: '1',
                opacity: '1',
                zIndex: 30
            },
            { // Правая карточка
                translateX: '110%',
                scale: '0.85',
                opacity: '0.7',
                zIndex: 20
            }
        ];

        return positions[positionIndex];
    };

    return (
        <div className={`relative ${className}`}>
            {/* Контейнер с карточками */}
            <div className="flex justify-center items-center overflow-hidden relative min-h-[250px]">
                {prizes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 w-full">
                        Нет доступных призов
                    </div>
                ) : (
                    visibleCards.map((prizeIndex, positionIndex) => {
                        const prize = prizes[prizeIndex];
                        const position = getCardPosition(positionIndex);

                        return (
                            <div
                                key={`${prize.id}-${positionIndex}`}
                                className="absolute w-64 transition-all duration-300 ease-in-out"
                                style={{
                                    transform: `translateX(${position.translateX}) scale(${position.scale})`,
                                    opacity: position.opacity,
                                    zIndex: position.zIndex,
                                }}
                            >
                                <PrizeCard
                                    {...prize}
                                    className="w-full h-full"
                                />
                            </div>
                        );
                    })
                )}
            </div>

            {/* Кнопки навигации */}
            {showControls && prizes.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-40 
                                 bg-white rounded-full p-3 md:p-4 shadow-lg hover:shadow-xl 
                                 transition-all duration-200 hover:bg-gray-50 active:scale-95"
                        aria-label="Предыдущий приз"
                    >
                        <svg className="w-6 h-6 md:w-7 md:h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-40 
                                 bg-white rounded-full p-3 md:p-4 shadow-lg hover:shadow-xl 
                                 transition-all duration-200 hover:bg-gray-50 active:scale-95"
                        aria-label="Следующий приз"
                    >
                        <svg className="w-6 h-6 md:w-7 md:h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

        </div>
    );
};

export default CarouselPrizesSequential;