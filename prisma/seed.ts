import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Начало заполнения базы данных...\n');

    // ============ СОЗДАНИЕ АДМИНА ============
    console.log('👤 Создание пользователя-администратора...');
    const adminPasswordHash = bcrypt.hashSync('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { telegramId: 'ADMIN_ID_SEED' },
        update: {
            // Обновляем логин и пароль, если пользователь уже есть
            login: 'admin',
            password: adminPasswordHash,
        },
        create: {
            telegramId: 'ADMIN_ID_SEED',
            username: 'admin_user',
            firstName: 'Admin',
            lastName: 'System',
            login: 'admin',
            password: adminPasswordHash,
            role: 'ADMIN',
            isActive: true,
            tokenBalance: 1000,
        },
    });
    console.log(`   ✅ Admin User создан: ${admin.username} | Логин: ${admin.login} | Роль: ${admin.role}`);

    // ============ СОЗДАНИЕ ТЕСТОВОГО ЮЗЕРА ============
    console.log('👤 Создание тестового пользователя...');
    const testUserPasswordHash = bcrypt.hashSync('password', 10);
    const testUser = await prisma.user.upsert({
        where: { telegramId: '123456789' },
        update: {
            login: 'testUser',
            password: testUserPasswordHash,
        },
        create: {
            telegramId: '123456789',
            username: 'testUser',
            firstName: 'Иван',
            lastName: 'Тестовый',
            login: 'testUser.com',
            password: testUserPasswordHash,
            role: 'USER',
            isActive: true,
            tokenBalance: 10,
        },
    });
    console.log(`   ✅ Test User создан: ${testUser.username} | Логин: ${testUser.login} | Баланс: ${testUser.tokenBalance}`);

    // ============ СОЗДАНИЕ ПРИЗОВ ============
    console.log('\n🎁 Создание призов...');
    const prizes = [
        {
            name: 'iPhone 15 Pro Max',
            description: 'Самый мощный iPhone с процессором A17 Pro, 6.7" дисплеем и камерой 48МП',
            imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
            probability: 0.01,
            totalCount: 1,
            redeemedCount: 0,
        },
        {
            name: 'MacBook Air M3',
            description: 'Ноутбук с процессором Apple M3, 13.6" Liquid Retina дисплеем',
            imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=400',
            probability: 0.02,
            totalCount: 2,
            redeemedCount: 0,
        },
        {
            name: 'AirPods Pro 2',
            description: 'Беспроводные наушники с шумоподавлением и адаптивным эквалайзером',
            imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
            probability: 0.05,
            totalCount: 5,
            redeemedCount: 0,
        },
        {
            name: 'Apple Watch Series 9',
            description: 'Умные часы с Always-On дисплеем и датчиком здоровья',
            imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400',
            probability: 0.07,
            totalCount: 7,
            redeemedCount: 0,
        },
        {
            name: 'iPad Air 2024',
            description: 'Планшет с процессором M2, 10.9" дисплеем и поддержкой Apple Pencil',
            imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
            probability: 0.1,
            totalCount: 10,
            redeemedCount: 0,
        },
        {
            name: 'Скидка 50%',
            description: 'Скидка 50% на любой товар в магазине. Действует 7 дней',
            imageUrl: null,
            probability: 0.15,
            totalCount: 50,
            redeemedCount: 0,
        },
        {
            name: 'Скидка 25%',
            description: 'Скидка 25% на следующую покупку. Действует 14 дней',
            imageUrl: null,
            probability: 0.2,
            totalCount: 100,
            redeemedCount: 0,
        },
        {
            name: '1000 виртуальных монет',
            description: '1000 монет для использования в приложении',
            imageUrl: null,
            probability: 0.25,
            totalCount: 200,
            redeemedCount: 0,
        },
        {
            name: '500 бонусных очков',
            description: '500 бонусных очков для программы лояльности',
            imageUrl: null,
            probability: 0.15,
            totalCount: 300,
            redeemedCount: 0,
        },
    ];

    for (const prize of prizes) {
        const created = await prisma.prize.create({
            data: {
                ...prize,
                isActive: true, // Убеждаемся, что приз активен
            },
        });
        console.log(`   ✅ Prize создан: ${created.name} (Шанс: ${created.probability * 100}%, Кол-во: ${created.totalCount})`);
    }

    // ============ ЗАПОЛНЕНИЕ ПОБЕДИТЕЛЕЙ ============
    console.log('\n🏆 Заполнение победителей...');

    // 1. Получаем призы (пользователи admin и testUser уже доступны из переменных выше)
    const dbPrizes = await prisma.prize.findMany();
    if (dbPrizes.length < 5) {
        throw new Error('Недостаточно призов для создания победителей');
    }

    // 2. Очищаем таблицу перед заполнением (чтобы данные перезаписывались)
    await prisma.winner.deleteMany({});
    console.log('   🗑️ Старые записи о победителях удалены');

    // 3. Создаем 5 победителей, используя существующие переменные admin и testUser
    const winnersData = [
        {
            username: 'alex_gamer',
            userId: admin.id,      // Используем переменную admin
            prizeId: dbPrizes[0].id, // iPhone 15
            isIssued: true,
        },
        {
            username: 'maria_lucky',
            userId: testUser.id,   // Используем переменную testUser
            prizeId: dbPrizes[1].id, // MacBook
            isIssued: false,
        },
        {
            username: 'ivan_spin',
            userId: admin.id,
            prizeId: dbPrizes[2].id, // AirPods
            isIssued: false,
        },
        {
            username: 'elena_win',
            userId: testUser.id,
            prizeId: dbPrizes[3].id, // Apple Watch
            isIssued: true,
        },
        {
            username: 'petro_pro',
            userId: admin.id,
            prizeId: dbPrizes[4].id, // iPad
            isIssued: false,
        },
    ];

    for (const w of winnersData) {
        await prisma.winner.create({
            data: {
                ...w,
                // Устанавливаем дату выдачи, если приз выдан
                issuedAt: w.isIssued ? new Date() : null,
            },
        });
    }
    console.log('   ✅ Создано 5 победителей');
}

main()
    .catch((e) => {
        console.error('\n❌ Ошибка при заполнении БД:', e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });