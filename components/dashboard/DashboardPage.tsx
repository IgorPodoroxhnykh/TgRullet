
'use client'
import { useState, useMemo } from 'react'
import { usePrizes } from '@/hooks/usePrizes'
import PrizeTable from './PrizeTable'
import AddPrizeForm from './AddPrizeForm'
import StatisticsCards from './StatisticsCards'
import WinnersPanel from './WinnersPanel'

export default function DashboardPage() {
    const {
        prizes,
        loading,
        error,
        addPrize,
        updatePrize,
        deletePrize,
        refetch
    } = usePrizes()

    const [showAddForm, setShowAddForm] = useState(false)

    // Сортировка призов
    const sortedPrizes = useMemo(() => {
        return [...prizes].sort((a, b) => {
            if (a.isActive !== b.isActive) {
                return b.isActive ? 1 : -1
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
    }, [prizes])

    // Безопасное закрытие формы
    const handleCloseForm = () => {
        setShowAddForm(false)
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Загрузка призов...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="text-red-500 text-4xl mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Ошибка загрузки</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button onClick={refetch} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Повторить
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Заголовок */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Панель Управления - Призы</h1>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2 transition-colors"
                >
                    <span>➕</span>
                    Добавить Приз
                </button>
            </div>

            {/* Статистика */}
            <div className="mb-6">
                <StatisticsCards prizes={prizes} />
            </div>

            {/* Основной контент */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <WinnersPanel />
                </div>
                <div className="lg:col-span-2">
                    <PrizeTable prizes={sortedPrizes} onUpdate={updatePrize} onDelete={deletePrize} />
                </div>
            </div>

            {/* Форма добавления */}
            {showAddForm && (
                <AddPrizeForm
                    onSubmit={addPrize}
                    onClose={handleCloseForm}
                />
            )}
        </div>
    )
}