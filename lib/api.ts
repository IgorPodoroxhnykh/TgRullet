// lib/api.ts
import { Prize, PrizeFormData, ApiResponse } from '@/types/prize'

class ApiClient {
    private baseUrl = ''

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            })

            if (!response.ok) {
                const error = await response.text()
                return { success: false, error: `HTTP ${response.status}: ${error}` }
            }

            const data = await response.json()
            return { success: true, data }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            }
        }
    }

    // Получить все призы
    async getPrizes(): Promise<ApiResponse<Prize[]>> {
        return this.request<Prize[]>('/api/dashboard')
    }

    // Создать приз
    async createPrize(prizeData: PrizeFormData): Promise<ApiResponse<Prize>> {
        return this.request<Prize>('/api/dashboard', {
            method: 'POST',
            body: JSON.stringify(prizeData),
        })
    }

    // Обновить приз
    async updatePrize(
        id: string,
        updates: Partial<PrizeFormData>
    ): Promise<ApiResponse<Prize>> {
        return this.request<Prize>(`/api/dashboard/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        })
    }

    // Удалить приз
    async deletePrize(id: string): Promise<ApiResponse<void>> {
        return this.request<void>(`/api/dashboard/${id}`, {
            method: 'DELETE',
        })
    }
}

export const apiClient = new ApiClient()