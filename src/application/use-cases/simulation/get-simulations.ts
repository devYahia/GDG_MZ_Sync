import { ISimulationRepository } from "@/domain/repositories/simulation-repository";
import { Simulation } from "@/domain/entities/simulation";

export class GetSimulationsUseCase {
    constructor(private simulationRepository: ISimulationRepository) { }

    async execute(userId: string): Promise<Simulation[]> {
        return this.simulationRepository.findByUserId(userId);
    }

    async getById(id: string): Promise<Simulation | null> {
        return this.simulationRepository.findById(id);
    }
}
