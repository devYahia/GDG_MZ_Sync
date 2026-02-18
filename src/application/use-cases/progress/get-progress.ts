import { IProgressRepository } from "@/domain/repositories/progress-repository";
import { InternProgress } from "@/domain/entities/progress";

export class GetProgressUseCase {
    constructor(private progressRepository: IProgressRepository) { }

    async execute(userId: string): Promise<InternProgress[]> {
        return this.progressRepository.findByUserId(userId);
    }

    async getProjectProgress(userId: string, projectId: string): Promise<InternProgress | null> {
        return this.progressRepository.findById(projectId, userId);
    }
}
