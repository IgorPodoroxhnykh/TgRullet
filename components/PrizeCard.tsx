
import React from 'react';

export interface IPrizeCardProps {
    // id: string;
    // name: string;
    // description: string;
    // className?: string;

    id: string;
    name: string;
    description: string;
    imageUrl?: string | null;
    probability?: number;
    totalCount?: number;
    redeemedCount?: number;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
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
        bg-white rounded-lg shadow-md p-3 md:p-4
        border border-gray-200
        hover:shadow-lg transition-shadow duration-200
        max-w-sm w-full mx-auto 
        ${className}
      `}
        >
            {/* ID приза */}
            <div className="text-[10px] md:text-xs text-gray-400 mb-1">
                ID: {id}
            </div>

            {/* Название приза */}
            <h3 className="font-semibold text-gray-800 text-sm md:text-base lg:text-lg mb-1 md:mb-2 line-clamp-1">
                {name}
            </h3>

            {/* Описание */}
            <p className="text-gray-600 text-xs md:text-sm line-clamp-2">
                {description}
            </p>
        </div>
    );
};

export default PrizeCard;