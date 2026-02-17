// components/dashboard/PrizeTable.tsx
'use client'

import { useState } from 'react'
import { Prize, PrizeFormData } from '@/types/prize'
import PrizeRow from './PrizeRow'

interface PrizeTableProps {
    prizes: Prize[]
    onUpdate: (id: string, updates: Partial<PrizeFormData>) => Promise<{ success: boolean; error?: string }>  // ← Меняем тип
    onDelete: (id: string) => Promise<{ success: boolean; error?: string }>
}

export default function PrizeTable({ prizes, onUpdate, onDelete }: PrizeTableProps) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editData, setEditData] = useState<Partial<Prize>>({})
    const [saving, setSaving] = useState<string | null>(null)

    const handleEdit = (prize: Prize) => {
        setEditingId(prize.id)
        setEditData({
            name: prize.name,
            description: prize.description,
            imageUrl: prize.imageUrl || '',
            probability: prize.probability,
            totalCount: prize.totalCount,
            isActive: prize.isActive
        })
    }

    const handleSave = async (id: string) => {
        setSaving(id)
        try {
            const result = await onUpdate(id, editData)
            if (result.success) {
                setEditingId(null)
                setEditData({})
            } else {
                alert(`Ошибка сохранения: ${result.error}`)
            }
        } finally {
            setSaving(null)
        }
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditData({})
    }

    const handleDelete = async (id: string) => {
        if (confirm('Удалить этот приз? Это действие нельзя отменить.')) {
            const result = await onDelete(id)
            if (!result.success) {
                alert(`Ошибка удаления: ${result.error}`)
            }
        }
    }

    if (prizes.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-4xl mb-4">🎁</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Нет призов</h3>
                <p className="text-gray-600">Добавьте первый приз для начала работы.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Название
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Описание
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Вероятность (%)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Всего/Выдано
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Статус
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {prizes.map((prize) => (
                            <PrizeRow
                                key={prize.id}
                                prize={prize}
                                isEditing={editingId === prize.id}
                                editData={editData}
                                isSaving={saving === prize.id}
                                onEdit={() => handleEdit(prize)}
                                onSave={() => handleSave(prize.id)}
                                onCancel={handleCancel}
                                onDelete={() => handleDelete(prize.id)}
                                onEditDataChange={setEditData}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}