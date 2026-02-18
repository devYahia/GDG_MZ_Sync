import { IUserRepository } from "@/domain/repositories/user-repository";
import { AppError } from "@/domain/errors/app-error";

export class CreditsUseCase {
    constructor(private userRepository: IUserRepository) { }

    async getCredits(userId: string): Promise<number> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new AppError("User not found");
        return user.credits;
    }

    async addCredits(userId: string, amount: number): Promise<number> {
        if (amount <= 0) throw new AppError("Amount must be positive");
        return await this.userRepository.updateCredits(userId, amount);
    }

    async checkAndDeduct(userId: string, cost: number = 3): Promise<{ success: boolean; remaining: number }> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new AppError("User not found");

        if (user.credits < cost) {
            return { success: false, remaining: user.credits };
        }

        const newBalance = await this.userRepository.updateCredits(userId, -cost);
        return { success: true, remaining: newBalance };
    }
}
