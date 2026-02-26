import { useRef, useEffect } from 'react'

interface UseCarouselSoundsReturn {
    playStartSound: () => void
    playWrongSound: () => void
    playStopSound: () => void
}

export const useCarouselSounds = (): UseCarouselSoundsReturn => {
    const startSoundRef = useRef<HTMLAudioElement | null>(null)
    const spinSoundRef = useRef<HTMLAudioElement | null>(null)
    const wrongSoundRef = useRef<HTMLAudioElement | null>(null)
    const stopSoundRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        startSoundRef.current = new Audio('/sounds/start.mp3')
        spinSoundRef.current = new Audio('/sounds/spin.mp3')
        wrongSoundRef.current = new Audio('/sounds/wrong.mp3')
        stopSoundRef.current = new Audio('/sounds/stop.mp3')

        if (spinSoundRef.current) {
            spinSoundRef.current.loop = true
        }

        return () => {
            startSoundRef.current?.pause()
            spinSoundRef.current?.pause()
            wrongSoundRef.current?.pause()
            stopSoundRef.current?.pause()
        }
    }, [])

    const playStartSound = () => {
        startSoundRef.current?.play().catch(() => { })
    }

    const playWrongSound = () => {
        wrongSoundRef.current?.play().catch(() => { })
    }

    const playStopSound = () => {
        stopSoundRef.current?.play().catch(() => { })
    }

    return {
        playStartSound,
        playWrongSound,
        playStopSound,
    }
}