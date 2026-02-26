import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Только изображения' }, { status: 400 })
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Макс размер 5MB' }, { status: 400 })
        }

        // Получаем имя файла - это хеш (если пришёл с хешем)
        const originalName = file.name
        const ext = originalName.split('.').pop() || 'png'

        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })

        // Проверяем, существует ли файл с таким именем (хешем)
        try {
            const files = await readdir(uploadDir)
            const existingFile = files.find(f => f.split('.')[0] === originalName.split('.')[0])

            if (existingFile) {
                // Файл уже существует - возвращаем существующий URL
                return NextResponse.json({
                    url: `/uploads/${existingFile}`,
                    exists: true,
                })
            }
        } catch {
            // Папка пустая или не существует - продолжаем загрузку
        }

        // Загружаем новый файл
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Используем имя файла как есть (с хешем)
        const uniqueName = `${originalName}`

        const filePath = path.join(uploadDir, uniqueName)
        await writeFile(filePath, buffer)

        return NextResponse.json({
            url: `/uploads/${uniqueName}`,
            exists: false,
        })
    } catch (error) {
        console.error('Ошибка загрузки:', error)
        return NextResponse.json({ error: 'Ошибка загрузки' }, { status: 500 })
    }
}