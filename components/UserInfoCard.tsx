import { User } from '@/types/user';

interface UserInfoCardProps {
    user: User;
}

export function UserInfoCard({ user }: UserInfoCardProps) {
    return (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col">

            {/* Шапка (Профиль + Зеленый индикатор) */}
            <div className="bg-gradient-to-r from-purple-900 to-blue-900 px-4 py-2.5 text-white flex justify-between items-center">
                <h2 className="text-base font-bold tracking-wide">ПРОФИЛЬ</h2>
                {/* Аватарка-плейсхолдер для баланса */}
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            </div>

            {/* Основной контент */}
            <div className="p-3 flex items-center justify-between">

                {/* Левая часть: Аватар и информация */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Аватар */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0 ring-2 ring-slate-800">
                        {user.username ? user.username[0].toUpperCase() : 'U'}
                    </div>
                    {/* Текст (Имя и Ник) */}
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-white truncate">
                            @{user.username || 'no_username'}
                        </span>
                        <span className="text-xs text-slate-400 truncate">
                            {user.firstName} {user.lastName}
                        </span>
                    </div>
                </div>

                {/* Правая часть: Баланс и Кнопка */}
                <div className="flex items-center gap-3 shrink-0">
                    {/* Баланс */}
                    <div className="flex flex-col items-end">
                        <span className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                            {user.tokenBalance}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">TKN</span>
                    </div>

                    {/* Кнопка (Заглушка с фиолетовым градиентом) */}
                    <button
                        disabled
                        className="bg-gradient-to-r from-purple-900 to-blue-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg shadow-purple-900/50 border border-purple-500/30 cursor-not-allowed disabled:opacity-80 transition-all hover:shadow-purple-900/70"
                    >
                        Купить
                    </button>
                </div>

            </div>
        </div>
    );
}