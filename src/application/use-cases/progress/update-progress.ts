import { IProgressRepository, UpsertProgressParams } from "@/domain/repositories/progress-repository";
import { InternProgress } from "@/domain/entities/progress";

export class UpdateProgressUseCase {
    constructor(private progressRepository: IProgressRepository) { }

    async execute(data: UpsertProgressParams): Promise<InternProgress> {
        return this.progressRepository.upsert({
            ...data,
            lastActivityAt: new Date(),
        });
    }
}
