// types/prize.ts
export interface Prize {
    id: string
    name: string
    description: string
    imageUrl?: string | null
    probability: number
    totalCount: number
    redeemedCount: number
    isActive: boolean
    createdAt: string
    updatedAt: string
    isValuable: boolean
}

export interface PrizeFormData {
    name: string
    description: string
    imageFile?: File | null
    imageUrl?: string
    imageHash?: string        // Добавляем хеш
    existingImageUrl?: string // Добавляем существующий URL
    probability: number
    totalCount: number
    isActive: boolean
    isValuable: boolean
}

// ✅ Добавляем экспорт ApiResponse
export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
}