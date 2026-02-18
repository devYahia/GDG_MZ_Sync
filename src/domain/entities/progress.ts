export interface InternProgress {
    id: string;
    userId: string;
    projectId: string;
    status: 'in_progress' | 'completed';
    lastActivityAt: Date | null;
    lastReviewAt: Date | null;
    lastReviewApproved: boolean | null;
    createdAt: Date;
    updatedAt: Date;
}
