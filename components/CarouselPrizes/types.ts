import { Prize } from '@/types/prize';

export interface Dimensions {
    width: number;
    cardWidth: number;
    cardHeight: number;
}

export interface CarouselRef {
    spinTo: (index: number) => void;
}

export interface ICarouselPrizesProps {
    prizes: Prize[];
    className?: string;
    onPrizeSelect?: (prize: Prize) => void;

    // Логика токенов
    onSpin?: () => Promise<boolean>;
    balance?: number;
    isSpinning?: boolean;

    // НОВЫЙ ПРОП: Требовать ли токены для вращения?
    requireTokens?: boolean;
}