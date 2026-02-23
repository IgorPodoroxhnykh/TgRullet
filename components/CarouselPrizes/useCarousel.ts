import { useState, useEffect, useRef, useCallback } from 'react'
import { CONFIG, easeInOutCubic, easeOutQuart } from './constants'
import { Prize } from '@/types/prize' // <--- Импортируем напрямую
import { Dimensions } from './types'

export const useCarousel = (prizes: Prize[], onPrizeSelect?: (prize: Prize) => void) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [virtualIndex, setVirtualIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const [animationPhase, setAnimationPhase] = useState<'idle' | 'spin' | 'return'>('idle')

    const animationRef = useRef<number | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const [dimensions, setDimensions] = useState<Dimensions>({
        width: 0,
        cardWidth: CONFIG.BASE_WIDTH,
        cardHeight: CONFIG.BASE_HEIGHT
    })

    const totalCards = prizes.length
    const cardSpacing = dimensions.cardWidth + CONFIG.GAP

    // --- Адаптивность ---
    useEffect(() => {
        const updateDimensions = () => {
            if (!containerRef.current) return
            const width = containerRef.current.clientWidth
            const cardWidth = Math.min(CONFIG.BASE_WIDTH, Math.max(CONFIG.MIN_WIDTH, width / 3.2))
            const cardHeight = Math.min(CONFIG.BASE_HEIGHT, Math.max(CONFIG.MIN_HEIGHT, cardWidth * 0.55))
            setDimensions({ width, cardWidth, cardHeight })
        }

        updateDimensions()
        const resizeObserver = new ResizeObserver(updateDimensions)
        if (containerRef.current) resizeObserver.observe(containerRef.current)
        return () => resizeObserver.disconnect()
    }, [])

    // --- Анимации ---
    const getPhysicalIndex = useCallback((vIndex: number) => {
        return ((vIndex % totalCards) + totalCards) % totalCards
    }, [totalCards])

    const animateReturn = useCallback((start: number, target: number, onComplete: () => void) => {
        let startTime: number | null = null
        const frame = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / CONFIG.RETURN_DURATION, 1)
            const eased = easeOutQuart(progress)
            setVirtualIndex(start + (target - start) * eased)
            if (progress < 1) {
                animationRef.current = requestAnimationFrame(frame)
            } else {
                setVirtualIndex(target)
                setAnimationPhase('idle')
                setIsAnimating(false)
                setCurrentIndex(getPhysicalIndex(target))
                onComplete()
            }
        }
        animationRef.current = requestAnimationFrame(frame)
    }, [getPhysicalIndex])

    const animateSpin = useCallback((targetVirtual: number, onComplete?: () => void) => {
        const start = virtualIndex
        let startTime: number | null = null
        const frame = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / CONFIG.ANIMATION_DURATION, 1)
            const eased = easeInOutCubic(progress)
            setVirtualIndex(start + (targetVirtual - start) * eased)
            if (progress < 1) {
                animationRef.current = requestAnimationFrame(frame)
            } else {
                setAnimationPhase('return')
                const fractional = targetVirtual - Math.floor(targetVirtual)
                if (fractional > 0.001) {
                    const returnTarget = Math.floor(targetVirtual) + 0.5
                    animateReturn(targetVirtual, returnTarget, () => onComplete?.())
                } else {
                    setAnimationPhase('idle')
                    setIsAnimating(false)
                    setCurrentIndex(getPhysicalIndex(targetVirtual))
                    onComplete?.()
                }
            }
        }
        animationRef.current = requestAnimationFrame(frame)
    }, [virtualIndex, animateReturn, getPhysicalIndex])

    // --- Public API ---
    const spinTo = useCallback((targetIndex: number) => {
        if (isAnimating || totalCards <= 1) return
        setIsAnimating(true)
        setAnimationPhase('spin')
        const currentPhysical = currentIndex
        const stepsToTarget = (targetIndex - currentPhysical + totalCards) % totalCards
        const totalSteps = stepsToTarget + CONFIG.FULL_CYCLES * totalCards
        const targetVirtual = virtualIndex + totalSteps
        animateSpin(targetVirtual, () => {
            onPrizeSelect?.(prizes[targetIndex])
        })
    }, [isAnimating, totalCards, currentIndex, virtualIndex, animateSpin, onPrizeSelect, prizes])

    // Очистка
    useEffect(() => {
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
        }
    }, [])

    // Обратная совместимость
    useEffect(() => {
        ; (window as any).__carouselSpinToPrize = spinTo
    }, [spinTo])

    // --- Расчет карточек ---
    const getCardItems = useCallback(() => {
        if (totalCards === 0) return []
        const displayIndex = virtualIndex
        const totalCircumference = totalCards * cardSpacing

        return prizes.map((prize, index) => {
            const rawPosition = (index - displayIndex) * cardSpacing
            const wrappedPosition = ((rawPosition % totalCircumference) + totalCircumference) % totalCircumference
            let visualPosition = wrappedPosition

            if (visualPosition > totalCircumference / 2) {
                visualPosition -= totalCircumference
            }

            const isVisible = Math.abs(visualPosition) < (cardSpacing * CONFIG.VISIBILITY_THRESHOLD)
            if (!isVisible) return null

            const dist = Math.abs(visualPosition)
            const scale = 1 - Math.min(dist / (cardSpacing * 2), CONFIG.SCALE_FACTOR)
            const opacity = 1 - Math.min(dist / (cardSpacing * 1.8), CONFIG.OPACITY_FACTOR)
            const blur = dist > cardSpacing ? 'blur(2px)' : 'blur(0px)'
            const zIndex = 50 - Math.floor(dist / 10)
            const isCenter = dist < cardSpacing * CONFIG.CENTER_THRESHOLD

            return {
                prize,
                style: {
                    width: dimensions.cardWidth,
                    height: dimensions.cardHeight,
                    transform: `translateX(${visualPosition}px) scale(${scale}) translateZ(0)`,
                    opacity,
                    filter: blur,
                    zIndex,
                },
                isCenter,
            }
        }).filter((item): item is NonNullable<typeof item> => item !== null)
    }, [prizes, totalCards, dimensions, cardSpacing, virtualIndex])

    const visibleItems = getCardItems()
    const currentPrize = prizes[currentIndex]

    return {
        containerRef,
        dimensions,
        isAnimating,
        animationPhase,
        totalCards,
        visibleItems,
        currentPrize,
        spinTo,
    }
}