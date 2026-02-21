// 'use client';

// import { useEffect, useState } from 'react';

// type Winner = {
//     id: string;
//     username: string;
//     createdAt: string;
//     isIssued: boolean;
//     prize: {
//         name: string;
//         imageUrl: string | null;
//     };
// };

// export default function WinnersPanel() {
//     const [winners, setWinners] = useState<Winner[]>([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         async function fetchWinners() {
//             try {
//                 const res = await fetch('/api/winners');
//                 const data = await res.json();
//                 setWinners(data);
//             } catch (error) {
//                 console.error('Failed to fetch winners:', error);
//             } finally {
//                 setLoading(false);
//             }
//         }

//         fetchWinners();
//     }, []);

//     return (
//         <div className="flex flex-col h-full border rounded-lg bg-white shadow-sm overflow-hidden">
//             <div className="p-4 border-b bg-gray-50">
//                 <h2 className="text-lg font-bold text-gray-800">🏆 Последние победители</h2>
//             </div>

//             {/* Окно с прокруткой */}
//             <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[500px]">
//                 {loading ? (
//                     <p className="text-center text-gray-500">Загрузка...</p>
//                 ) : winners.length === 0 ? (
//                     <p className="text-center text-gray-500">Победителей пока нет</p>
//                 ) : (
//                     winners.map((winner) => (
//                         <div
//                             key={winner.id}
//                             className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
//                         >
//                             <div className="flex items-center gap-3">
//                                 {/* {winner.prize.imageUrl && (
//                                     <img
//                                         src={winner.prize.imageUrl}
//                                         alt={winner.prize.name}
//                                         className="w-10 h-10 rounded object-cover"
//                                     />
//                                 )} */}
//                                 <div>
//                                     <p className="font-semibold text-sm text-gray-900">{winner.username}</p>
//                                     <p className="text-xs text-gray-500">{winner.prize.name}</p>
//                                 </div>
//                             </div>

//                             <div className="text-right">
//                                 <span
//                                     className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${winner.isIssued
//                                         ? 'bg-green-100 text-green-800'
//                                         : 'bg-yellow-100 text-yellow-800'
//                                         }`}
//                                 >
//                                     {winner.isIssued ? 'Выдан' : 'Ожидает'}
//                                 </span>
//                                 <p className="text-[10px] text-gray-400 mt-1">
//                                     {new Date(winner.createdAt).toLocaleDateString()}
//                                 </p>
//                             </div>
//                         </div>
//                     ))
//                 )}
//             </div>
//         </div>
//     );
// }


//==============

'use client';

import { useEffect, useState } from 'react';

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

            // Обновляем список после успешного запроса
            await fetchWinners();
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
            alert('Не удалось обновить статус');
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <div className="flex flex-col h-full border rounded-lg bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800">🏆 Последние победители</h2>
            </div>

            {/* Окно с прокруткой */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[500px]">
                {loading ? (
                    <p className="text-center text-gray-500">Загрузка...</p>
                ) : winners.length === 0 ? (
                    <p className="text-center text-gray-500">Победителей пока нет</p>
                ) : (
                    winners.map((winner) => (
                        <div
                            key={winner.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {/* {winner.prize.imageUrl && (
                  <img
                    src={winner.prize.imageUrl}
                    alt={winner.prize.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                )} */}
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