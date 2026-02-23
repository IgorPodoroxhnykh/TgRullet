import { useRef, useEffect } from 'react';

interface UseCarouselSoundsReturn {
    playStartSound: () => void;
    playWrongSound: () => void;
}

export const useCarouselSounds = (): UseCarouselSoundsReturn => {
    const startSoundRef = useRef<HTMLAudioElement | null>(null);
    const spinSoundRef = useRef<HTMLAudioElement | null>(null);
    const wrongSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        startSoundRef.current = new Audio('/sounds/start.mp3');
        spinSoundRef.current = new Audio('/sounds/spin.mp3');
        wrongSoundRef.current = new Audio('/sounds/wrong.mp3');

        if (spinSoundRef.current) {
            spinSoundRef.current.loop = true;
        }

        return () => {
            startSoundRef.current?.pause();
            spinSoundRef.current?.pause();
            wrongSoundRef.current?.pause();
        };
    }, []);

    // Функция для управления звуком вращения извне
    useEffect(() => {
        // Этот эффект можно использовать для управления spinSoundRef из родителя
        // если нужно, но сейчас он не используется - звук управляется в основном компоненте
    }, []);

    const playStartSound = () => {
        startSoundRef.current?.play().catch(() => { });
    };

    const playWrongSound = () => {
        wrongSoundRef.current?.play().catch(() => { });
    };

    return {
        playStartSound,
        playWrongSound,
    };
};