// 'use client'
// import { Prize } from '@/types/prize'

// interface StatisticsCardsProps {
//     prizes: Prize[]
// }

// export default function StatisticsCards({ prizes }: StatisticsCardsProps) {
//     const totalPrizes = prizes.length
//     const activePrizes = prizes.filter(p => p.isActive).length

//     const stats = [
//         {
//             title: 'Всего призов',
//             value: totalPrizes,
//             color: 'blue',
//             icon: '🎁',
//         },
//         {
//             title: 'Активных',
//             value: activePrizes,
//             color: 'green',
//             icon: '✅',
//         },
//         // Карточки "Всего в наличии" и "Выдано" удалены
//     ]

//     const colorClasses = {
//         blue: 'bg-blue-100 text-blue-900',
//         green: 'bg-green-100 text-green-900',
//         yellow: 'bg-yellow-100 text-yellow-900',
//         purple: 'bg-purple-100 text-purple-900'
//     }

//     return (
//         // Изменил md:grid-cols-4 на md:grid-cols-2
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//             {stats.map((stat) => (
//                 <div
//                     key={stat.title}
//                     className={`${colorClasses[stat.color as keyof typeof colorClasses]} p-4 rounded-lg`}
//                 >
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <h3 className="text-sm font-medium opacity-75">{stat.title}</h3>
//                             <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
//                         </div>
//                         <div className="text-2xl opacity-75">
//                             {stat.icon}
//                         </div>
//                     </div>
//                 </div>
//             ))}
//         </div>
//     )
// }


//================


'use client'
import { Prize } from '@/types/prize'

interface StatisticsCardsProps {
    prizes: Prize[]
}

export default function StatisticsCards({ prizes }: StatisticsCardsProps) {
    const totalPrizes = prizes.length
    const activePrizes = prizes.filter(p => p.isActive).length

    // Рассчитываем сумму вероятностей только активных призов
    const totalProbability = prizes
        .filter(p => p.isActive)
        .reduce((sum, p) => sum + p.probability, 0)

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
            title: 'Общая вероятность',
            value: (totalProbability * 100).toFixed(2) + '%', // Переводим в проценты
            color: 'purple',
            icon: '📊',
        },
    ]

    const colorClasses = {
        blue: 'bg-blue-100 text-blue-900',
        green: 'bg-green-100 text-green-900',
        yellow: 'bg-yellow-100 text-yellow-900',
        purple: 'bg-purple-100 text-purple-900'
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" >
            {
                stats.map((stat) => (
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
                ))
            }
        </div >
    )
}