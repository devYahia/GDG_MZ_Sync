import { IUserRepository } from "@/domain/repositories/user-repository";
import { AppError } from "@/domain/errors/app-error";

export interface OnboardingParams {
    userId: string;
    field: string;
    experienceLevel: string;
    interests: string[];
}

export class CompleteOnboardingUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(params: OnboardingParams) {
        if (!params.userId) throw new AppError("User ID is required");

        await this.userRepository.update(params.userId, {
            field: params.field as any,
            experienceLevel: params.experienceLevel as any,
            interests: params.interests,
            onboardingCompleted: true,
        });

        return { success: true };
    }
}
