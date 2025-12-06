import { create } from "zustand";
import { CardData } from "@/components/FortuneWheel/types";

interface WheelState {
    // Состояние
    isSpinning: boolean;
    currentIndex: number;
    selectedCard: CardData | null;
    showResult: boolean;

    //  Действия
    startSpinning: () => void;
    stopSpinning: (card: CardData) => void;
    updateCurrentIndex: (index: number) => void;
    resetWheel: () => void;
    setShowResult: (show: boolean) => void;
}

export const useWheelStore = create<WheelState>((set) => ({
    // Начальное состояние
    isSpinning: false,
    currentIndex: 0,
    selectedCard: null,
    showResult: false,

    // Действия
    startSpinning: () => set({
        isSpinning: true,
        showResult: false,
        selectedCard: null,
    }),
    stopSpinning: (card) => set({
        isSpinning: false,
        selectedCard: card,
    }),

    updateCurrentIndex: (index) => set({ currentIndex: index }),

    resetWheel: () => set({
        isSpinning: false,
        selectedCard: null,
        showResult: false,
    }),

    setShowResult: (show) => set({ showResult: show }),
}));