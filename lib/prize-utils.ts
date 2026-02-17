import { PrizeFormData } from '@/types/prize'

export const formatProbability = (probability: number): string => {
    return `${(probability * 100).toFixed(2)}%`
}

export const validatePrizeData = (data: Partial<PrizeFormData>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!data.name?.trim()) {
        errors.push('Название приза обязательно')
    }
    if (!data.description?.trim()) {
        errors.push('Описание приза обязательно')
    }
    if (data.probability !== undefined) {
        if (data.probability < 0 || data.probability > 1) {
            errors.push('Вероятность должна быть от 0 до 100%')
        }
    }
    if (data.totalCount !== undefined) {
        if (data.totalCount < 0) {
            errors.push('Количество не может быть отрицательным')
        }
    }
    if (data.imageUrl && data.imageUrl.trim()) {
        try {
            new URL(data.imageUrl)
        } catch {
            errors.push('Некорректный URL изображения')
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}