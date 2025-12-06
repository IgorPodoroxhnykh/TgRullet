
interface CardProps {
    title: string;
    description: string;
    imageUrl?: string;
    className?: string
}


export default function CardCarousel({
    title,
    description,
    imageUrl,
    className = ''
}: CardProps) {





    return (
        <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
            {imageUrl && (
                <div className="w-full h-48 overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {title}
                </h3>
                <p className="text-gray-600 leading-relaxed flex-1">
                    {description}
                </p>
                <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 self-start">
                    Узнать больше
                </button>
            </div>
        </div>
    )
}