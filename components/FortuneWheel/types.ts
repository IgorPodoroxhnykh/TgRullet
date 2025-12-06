export interface CardData {
    id: number;
    title: string;
    description: string;
    imageUrl?: string;
}

export interface FortuneWheelProps {
    cards?: CardData[];
    title?: string;
    subtitle?: string;
    className?: string;
    spinDuration?: number;
    minSpins?: number;
    maxSpins?: number;
}

export interface WheelState {
    isSpinning: boolean;
    currentIndex: number;
    selectedCard: CardData | null;
    showResult: boolean;
    targetIndex: number; // Добавляем целевой индекс
}