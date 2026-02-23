'use client'

import { useState } from 'react'
import { Prize } from '@/types/prize'
import CarouselPrizes from './CarouselPrizes'
import AuthModal from './AuthModal'

interface HomeContentProps {
    prizes: Prize[]
    initialBalance?: number
}

export default function HomeContent({ prizes, initialBalance = 0 }: HomeContentProps) {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [balance, setBalance] = useState(initialBalance)

    // Демо-режим: просто возвращаем true, звуки теперь в CarouselPrizes
    const handleSpin = async (): Promise<boolean> => {
        return true
    }

    return (
        <div className="relative min-h-screen bg-slate-950 flex flex-col items-center pt-24 px-4">
            <div className="w-full max-w-2xl mx-auto space-y-8 flex flex-col items-center">
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 animate-fade-in drop-shadow-lg">
                        Лотерея Призов
                    </h1>
                </div>

                <div className="w-full bg-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-800">
                    <CarouselPrizes
                        prizes={prizes}
                        onSpin={handleSpin}
                        balance={balance}
                        isSpinning={false}
                        requireTokens={false}
                    />
                </div>

                <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full max-w-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-purple-900/50 transition-all transform hover:scale-105 active:scale-95 border border-slate-700"
                >
                    Войти для игры
                </button>
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </div>
    )
}