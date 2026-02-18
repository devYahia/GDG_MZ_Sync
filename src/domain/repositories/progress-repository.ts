import { InternProgress } from "@/domain/entities/progress";

export interface UpsertProgressParams {
    userId: string;
    projectId: string;
    status: 'not_started' | 'in_progress' | 'completed';
    lastActivityAt?: Date | null;
    lastReviewAt?: Date | null;
    lastReviewApproved?: boolean;
}

export interface IProgressRepository {
    findByUserId(userId: string): Promise<InternProgress[]>;
    upsert(data: UpsertProgressParams): Promise<InternProgress>;
    findById(projectId: string, userId: string): Promise<InternProgress | null>;
}
