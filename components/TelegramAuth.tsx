'use client'

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function TelegramAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/session')
            if (response.ok) {
                setIsAuthenticated(true)
            }
        } catch (error) {
            console.error('Error checking auth:', error)
        }
    }

    const authenticateUser = async () => {
        setIsLoading(true)
        try {
            const { postEvent, isTMA } = await import('@telegram-apps/sdk')

            console.log('Is Telegram environment:', isTMA());

            postEvent('web_app_ready');



            function getRawTelegramInitData() {
                const hash = window.location.hash.substring(1);
                const urlParams = new URLSearchParams(hash);
                return urlParams.get('tgWebAppData');
            }

            const rawInitData = getRawTelegramInitData();

            if (!rawInitData) {
                console.error('No Telegram init data found')
                setIsAuthenticated(false)
                return
            }

            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ initData: rawInitData })
            })

            if (response.ok) {
                setIsAuthenticated(true)
                router.refresh()
            } else {
                console.error('Authentication failed !!!')
                setIsAuthenticated(false)
            }
        } catch (error) {
            console.error('Error during authentication:', error)
            setIsAuthenticated(false)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center space-y-4 p-8">
            {isAuthenticated ? (
                <div>
                    <p>Authenticated!</p>
                    <button
                        onClick={() => router.push('/protected')}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Access Protected Page
                    </button>
                </div>
            ) : (
                <div>
                    <p>You need be an owner of this account</p>
                    <button
                        onClick={authenticateUser}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Authenticated
                    </button>
                </div>
            )}
        </div>
    )
}