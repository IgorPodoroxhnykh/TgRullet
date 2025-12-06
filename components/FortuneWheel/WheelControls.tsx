'use client'

import { motion } from "framer-motion";
import { useWheelStore } from "@/stores/wheelStore";

export default function WheelControls() {
    const { isSpinning, showResult, startSpinning } = useWheelStore();

    // Не показываем кнопку во время показа результата
    if (showResult) return null;

    return (
        <div className="flex justify-center mb-8">
            <motion.button
                onClick={startSpinning}
                disabled={isSpinning}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                    relative px-8 py-4 text-lg font-semibold rounded-full
                    bg-gradient-to-r from-blue-600 to-purple-600 text-white
                    shadow-lg hover:shadow-xl transition-all duration-300
                    disabled:opacity-50 disabled:cursor-not-allowed
                    overflow-hidden flex items-center gap-2
                `}
            >
                {isSpinning ? (
                    <>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Колесо крутится...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Крутить колесо</span>
                    </>
                )}

                {/* Эффект блеска при вращении */}
                {isSpinning && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                            x: ["-100%", "100%"],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                )}
            </motion.button>
        </div>
    );
}