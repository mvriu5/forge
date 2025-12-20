import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import type { Session } from "@/lib/auth"


export async function getServerSession(req: Request): Promise<Session | null> {
    try {
        const session = await auth.api.getSession({ headers: req.headers })
        return (session as Session) ?? null
    } catch (error) {
        return null
    }
}

export async function getServerUserId(req: Request): Promise<string | null> {
    const session = await getServerSession(req)
    if (!session || !session.user?.id) return null
    return String(session.user.id)
}

export async function requireServerUserId(req: Request): Promise<{ userId: string; session: Session }> {
    const session = await getServerSession(req)

    if (!session || !session.user?.id) throw NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    return {
      userId: String(session.user.id),
      session: session as Session,
    }
}

export async function requireMatchingUserId(req: Request, expectedUserId: string): Promise<{ userId: string; session: Session }> {
    const { userId, session } = await requireServerUserId(req)

    if (userId !== expectedUserId) throw NextResponse.json({ error: "Forbidden" }, { status: 403 })

    return { userId, session }
}

export default {
    getServerSession,
    getServerUserId,
    requireServerUserId,
    requireMatchingUserId,
}
