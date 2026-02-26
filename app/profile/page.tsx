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