'use client'

import { motion, AnimatePresence } from "framer-motion";
import { useWheelStore } from "@/stores/wheelStore";
import { useEffect, useState } from "react";

export default function WheelResult() {
    const {
        selectedCard,
        showResult,
        isSpinning,
        resetWheel
    } = useWheelStore();

    const [shouldShow, setShouldShow] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showResult && selectedCard && !isSpinning) {
            timer = setTimeout(() => {
                setShouldShow(true);
            }, 1500);
        } else {
            setShouldShow(false);
        }

        return () => clearTimeout(timer);
    }, [showResult, selectedCard, isSpinning]);

    const handleClose = () => {
        setShouldShow(false);
        resetWheel();
    };

    return (
        <AnimatePresence>
            {shouldShow && selectedCard && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-12 text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center"
                        >
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </motion.div>
                        <h3 className="text-2xl font-bold text-gray-800">
                            Вы выиграли!
                        </h3>
                    </div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white p-6 rounded-xl shadow-inner mb-4"
                    >
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                            {selectedCard.title}
                        </h4>
                        <p className="text-gray-600">
                            {selectedCard.description}
                        </p>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        onClick={handleClose}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold shadow-md hover:shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Отлично! Крутить еще раз
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}