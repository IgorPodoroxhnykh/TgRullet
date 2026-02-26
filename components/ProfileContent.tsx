'use client';
import { useState } from 'react';
import { User } from '@/types/user';
import { Prize } from '@/types/prize';
import { UserInfoCard } from './UserInfoCard';
import CarouselPrizes from './CarouselPrizes';
import UserWinnings from './UserWinnings'; // <--- Добавляем импорт
import { spinWheel } from '@/app/actions';

interface ProfileContentProps {
    initialUser: User;
    prizes: Prize[];
}

export function ProfileContent({ initialUser, prizes }: ProfileContentProps) {
    const [user, setUser] = useState<User>(initialUser);
    const [isSpinning, setIsSpinning] = useState(false);

    const handleSpin = async (): Promise<boolean> => {
        if (isSpinning) return false;
        setIsSpinning(true);
        const result = await spinWheel();
        if (result.success && result.user) {
            setUser(result.user);
            setIsSpinning(false);
            return true;
        } else {
            alert(result.message || 'Ошибка списания токенов');
            setIsSpinning(false);
            return false;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-4 pt-4">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Карточка профиля */}
                <UserInfoCard user={user} />

                {/* Карточка с каруселью */}
                <div className="bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-800">
                    <CarouselPrizes
                        prizes={prizes}
                        onSpin={handleSpin}
                        balance={user.tokenBalance}
                        isSpinning={isSpinning}
                        requireTokens={true}
                    />
                </div>

                {/* Блок с выигрышами пользователя */}
                <UserWinnings />
            </div>
        </div>
    );
}