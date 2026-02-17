// components/dashboard/StatisticsCards.tsx
'use client'

import { Prize } from '@/types/prize'

interface StatisticsCardsProps {
    prizes: Prize[]
}

export default function StatisticsCards({ prizes }: StatisticsCardsProps) {
    const totalPrizes = prizes.length
    const activePrizes = prizes.filter(p => p.isActive).length
    const totalCount = prizes.reduce((sum, p) => sum + p.totalCount, 0)
    const redeemedCount = prizes.reduce((sum, p) => sum + p.redeemedCount, 0)

    const stats = [
        {
            title: 'Всего призов',
            value: totalPrizes,
            color: 'blue',
            icon: '🎁',
        },
        {
            title: 'Активных',
            value: activePrizes,
            color: 'green',
            icon: '✅',
        },
        {
            title: 'Всего в наличии',
            value: totalCount,
            color: 'yellow',
            icon: '📦',
        },
        {
            title: 'Выдано',
            value: redeemedCount,
            color: 'purple',
            icon: '🎯',
        }
    ]

    const colorClasses = {
        blue: 'bg-blue-100 text-blue-900',
        green: 'bg-green-100 text-green-900',
        yellow: 'bg-yellow-100 text-yellow-900',
        purple: 'bg-purple-100 text-purple-900'
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => (
                <div
                    key={stat.title}
                    className={`${colorClasses[stat.color as keyof typeof colorClasses]} p-4 rounded-lg`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium opacity-75">{stat.title}</h3>
                            <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                        </div>
                        <div className="text-2xl opacity-75">
                            {stat.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}