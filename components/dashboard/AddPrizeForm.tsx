// components/dashboard/AddPrizeForm.tsx
'use client'

import { useState } from 'react'
import { PrizeFormData } from '@/types/prize'

interface AddPrizeFormProps {
    onSubmit: (data: PrizeFormData) => Promise<{ success: boolean; error?: string }>
    onClose: () => void
}

export default function AddPrizeForm({ onSubmit, onClose }: AddPrizeFormProps) {
    const [formData, setFormData] = useState<PrizeFormData>({
        name: '',
        description: '',
        imageUrl: undefined,  // ← Меняем с '' на undefined
        probability: 0.01,
        totalCount: 0,
        isActive: true
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim() || !formData.description.trim()) {
            alert('Пожалуйста, заполните обязательные поля')
            return
        }

        setIsSubmitting(true)

        try {
            const result = await onSubmit(formData)

            if (result.success) {
                onClose()
            } else {
                alert(`Ошибка: ${result.error}`)
            }
        } catch (error) {
            console.error('Ошибка формы:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Добавить новый приз</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Название *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Описание *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            rows={3}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">URL изображения</label>
                        <input
                            type="url"
                            value={formData.imageUrl || ''}  // ← Приводим undefined к пустой строке
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value || undefined })}
                            className="w-full border rounded px-3 py-2"
                            placeholder="https://..."
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Вероятность выпадения (0-100%)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={(formData.probability * 100).toFixed(2)}
                            onChange={(e) => setFormData({
                                ...formData,
                                probability: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) / 100
                            })}
                            className="w-full border rounded px-3 py-2"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Общее количество</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.totalCount}
                            onChange={(e) => setFormData({
                                ...formData,
                                totalCount: Math.max(0, parseInt(e.target.value) || 0)
                            })}
                            className="w-full border rounded px-3 py-2"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="mr-2"
                            disabled={isSubmitting}
                        />
                        <label className="text-sm">Активен</label>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Создание...
                                </>
                            ) : (
                                'Создать'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 
                         disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}