import { NextResponse } from "next/server";
import { auth } from "@/infrastructure/auth/auth";
import { db } from "@/infrastructure/database/drizzle";
import { interviewSessions } from "@/infrastructure/database/schema";
import { z } from "zod";

const initSchema = z.object({
    role: z.string().min(1),
    difficulty: z.enum(["junior", "mid", "senior"]),
    focusAreas: z.array(z.string()).optional()
});

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = initSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid payload", details: parsed.error.format() }, { status: 400 });
        }

        const [newSession] = await db.insert(interviewSessions).values({
            userId: session.user.id,
            role: parsed.data.role,
            difficulty: parsed.data.difficulty,
            focusAreas: parsed.data.focusAreas || [],
            status: "active"
        }).returning({ id: interviewSessions.id });

        return NextResponse.json({
            sessionId: newSession.id,
            aiGreeting: `Welcome. I will be your engineering manager for this session. We are assessing your problem-solving skills for the ${parsed.data.role} position. Are you ready to begin?`
        });
    } catch (error) {
        console.error("[INTERVIEW_INIT]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
