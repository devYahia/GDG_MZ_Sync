import { ISimulationRepository, CreateSimulationParams } from "@/domain/repositories/simulation-repository";
import { IPersonaRepository } from "@/domain/repositories/persona-repository";
import { IUserRepository } from "@/domain/repositories/user-repository";
import { Simulation } from "@/domain/entities/simulation";
import { ValidationError, NotFoundError } from "@/domain/errors/app-error";

export class CreateSimulationUseCase {
    constructor(
        private simulationRepository: ISimulationRepository,
        private personaRepository: IPersonaRepository,
        private userRepository: IUserRepository
    ) { }

    async execute(data: CreateSimulationParams): Promise<Simulation> {
        const user = await this.userRepository.findById(data.userId);
        if (!user) {
            throw new NotFoundError("User");
        }

        // Check credits?
        if (user.credits < 1) {
            throw new ValidationError("Insufficient credits");
        }

        // Deduct credit
        await this.userRepository.updateCredits(user.id, -1);

        // Create simulation
        return this.simulationRepository.create(data);
    }
}
