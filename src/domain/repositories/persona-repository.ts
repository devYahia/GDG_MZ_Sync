import { Persona } from "@/domain/entities/persona";

export interface CreatePersonaParams extends Omit<Persona, "id" | "createdAt"> { }

export interface IPersonaRepository {
    findBySimulationId(simulationId: string): Promise<Persona[]>;
    createMany(simulationId: string, personas: CreatePersonaParams[]): Promise<Persona[]>;
}
