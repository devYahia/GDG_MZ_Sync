import { IProgressRepository, UpsertProgressParams } from "@/domain/repositories/progress-repository";
import { InternProgress } from "@/domain/entities/progress";
import { db } from "../drizzle";
import { internProgress } from "../schema/intern-progress";
import { eq, and } from "drizzle-orm";

export class DrizzleProgressRepository implements IProgressRepository {
    async findByUserId(userId: string): Promise<InternProgress[]> {
        const result = await db.select().from(internProgress).where(eq(internProgress.userId, userId));
        return result as unknown as InternProgress[];
    }

    async findById(projectId: string, userId: string): Promise<InternProgress | null> {
        const result = await db.select()
            .from(internProgress)
            .where(and(eq(internProgress.projectId, projectId), eq(internProgress.userId, userId)))
            .limit(1);
        return (result[0] as unknown as InternProgress) || null;
    }

    async upsert(data: UpsertProgressParams): Promise<InternProgress> {
        const result = await db.insert(internProgress)
            .values({
                userId: data.userId,
                projectId: data.projectId,
                status: data.status,
                lastActivityAt: data.lastActivityAt,
                lastReviewAt: data.lastReviewAt,
                lastReviewApproved: data.lastReviewApproved,
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: [internProgress.userId, internProgress.projectId],
                set: {
                    status: data.status,
                    lastActivityAt: data.lastActivityAt,
                    lastReviewAt: data.lastReviewAt,
                    lastReviewApproved: data.lastReviewApproved,
                    updatedAt: new Date(),
                }
            })
            .returning();

        return result[0] as unknown as InternProgress;
    }
}
