import { Prize } from '@/types/prize'

/**
 * Выбирает приз на основе вероятности
 * Если сумма вероятностей > 100%, выполняется нормализация
 */
export function selectPrizeByProbability(prizes: Prize[]): { prize: Prize; index: number } {
    // Фильтруем только активные призы
    const activePrizes = prizes
        .map((prize, index) => ({ prize, index }))
        .filter(({ prize }) => prize.isActive)

    if (activePrizes.length === 0) {
        return { prize: prizes[0], index: 0 }
    }

    // Вычисляем общую сумму вероятностей
    const totalProbability = activePrizes.reduce((sum, { prize }) => sum + prize.probability, 0)

    // Генерируем случайное число от 0 до totalProbability
    const random = Math.random() * totalProbability

    // Проходим по призам, накапливая вероятность
    let cumulative = 0
    for (const { prize, index } of activePrizes) {
        cumulative += prize.probability
        if (random <= cumulative) {
            return { prize, index }
        }
    }

    // На всякий случай возвращаем последний приз
    const last = activePrizes[activePrizes.length - 1]
    return { prize: last.prize, index: last.index }
}

/**
 * Возвращает нормализованные вероятности для всех призов (в процентах)
 * Если сумма > 100%, каждый приз получает пропорциональную долю
 */
export function getNormalizedProbabilities(prizes: Prize[]): Map<string, number> {
    const activePrizes = prizes.filter(p => p.isActive)
    const total = activePrizes.reduce((sum, p) => sum + p.probability, 0)

    const result = new Map<string, number>()
    activePrizes.forEach(prize => {
        const normalized = total > 0 ? (prize.probability / total) * 100 : 0
        result.set(prize.id, normalized)
    })

    return result
}

/**
 * Возвращает нормализованную вероятность для конкретного приза
 */
export function getPrizeNormalizedProbability(prize: Prize, allPrizes: Prize[]): number {
    const activePrizes = allPrizes.filter(p => p.isActive)
    const total = activePrizes.reduce((sum, p) => sum + p.probability, 0)

    if (total === 0) return 0
    return (prize.probability / total) * 100
} ''