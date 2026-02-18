import { Simulation } from "@/domain/entities/simulation";

export interface CreateSimulationParams extends Omit<Simulation, "id" | "createdAt" | "updatedAt"> { }

export interface ISimulationRepository {
    findById(id: string): Promise<Simulation | null>;
    findByUserId(userId: string): Promise<Simulation[]>;
    create(data: CreateSimulationParams): Promise<Simulation>;
    delete(id: string): Promise<void>;
}
