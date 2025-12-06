import { motion } from "framer-motion";
import CardCarousel from "@/components/CardCarousel";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { CardData } from "./types";

interface WheelVisualsProps {
    cards: CardData[];
    api: any;
    setApi: (api: any) => void;
    currentIndex: number;
    isSpinning: boolean;
    spinDuration: number;
}

export default function WheelVisuals({
    cards,
    api,
    setApi,
    currentIndex,
    isSpinning,
    spinDuration,
}: WheelVisualsProps) {
    return (
        <div className="w-full relative">
            {/* Индикатор вращения */}
            {isSpinning && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent pointer-events-none z-10"
                />
            )}

            <Carousel
                setApi={setApi}
                opts={{
                    align: "center",
                    loop: true,
                    duration: isSpinning ? 50 : 20,
                }}
                className="w-full relative"
            >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {cards.map((card, index) => (
                        <CarouselItem
                            key={card.id}
                            className="pl-2 sm:pl-4 sm:basis-3/4 md:basis-1/2 lg:basis-1/3"
                        >
                            <motion.div
                                className="p-1 relative"
                                whileHover={!isSpinning ? { scale: 1.03 } : {}}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                {/* Подсветка текущей карточки */}
                                {currentIndex === index && !isSpinning && (
                                    <motion.div
                                        className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-md"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                )}

                                {/* Эффект выделения при вращении */}
                                {isSpinning && currentIndex === index && (
                                    <motion.div
                                        className="absolute -inset-1 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-2xl blur-lg"
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            opacity: [0.5, 0.8, 0.5],
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            repeat: Infinity,
                                        }}
                                    />
                                )}

                                <CardCarousel
                                    title={card.title}
                                    description={card.description}
                                    className={`
                                        relative z-10
                                        bg-gradient-to-br from-blue-50 to-white shadow-lg hover:shadow-xl 
                                        transition-all duration-300 border-2
                                        ${currentIndex === index && !isSpinning
                                            ? 'border-blue-500 shadow-xl ring-2 ring-blue-200'
                                            : 'border-transparent'
                                        }
                                        ${isSpinning && currentIndex === index
                                            ? 'border-yellow-400 ring-2 ring-yellow-200 animate-pulse'
                                            : ''
                                        }
                                    `}
                                />
                            </motion.div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            {/* Индикатор прогресса вращения */}
            {isSpinning && (
                <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 4, ease: "linear" }}
                    className="mt-8 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                />
            )}
        </div>
    );
}