'use client';
import { useEffect, useState, useMemo } from 'react';

type Winner = {
    id: string;
    username: string;
    createdAt: string;
    isIssued: boolean;
    prize: {
        name: string;
        imageUrl: string | null;
    };
};

export default function WinnersPanel() {
    const [winners, setWinners] = useState<Winner[]>([]);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    // Состояние для сворачивания/разворачивания
    const [isCollapsed, setIsCollapsed] = useState(false);

    const fetchWinners = async () => {
        try {
            const res = await fetch('/api/winners');
            const data = await res.json();
            setWinners(data);
        } catch (error) {
            console.error('Failed to fetch winners:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWinners();
    }, []);

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        setTogglingId(id);
        try {
            const res = await fetch(`/api/winners/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isIssued: !currentStatus }),
            });
            if (!res.ok) throw new Error('Failed to update');
            await fetchWinners();
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
            alert('Не удалось обновить статус');
        } finally {
            setTogglingId(null);
        }
    };

    // Сортировка: Сначала Ожидающие, потом Выданные
    const sortedWinners = useMemo(() => {
        return [...winners].sort((a, b) => {
            if (a.isIssued !== b.isIssued) {
                return a.isIssued ? 1 : -1;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [winners]);

    return (
        // ИЗМЕНЕНИЕ: Заменил h-full на h-fit, чтобы панель сжималась до заголовка
        <div className="flex flex-col h-fit border rounded-lg bg-white shadow-sm overflow-hidden">
            {/* Заголовок с кликом для сворачивания */}
            <div
                className="p-4 border-b bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors select-none flex justify-between items-center"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <h2 className="text-lg font-bold text-gray-800">🏆 Последние победители</h2>
                {/* Стрелочка-индикатор */}
                <span className={`text-gray-500 transform transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}>
                    ▼
                </span>
            </div>

            {/* 
         Окно с прокруткой.
         h-[600px] - высота для 7-8 строк.
         Если isCollapsed = true, то высота 0 и отступы 0 (схлопывается).
         transition-all добавляет плавность анимации.
      */}
            <div className={`overflow-y-auto p-4 space-y-3 transition-all duration-300 ease-in-out ${isCollapsed ? 'h-0 p-0 opacity-0' : 'h-[600px] opacity-100'}`}>
                {loading ? (
                    <p className="text-center text-gray-500">Загрузка...</p>
                ) : winners.length === 0 ? (
                    <p className="text-center text-gray-500">Победителей пока нет</p>
                ) : (
                    sortedWinners.map((winner) => (
                        <div
                            key={winner.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div>
                                    <p className="font-semibold text-sm text-gray-900">{winner.username}</p>
                                    <p className="text-xs text-gray-500">{winner.prize.name}</p>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                                {/* Переключатель статуса */}
                                <button
                                    onClick={() => toggleStatus(winner.id, winner.isIssued)}
                                    disabled={togglingId === winner.id}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${winner.isIssued ? 'bg-green-500' : 'bg-yellow-500'
                                        } ${togglingId === winner.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${winner.isIssued ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    {new Date(winner.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}