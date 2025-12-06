import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    console.error('❌ JWT_SECRET is not set in environment variables');
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET is required in production');
    } else {
        console.warn('⚠️ Using temporary key for development');
    }
}


const key = new TextEncoder().encode(
    jwtSecret || 'temporary-dev-key-min-32-chars-!!'
);

export const SESSION_DURATION = 60 * 60 * 1000 //1 hour

export async function encrypt(payload: any) {
    try {
        if (!payload) {
            throw new Error('Payload is required for encryption');
        }

        return await new SignJWT(payload)
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("1 hour")
            .sign(key);
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt session');
    }
}

export async function decrypt(input: string): Promise<any> {
    try {
        if (!input || typeof input !== 'string') {
            console.warn('Invalid input for decryption');
            return null;
        }

        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
        });

        return payload;
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}

export async function getSession() {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("session")?.value;

        if (!session) {
            return null;
        }

        const decoded = await decrypt(session);
        return decoded;
    } catch (error) {
        console.error('Get session error:', error);
        return null;
    }
}

export async function updateSession(request: NextRequest) {
    try {
        const session = request.cookies.get("session")?.value;
        console.log(session, 'IIIII');

        if (!session) {
            return NextResponse.next();
        }

        const parsed = await decrypt(session);

        if (!parsed) {
            const response = NextResponse.next();
            response.cookies.delete("session");
            return response;
        }

        if (parsed.exp && new Date(parsed.exp * 1000) < new Date()) {
            const response = NextResponse.next();
            response.cookies.delete("session");
            return response;
        }

        const newExpires = new Date(Date.now() + SESSION_DURATION);
        const newSession = await encrypt({
            ...parsed,
            expires: newExpires
        });

        const response = NextResponse.next();
        response.cookies.set({
            name: "session",
            value: newSession,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            expires: newExpires,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error('Update session error:', error);
        return NextResponse.next();
    }
}