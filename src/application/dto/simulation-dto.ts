import { Simulation } from "@/domain/entities/simulation";

export type SimulationDTO = Simulation;

export type CreateSimulationDTO = Omit<Simulation, "id" | "createdAt" | "updatedAt">;
