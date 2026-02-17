// import { cookies } from 'next/headers';
// import { redirect } from 'next/navigation';
// import { decrypt } from "@/utils/session";
// import { prisma } from '@/prisma/prisma-client';
// import { UserInfoCard } from '@/components/UserInfoCard';
// import CarouselPrizes from '@/components/CarouselPrizes';
// import { Prize } from '@/types/prize';
// import { getPrizes } from "@/app/actions";

// export default async function ProfilePage() {
//     // 1. ПРОВЕРКА АВТОРИЗАЦИИ (Сначала — чтобы не тратить ресурсы)
//     const cookieStore = await cookies();
//     const sessionToken = cookieStore.get('session')?.value;

//     if (!sessionToken) {
//         redirect('/');
//     }

//     const decrypted = await decrypt(sessionToken);
//     const userId = decrypted?.user?.id;

//     if (!userId) {
//         redirect('/');
//     }

//     // 2. ПОЛУЧЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ
//     const user = await prisma.user.findUnique({
//         where: { id: userId },
//         select: {
//             id: true,
//             telegramId: true,
//             username: true,
//             firstName: true,
//             lastName: true,
//             tokenBalance: true,
//             createdAt: true,
//         },
//     });

//     if (!user) {
//         redirect('/');
//     }

//     // 3. ПОЛУЧЕНИЕ ДАННЫХ ПРИЗОВ (Только если пользователь авторизован)
//     const rawPrizes = await getPrizes();
//     const prizes: Prize[] = rawPrizes.map((prize) => ({
//         ...prize,
//         createdAt: prize.createdAt.toISOString(),
//         updatedAt: prize.updatedAt.toISOString(),
//     }));

//     return (
//         <div className="max-w-2xl mx-auto p-4 pt-24 space-y-6">
//             {/* Карточка пользователя */}
//             <UserInfoCard user={user} />

//             {/* Секция с призами */}
//             <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

//                 <div className="min-h-[300px] flex items-center justify-center">
//                     <CarouselPrizes prizes={prizes} />
//                 </div>
//             </div>
//         </div>
//     );
// }


//==================

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from "@/utils/session";
import { prisma } from '@/prisma/prisma-client';
import { getPrizes } from "@/app/actions";
import { ProfileContent } from "@/components/ProfileContent";
import { Prize } from '@/types/prize';

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) redirect('/');

    const decrypted = await decrypt(sessionToken);
    const userId = decrypted?.user?.id;

    if (!userId) redirect('/');

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            telegramId: true,
            username: true,
            firstName: true,
            lastName: true,
            tokenBalance: true,
            createdAt: true,
        },
    });

    if (!user) redirect('/');

    const rawPrizes = await getPrizes();
    const prizes: Prize[] = rawPrizes.map((prize) => ({
        ...prize,
        createdAt: prize.createdAt.toISOString(),
        updatedAt: prize.updatedAt.toISOString(),
    }));

    return <ProfileContent initialUser={user} prizes={prizes} />;
}