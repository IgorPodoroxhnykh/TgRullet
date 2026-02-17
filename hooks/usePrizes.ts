
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Prize, PrizeFormData } from '@/types/prize'
import { apiClient } from '@/lib/api'
// Импортируем утилиты из новой папки lib
import { validatePrizeData } from '@/lib/prize-utils'

interface UsePrizesReturn {
    prizes: Prize[]
    loading: boolean
    error: string | null
    addPrize: (data: PrizeFormData) => Promise<{ success: boolean; error?: string }>
    updatePrize: (id: string, updates: Partial<PrizeFormData>) => Promise<{ success: boolean; error?: string }>
    deletePrize: (id: string) => Promise<{ success: boolean; error?: string }>
    refetch: () => Promise<void>
}

export function usePrizes(): UsePrizesReturn {
    const [prizes, setPrizes] = useState<Prize[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchPrizes = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const result = await apiClient.getPrizes()

            if (result.success && result.data) {
                setPrizes(result.data)
            } else {
                const errorMsg = result.error || 'Ошибка загрузки призов'
                setError(errorMsg)
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Ошибка сети'
            setError(errorMsg)
        } finally {
            setLoading(false)
        }
    }, [])

    const addPrize = useCallback(async (prizeData: PrizeFormData) => {
        // Используем вынесенную валидацию
        const validation = validatePrizeData(prizeData)
        if (!validation.isValid) {
            return { success: false, error: validation.errors.join(', ') }
        }

        try {
            const result = await apiClient.createPrize(prizeData)
            if (result.success) {
                await fetchPrizes()
                return { success: true }
            }
            return { success: false, error: result.error }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Ошибка добавления приза'
            return { success: false, error: errorMsg }
        }
    }, [fetchPrizes])

    const updatePrize = useCallback(async (id: string, updates: Partial<PrizeFormData>) => {
        // Используем вынесенную валидацию
        const validation = validatePrizeData(updates)
        if (!validation.isValid) {
            return { success: false, error: validation.errors.join(', ') }
        }

        const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
            if (value !== null && value !== '') {
                acc[key as keyof PrizeFormData] = value as any
            }
            return acc
        }, {} as Partial<PrizeFormData>)

        if (Object.keys(cleanUpdates).length === 0) {
            return { success: false, error: 'Нет данных для обновления' }
        }

        try {
            const result = await apiClient.updatePrize(id, cleanUpdates)
            if (result.success) {
                await fetchPrizes()
                return { success: true }
            }
            return { success: false, error: result.error }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Ошибка обновления приза'
            return { success: false, error: errorMsg }
        }
    }, [fetchPrizes])

    const deletePrize = useCallback(async (id: string) => {
        try {
            const result = await apiClient.deletePrize(id)
            if (result.success) {
                await fetchPrizes()
                return { success: true }
            }
            return { success: false, error: result.error }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Ошибка удаления приза'
            return { success: false, error: errorMsg }
        }
    }, [fetchPrizes])

    useEffect(() => {
        fetchPrizes()
    }, [fetchPrizes])

    return {
        prizes,
        loading,
        error,
        addPrize,
        updatePrize,
        deletePrize,
        refetch: fetchPrizes
    }
}