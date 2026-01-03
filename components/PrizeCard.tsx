import React from 'react';

export interface IPrizeCardProps {
    id: string;
    name: string;
    description: string;
    className?: string;
}

const PrizeCard: React.FC<IPrizeCardProps> = ({
    id,
    name,
    description,
    className = '',
}) => {

    return (
        <div
            className={`
        bg-white rounded-lg shadow-md p-4
        border border-gray-200
        hover:shadow-lg transition-shadow duration-200
        max-w-sm w-full mx-auto  /* ← добавлен mx-auto */
        ${className}
      `}
        >
            {/* ID приза (маленький и неброский) */}
            <div className="text-xs text-gray-400 mb-1">
                ID: {id}
            </div>

            {/* Название приза */}
            <h3 className="font-semibold text-gray-800 text-lg mb-2">
                {name}
            </h3>

            {/* Описание */}
            <p className="text-gray-600 text-sm line-clamp-2">
                {description}
            </p>
        </div>
    );
};

export default PrizeCard;