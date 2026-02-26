'use client'
import { useState, useRef } from 'react'
import { PrizeFormData } from '@/types/prize'

interface AddPrizeFormProps {
    onSubmit: (data: PrizeFormData) => Promise<{ success: boolean; error?: string }>
    onClose: () => void
}

// Функция вычисления хеша файла
async function getFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function AddPrizeForm({ onSubmit, onClose }: AddPrizeFormProps) {
    const [formData, setFormData] = useState<PrizeFormData>({
        name: '',
        description: '',
        imageFile: null,
        probability: 0,
        totalCount: 0,
        isActive: true,
        isValuable: false,
    })

    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsSubmitting(true)

        try {
            // Вычисляем хеш файла
            const fileHash = await getFileHash(file)

            // Проверяем, существует ли файл с таким хешем
            const checkResponse = await fetch(`/api/upload/check?hash=${fileHash}`)
            const checkData = await checkResponse.json()

            if (checkData.exists) {
                // Файл уже есть - используем существующий URL
                setFormData((prev) => ({
                    ...prev,
                    imageFile: null, // Файл не нужно загружать
                    existingImageUrl: checkData.url, // Существующий URL
                }))
                setImagePreview(checkData.url)
                alert('Файл уже существует, используется существующее изображение')
            } else {
                // Новый файл - создаём превью и запоминаем хеш
                const reader = new FileReader()
                reader.onload = (event) => {
                    setFormData((prev) => ({
                        ...prev,
                        imageFile: file,
                        imageHash: fileHash, // Сохраняем хеш
                    }))
                    setImagePreview(event.target?.result as string)
                }
                reader.readAsDataURL(file)
            }
        } catch (error) {
            console.error('Ошибка проверки файла:', error)
            // При ошибке просто создаём превью
            const reader = new FileReader()
            reader.onload = (event) => {
                setFormData((prev) => ({ ...prev, imageFile: file }))
                setImagePreview(event.target?.result as string)
            }
            reader.readAsDataURL(file)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRemoveImage = () => {
        setFormData((prev) => ({ ...prev, imageFile: null, existingImageUrl: undefined, imageHash: undefined }))
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim() || !formData.description.trim()) {
            alert('Пожалуйста, заполните обязательные поля')
            return
        }

        if (formData.probability <= 0 || formData.probability > 100) {
            alert('Вероятность должна быть от 1 до 100%')
            return
        }

        setIsSubmitting(true)

        try {
            let imageUrl: string | undefined

            // Если есть существующий URL - используем его
            if (formData.existingImageUrl) {
                imageUrl = formData.existingImageUrl
            }
            // Если выбран новый файл - загружаем
            else if (formData.imageFile) {
                const uploadFormData = new FormData()

                // Добавляем хеш в имя файла для проверки дубликатов
                const ext = formData.imageFile.name.split('.').pop()
                const fileWithHash = new File(
                    [formData.imageFile],
                    `${formData.imageHash}.${ext}`,
                    { type: formData.imageFile.type }
                )

                uploadFormData.append('file', fileWithHash)

                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadFormData,
                })

                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json()
                    alert(`Ошибка загрузки: ${errorData.error}`)
                    setIsSubmitting(false)
                    return
                }

                const { url } = await uploadResponse.json()
                imageUrl = url
            }

            const submitData = {
                ...formData,
                imageUrl,
                imageFile: undefined,
                imageHash: undefined,
                existingImageUrl: undefined,
                probability: formData.probability / 100,
            }

            const result = await onSubmit(submitData)

            if (result.success) {
                setTimeout(() => {
                    onClose()
                }, 150)
            } else {
                alert(`Ошибка: ${result.error}`)
                setIsSubmitting(false)
            }
        } catch (error) {
            console.error('Ошибка формы:', error)
            alert('Произошла ошибка при отправке')
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (!isSubmitting) {
            onClose()
        }
    }

    return (
        // ... остальной код формы без изменений
        // (тот же JSX что и раньше)
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleClose}>
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Добавить новый приз</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Название */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Название <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Введите название приза"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Описание */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Описание <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                            className="w-full border rounded px-3 py-2"
                            rows={3}
                            placeholder="Введите описание приза"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Загрузка изображения */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Изображение</label>
                        {!imagePreview ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="image-upload"
                                    disabled={isSubmitting}
                                />
                                <label htmlFor="image-upload" className="cursor-pointer">
                                    <div className="text-gray-500">
                                        <span className="text-blue-500">Нажмите для загрузки</span> или перетащите
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">PNG, JPG до 5MB</div>
                                </label>
                            </div>
                        ) : (
                            <div className="relative">
                                <img src={imagePreview} alt="Preview" className="w-full h-40 object-contain rounded border" />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                    disabled={isSubmitting}
                                >
                                    ×
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Вероятность */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Вероятность выпадения (1-100%)</label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            step="1"
                            value={formData.probability || ''}
                            onChange={(e) => {
                                const value = parseInt(e.target.value) || 0
                                setFormData((prev) => ({
                                    ...prev,
                                    probability: Math.max(0, Math.min(100, value)),
                                }))
                            }}
                            onFocus={(e) => {
                                if (formData.probability === 0) {
                                    e.target.select()
                                }
                            }}
                            className="w-full border rounded px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="Введите число от 1 до 100"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Количество */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Общее количество</label>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={formData.totalCount || ''}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    totalCount: Math.max(0, parseInt(e.target.value) || 0),
                                }))
                            }
                            onFocus={(e) => {
                                if (formData.totalCount === 0) {
                                    e.target.select()
                                }
                            }}
                            className="w-full border rounded px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="Введите количество"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Чекбоксы */}
                    <div className="flex gap-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                                className="mr-2"
                                disabled={isSubmitting}
                                id="isActive"
                            />
                            <label htmlFor="isActive" className="text-sm">Активен</label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.isValuable}
                                onChange={(e) => setFormData((prev) => ({ ...prev, isValuable: e.target.checked }))}
                                className="mr-2"
                                disabled={isSubmitting}
                                id="isValuable"
                            />
                            <label htmlFor="isValuable" className="text-sm">Ценный приз 💎</label>
                        </div>
                    </div>

                    {/* Кнопки */}
                    <div className="flex gap-2 pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}