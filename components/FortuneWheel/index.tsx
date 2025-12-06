'use client'

import React from "react";
import Header from "./Header";
import WheelControls from "./WheelControls";
import WheelVisuals from "./WheelVisuals";
import WheelResult from "./WheelResult";
import { useFortuneWheel } from "./useFortuneWheel";
import { defaultCards } from "./constants";
import { FortuneWheelProps } from "./types";
import { useWheelStore } from "@/stores/wheelStore";

export default function FortuneWheel({
    cards = defaultCards,
    title = "Наши услуги",
    subtitle = "Полный спектр решений для digital-продвижения вашего бизнеса",
    className = "",
}: FortuneWheelProps) {
    const { currentIndex, isSpinning } = useWheelStore();
    const { api, setApi, spinWheel } = useFortuneWheel(cards);

    return (
        <div className={`w-full max-w-7xl mx-auto px-4 py-12 ${className}`}>
            {/* Заголовок */}
            <Header title={title} subtitle={subtitle} />

            {/* Кнопка вращения - управляется через store */}
            <WheelControls />

            {/* Карусель */}
            <WheelVisuals
                cards={cards}
                api={api}
                setApi={setApi}
                currentIndex={currentIndex}
                isSpinning={isSpinning} spinDuration={0} />

            {/* Результат вращения - управляется через store */}
            <WheelResult />
        </div>
    );
}