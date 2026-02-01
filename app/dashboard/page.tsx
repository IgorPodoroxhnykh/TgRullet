'use client'
import { useState, useEffect } from 'react'

interface Prize {
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
}

export default function DashboardPage() {
    const [prizes, setPrizes] = useState<Prize[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [editData, setEditData] = useState<Partial<Prize>>({})

    useEffect(() => {
        fetchPrizes()
    }, [])

    const fetchPrizes = async () => {
        try {
            console.log('🔄 Загружаем призы...')
            const response = await fetch('/api/dashboard')
            console.log('📡 Ответ API:', response.status)

            if (!response.ok) {
                const error = await response.text()
                console.error('❌ Ошибка API:', error)
                return
            }

            const data = await response.json()
            console.log('📦 Данные из API:', data)
            console.log('📊 Количество призов:', data.length)

            setPrizes(data)
        } catch (error) {
            console.error('❌ Ошибка fetch:', error)
        } finally {
            setLoading(false)
        }
    }

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
        try {
            const response = await fetch(`/api/dashboard/${id}`, { // ← ИСПРАВЛЕНО
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            })

            if (response.ok) {
                setEditingId(null)
                setEditData({})
                fetchPrizes()
            }
        } catch (error) {
            console.error('Ошибка сохранения:', error)
        }
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditData({})
    }

    const handleDelete = async (id: string) => {
        if (confirm('Удалить этот приз?')) {
            try {
                await fetch(`/api/dashboard/${id}`, { method: 'DELETE' })
                fetchPrizes()
            } catch (error) {
                console.error('Ошибка удаления:', error)
            }
        }
    }

    const handleAdd = async (prizeData: Omit<Prize, 'id' | 'redeemedCount' | 'createdAt' | 'updatedAt'>) => {
        try {
            const response = await fetch('/api/dashboard', { // ← ИСПРАВЛЕНО
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prizeData)
            })

            if (response.ok) {
                setShowAddForm(false)
                fetchPrizes()
            }
        } catch (error) {
            console.error('Ошибка добавления:', error)
        }
    }

    if (loading) return <div className="p-6">Загрузка...</div>

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Панель Управления - Призы</h1>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
                >
                    <span>➕</span>
                    Добавить Приз
                </button>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-600">Всего призов</h3>
                    <p className="text-2xl font-bold text-blue-900">{prizes.length}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-600">Активных</h3>
                    <p className="text-2xl font-bold text-green-900">
                        {prizes.filter(p => p.isActive).length}
                    </p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-yellow-600">Всего в наличии</h3>
                    <p className="text-2xl font-bold text-yellow-900">
                        {prizes.reduce((sum, p) => sum + p.totalCount, 0)}
                    </p>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-600">Выдано</h3>
                    <p className="text-2xl font-bold text-purple-900">
                        {prizes.reduce((sum, p) => sum + p.redeemedCount, 0)}
                    </p>
                </div>
            </div>

            {/* Таблица призов */}
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
                                <tr key={prize.id} className="hover:bg-gray-50">
                                    {/* Название */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === prize.id ? (
                                            <input
                                                type="text"
                                                value={editData.name || ''}
                                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                className="w-full border rounded px-2 py-1 text-sm"
                                                onKeyDown={(e) => e.key === 'Enter' && handleSave(prize.id)}
                                            />
                                        ) : (
                                            <div className="text-sm font-medium text-gray-900">{prize.name}</div>
                                        )}
                                    </td>

                                    {/* Описание */}
                                    <td className="px-6 py-4">
                                        {editingId === prize.id ? (
                                            <textarea
                                                value={editData.description || ''}
                                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                                className="w-full border rounded px-2 py-1 text-sm"
                                                rows={2}
                                                onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && handleSave(prize.id)}
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-500 line-clamp-2">{prize.description}</div>
                                        )}
                                    </td>

                                    {/* Вероятность */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === prize.id ? (
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={(editData.probability || 0) * 100}
                                                onChange={(e) => setEditData({ ...editData, probability: parseFloat(e.target.value) / 100 })}
                                                className="w-20 border rounded px-2 py-1 text-sm"
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-900">
                                                {(prize.probability * 100).toFixed(2)}%
                                            </div>
                                        )}
                                    </td>

                                    {/* Количество */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingId === prize.id ? (
                                            <input
                                                type="number"
                                                min="0"
                                                value={editData.totalCount || 0}
                                                onChange={(e) => setEditData({ ...editData, totalCount: parseInt(e.target.value) })}
                                                className="w-16 border rounded px-2 py-1 text-sm mr-2"
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
                                        {editingId === prize.id ? (
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={editData.isActive ?? true}
                                                    onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                                                    className="mr-2"
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
                                        {editingId === prize.id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleSave(prize.id)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Сохранить (Enter)"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="text-gray-600 hover:text-gray-900"
                                                    title="Отмена"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(prize)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(prize.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Форма добавления */}
            {showAddForm && (
                <AddPrizeForm
                    onSubmit={handleAdd}
                    onClose={() => setShowAddForm(false)}
                />
            )}
        </div>
    )
}

// Форма добавления нового приза
function AddPrizeForm({
    onSubmit,
    onClose
}: {
    onSubmit: (data: Omit<Prize, 'id' | 'redeemedCount' | 'createdAt' | 'updatedAt'>) => void
    onClose: () => void
}) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: '',
        probability: 0.01,
        totalCount: 0,
        isActive: true
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
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
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">URL изображения</label>
                        <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            placeholder="https://..."
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
                            value={formData.probability * 100}
                            onChange={(e) => setFormData({ ...formData, probability: parseFloat(e.target.value) / 100 })}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Общее количество</label>
                        <input
                            type="number"
                            min="0"
                            value={formData.totalCount}
                            onChange={(e) => setFormData({ ...formData, totalCount: parseInt(e.target.value) })}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="mr-2"
                        />
                        <label className="text-sm">Активен</label>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button
                            type="submit"
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Создать
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}