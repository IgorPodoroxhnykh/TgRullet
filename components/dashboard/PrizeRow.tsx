// components/dashboard/PrizeRow.tsx
'use client'

import { Prize, PrizeFormData } from '@/types/prize'

interface PrizeRowProps {
    prize: Prize
    isEditing: boolean
    editData: Partial<PrizeFormData>  // ← Меняем тип
    isSaving: boolean
    onEdit: () => void
    onSave: () => void
    onCancel: () => void
    onDelete: () => void
    onEditDataChange: (data: Partial<PrizeFormData>) => void  // ← Меняем тип
}

export default function PrizeRow({
    prize,
    isEditing,
    editData,
    isSaving,
    onEdit,
    onSave,
    onCancel,
    onDelete,
    onEditDataChange
}: PrizeRowProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSave()
        } else if (e.key === 'Escape') {
            onCancel()
        }
    }

    return (
        <tr className="hover:bg-gray-50">
            {/* Название */}
            <td className="px-6 py-4 whitespace-nowrap">
                {isEditing ? (
                    <input
                        type="text"
                        value={editData.name || ''}
                        onChange={(e) => onEditDataChange({ ...editData, name: e.target.value })}
                        onKeyDown={handleKeyDown}
                        className="w-full border rounded px-2 py-1 text-sm"
                        disabled={isSaving}
                    />
                ) : (
                    <div className="text-sm font-medium text-gray-900">{prize.name}</div>
                )}
            </td>

            {/* Описание */}
            <td className="px-6 py-4">
                {isEditing ? (
                    <textarea
                        value={editData.description || ''}
                        onChange={(e) => onEditDataChange({ ...editData, description: e.target.value })}
                        onKeyDown={handleKeyDown}
                        className="w-full border rounded px-2 py-1 text-sm"
                        rows={2}
                        disabled={isSaving}
                    />
                ) : (
                    <div className="text-sm text-gray-500 line-clamp-2">{prize.description}</div>
                )}
            </td>

            {/* Вероятность */}
            <td className="px-6 py-4 whitespace-nowrap">
                {isEditing ? (
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={((editData.probability || 0) * 100).toFixed(2)}
                            onChange={(e) => onEditDataChange({
                                ...editData,
                                probability: Math.max(0, Math.min(1, parseFloat(e.target.value) / 100 || 0))
                            })}
                            onKeyDown={handleKeyDown}
                            className="w-20 border rounded px-2 py-1 text-sm"
                            disabled={isSaving}
                        />
                        <span className="text-sm text-gray-600">%</span>
                    </div>
                ) : (
                    <div className="text-sm text-gray-900">
                        {(prize.probability * 100).toFixed(2)}%
                    </div>
                )}
            </td>

            {/* Количество */}
            <td className="px-6 py-4 whitespace-nowrap">
                {isEditing ? (
                    <input
                        type="number"
                        min="0"
                        value={editData.totalCount || 0}
                        onChange={(e) => onEditDataChange({
                            ...editData,
                            totalCount: Math.max(0, parseInt(e.target.value) || 0)
                        })}
                        onKeyDown={handleKeyDown}
                        className="w-16 border rounded px-2 py-1 text-sm"
                        disabled={isSaving}
                    />
                ) : (
                    <div className="text-sm text-gray-900">
                        <span className="font-medium">{prize.totalCount}</span>
                        <span className="text-gray-500">/{prize.redeemedCount}</span>
                    </div>
                )}
            </td>

            {/* Статус */}
            <td className="px-6 py-4 whitespace-nowrap">
                {isEditing ? (
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={editData.isActive ?? true}
                            onChange={(e) => onEditDataChange({ ...editData, isActive: e.target.checked })}
                            className="mr-2"
                            disabled={isSaving}
                        />
                        <span className="text-sm">Активен</span>
                    </label>
                ) : (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${prize.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {prize.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                )}
            </td>

            {/* Действия */}
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {isEditing ? (
                    <div className="flex gap-2">
                        <button
                            onClick={onSave}
                            disabled={isSaving}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Сохранить (Enter)"
                        >
                            {isSaving ? '⏳' : '✓'}
                        </button>
                        <button
                            onClick={onCancel}
                            disabled={isSaving}
                            className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                            title="Отмена (Esc)"
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={onEdit}
                            disabled={isSaving}
                            className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={onDelete}
                            disabled={isSaving}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                            🗑️
                        </button>
                    </div>
                )}
            </td>
        </tr>
    )
}