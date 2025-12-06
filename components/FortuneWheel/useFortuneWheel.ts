import { useEffect, useRef, useState } from "react";
import { CarouselApi } from "@/components/ui/carousel";
import { CardData } from "./types";
import { useWheelStore } from "@/stores/wheelStore";

export const useFortuneWheel = (cards: CardData[]) => {
    const {
        isSpinning,
        startSpinning,
        stopSpinning,
        updateCurrentIndex,
        setShowResult
    } = useWheelStore();

    const [api, setApi] = useState<CarouselApi>();
    const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Инициализация API карусели
    useEffect(() => {
        if (!api) return;

        const onSelect = () => {
            const currentIndex = api.selectedScrollSnap();
            updateCurrentIndex(currentIndex);
        };

        api.on("select", onSelect);
        onSelect();

        return () => {
            api.off("select", onSelect);
        };
    }, [api, updateCurrentIndex]);

    // Очистка интервала
    useEffect(() => {
        return () => {
            if (spinIntervalRef.current) {
                clearInterval(spinIntervalRef.current);
            }
        };
    }, []);

    const spinWheel = () => {
        if (isSpinning || !api) return;

        const currentIndex = api.selectedScrollSnap();
        const targetIndex = Math.floor(Math.random() * cards.length);
        const targetCard = cards[targetIndex];

        // Начинаем вращение через store
        startSpinning();

        // Рассчитываем количество шагов
        const spins = 5 + Math.floor(Math.random() * 2);
        const stepsToTarget = (targetIndex - currentIndex + cards.length) % cards.length;
        const totalSteps = spins * cards.length + stepsToTarget;

        let step = 0;
        let delay = 15;

        const stepFunction = () => {
            if (step < totalSteps) {
                api.scrollNext();
                step++;

                // Плавное замедление
                const progress = step / totalSteps;
                if (progress < 0.7) {
                    delay = 15;
                } else if (progress < 0.9) {
                    delay = 15 + (progress - 0.7) * 85;
                } else {
                    delay = 32 + (progress - 0.9) * 168;
                }

                spinIntervalRef.current = setTimeout(stepFunction, delay);
            } else {
                // Останавливаем вращение через store
                stopSpinning(targetCard);

                // Показать результат с задержкой
                setTimeout(() => {
                    setShowResult(true);
                }, 1500);
            }
        };

        stepFunction();
    };

    return {
        api,
        setApi,
        spinWheel,
        isSpinning,
    };
};