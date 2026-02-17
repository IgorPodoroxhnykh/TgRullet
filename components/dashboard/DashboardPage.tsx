// components/dashboard/DashboardPage.tsx
'use client'

import { useState } from 'react'
import { usePrizes } from '@/hooks/usePrizes'
import PrizeTable from './PrizeTable'
import AddPrizeForm from './AddPrizeForm'
import StatisticsCards from './StatisticsCards'

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
                        <button
                            onClick={refetch}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Повторить
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Панель Управления - Призы</h1>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 
                     flex items-center gap-2 transition-colors"
                >
                    <span>➕</span>
                    Добавить Приз
                </button>
            </div>

            {/* Статистика */}
            <StatisticsCards prizes={prizes} />

            {/* Таблица призов */}
            <PrizeTable
                prizes={prizes}
                onUpdate={updatePrize}  // ← Теперь типы совпадают
                onDelete={deletePrize}
            />

            {/* Форма добавления */}
            {showAddForm && (
                <AddPrizeForm
                    onSubmit={addPrize}
                    onClose={() => setShowAddForm(false)}
                />
            )}
        </div>
    )
}





