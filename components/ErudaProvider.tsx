'use client'

import { useEffect, useRef } from 'react'

interface ErudaProviderProps {
    children: React.ReactNode
}

export default function ErudaProvider({ children }: ErudaProviderProps) {
    const isInitialized = useRef(false)

    useEffect(() => {
        if (isInitialized.current || process.env.NODE_ENV !== 'development') {
            return
        }

        const initEruda = async () => {
            try {
                const eruda = await import('eruda')
                eruda.default.init()
                isInitialized.current = true
                console.log('🔧 Eruda debug tools initialized')
            } catch (error) {
                console.warn('Eruda initialization skipped:', error)
            }
        }

        initEruda()
    }, [])

    return <>{children}</>
}