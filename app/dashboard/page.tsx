import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { decrypt } from "@/utils/session";
import DashboardPage from '@/components/dashboard/DashboardPage';

export default async function Dashboard() {
    // 1. Получаем куки
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    // 2. Если сессии нет — редирект
    if (!sessionToken) {
        redirect('/');
    }

    // 3. Расшифровываем сессию
    const decrypted = await decrypt(sessionToken);

    // 4. Проверяем роль пользователя
    if (!decrypted?.user || decrypted.user.role !== 'ADMIN') {
        redirect('/');
    }

    // 5. Рендерим дашборд
    return <DashboardPage />;
}