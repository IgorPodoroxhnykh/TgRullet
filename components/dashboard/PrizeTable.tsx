'use client'
import { useState, useRef } from 'react'
import { Prize, PrizeFormData } from '@/types/prize'

interface PrizeTableProps {
    prizes: Prize[]
    onUpdate: (id: string, updates: Partial<PrizeFormData>) => Promise<{ success: boolean; error?: string }>
    onDelete: (id: string) => Promise<{ success: boolean; error?: string }>
}

export default function PrizeTable({ prizes, onUpdate, onDelete }: PrizeTableProps) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editData, setEditData] = useState<any>({})
    const [saving, setSaving] = useState<string | null>(null)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleEdit = (prize: Prize) => {
        setEditData({
            ...prize,
            probability: Math.round(prize.probability * 100),
            newImageFile: null,
            imagePreview: prize.imageUrl || null,
            originalImageUrl: prize.imageUrl, // Сохраняем оригинальный URL
        })
        setEditingId(prize.id)
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingImage(true)

        try {
            const reader = new FileReader()
            reader.onload = (event) => {
                setEditData((prev: any) => ({
                    ...prev,
                    newImageFile: file,
                    imagePreview: event.target?.result as string,
                    imageChanged: true, // Флаг что изображение изменилось
                }))
            }
            reader.readAsDataURL(file)
        } finally {
            setUploadingImage(false)
        }
    }

    const handleRemoveImage = () => {
        setEditData((prev: any) => ({
            ...prev,
            newImageFile: null,
            imagePreview: null,
            removeImage: true,
            imageChanged: true,
        }))
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSave = async (id: string) => {
        if (editData.probability < 1 || editData.probability > 100) {
            alert('Вероятность должна быть от 1 до 100%')
            return
        }

        setSaving(id)

        try {
            let imageUrl: string | null | undefined = editData.originalImageUrl

            // Если выбран новый файл - загружаем его
            if (editData.newImageFile) {
                const uploadFormData = new FormData()
                uploadFormData.append('file', editData.newImageFile)

                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadFormData,
                })

                if (!uploadResponse.ok) {
                    alert('Ошибка загрузки изображения')
                    setSaving(null)
                    return
                }

                const { url } = await uploadResponse.json()
                imageUrl = url
            }
            // Если отмечено удаление - устанавливаем null
            else if (editData.removeImage) {
                imageUrl = null
            }
            // Если изображение не менялось - не передаём imageUrl (сохраняем как есть)
            else if (!editData.imageChanged) {
                imageUrl = undefined
            }

            const dataToSave: any = {
                name: editData.name,
                description: editData.description,
                probability: editData.probability / 100,
                totalCount: editData.totalCount || 0,
                isActive: editData.isActive,
                isValuable: editData.isValuable,
            }

            // Добавляем imageUrl только если изображение менялось
            if (editData.imageChanged) {
                dataToSave.imageUrl = imageUrl
            }

            const result = await onUpdate(id, dataToSave)

            if (result.success) {
                setEditingId(null)
                setEditData({})
            } else {
                alert(`Ошибка: ${result.error}`)
            }
        } catch (error) {
            console.error('Ошибка сохранения:', error)
            alert('Ошибка сохранения')
        } finally {
            setSaving(null)
        }
    }

    const handleCancel = () => {
        setEditingId(null)
        setEditData({})
    }

    if (prizes.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">Нет призов</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Шапка */}
            <div
                className="bg-gray-50 p-4 border-b flex justify-between items-center cursor-pointer"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <span className="font-medium">
                    {isCollapsed ? '▶' : '▼'} Призы ({prizes.length})
                </span>
            </div>

            {/* Список */}
            {!isCollapsed && (
                <div className="divide-y max-h-[540px] overflow-y-auto">
                    {prizes.map((prize) => (
                        <div key={prize.id} className="p-4 hover:bg-gray-50">
                            {editingId === prize.id ? (
                                <div className="space-y-3">
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        value={editData.name || ''}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        placeholder="Название"
                                    />
                                    <textarea
                                        className="w-full border rounded px-3 py-2"
                                        rows={2}
                                        value={editData.description || ''}
                                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                        placeholder="Описание"
                                    />

                                    {/* Загрузка изображения */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Изображение</label>
                                        {!editData.imagePreview ? (
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-gray-400 transition-colors">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    id={`image-edit-${prize.id}`}
                                                    disabled={uploadingImage}
                                                />
                                                <label htmlFor={`image-edit-${prize.id}`} className="cursor-pointer text-sm">
                                                    <span className="text-blue-500">Загрузить изображение</span>
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="relative inline-block">
                                                <img
                                                    src={editData.imagePreview}
                                                    alt="Preview"
                                                    className="w-20 h-20 object-cover rounded border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Вероятность */}
                                    <div className="flex flex-wrap gap-4 items-center">
                                        <label className="flex items-center gap-2">
                                            <span>Вероятность:</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                step="1"
                                                value={editData.probability || ''}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value) || 0
                                                    setEditData({
                                                        ...editData,
                                                        probability: Math.max(0, Math.min(100, value)),
                                                    })
                                                }}
                                                onFocus={(e) => e.target.select()}
                                                className="border rounded px-2 py-1 w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                placeholder="1-100"
                                            />
                                            %
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={editData.isValuable || false}
                                                onChange={(e) => setEditData({ ...editData, isValuable: e.target.checked })}
                                            />
                                            Ценный
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={editData.isActive || false}
                                                onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
                                            />
                                            Активен
                                        </label>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSave(prize.id)}
                                            disabled={saving === prize.id || uploadingImage}
                                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                                        >
                                            {saving === prize.id ? 'Сохранение...' : 'Сохранить'}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        {prize.imageUrl && (
                                            <img
                                                src={prize.imageUrl}
                                                alt={prize.name}
                                                className="w-16 h-16 object-cover rounded border"
                                            />
                                        )}
                                        <div>
                                            <div className="font-medium">{prize.name}</div>
                                            <div className="text-sm text-gray-500">{prize.description}</div>
                                            <div className="text-xs text-gray-400 mt-1 space-x-3">
                                                <span>{Math.round(prize.probability * 100)}%</span>
                                                <span className={prize.isValuable ? 'text-purple-600' : ''}>
                                                    {prize.isValuable ? '💎 Ценный' : 'Обычный'}
                                                </span>
                                                <span className={prize.isActive ? 'text-green-600' : 'text-red-600'}>
                                                    {prize.isActive ? 'Активен' : 'Неактивен'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleEdit(prize)}
                                        className="text-indigo-600 text-xl"
                                    >
                                        ✏️
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

