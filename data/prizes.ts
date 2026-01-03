export interface IPrize {
    id: string;
    name: string;
    description: string;
}


export const prizes: IPrize[] = [
    {
        id: '1',
        name: 'iPhone 15 Pro',
        description: 'Новый смартфон с улучшенной камерой и процессором',
    },
    {
        id: '2',
        name: 'Ноутбук MacBook Air',
        description: 'Легкий и мощный ноутбук для работы и творчества',
    },
    {
        id: '3',
        name: 'Фитнес-браслет',
        description: 'Отслеживание активности, пульса и сна',
    },
    {
        id: '4',
        name: 'Подарочная карта Amazon',
        description: 'Карта номиналом $100 для покупок на Amazon',
    },
    {
        id: '5',
        name: 'Наушники Sony',
        description: 'Беспроводные наушники с шумоподавлением',
    },
];