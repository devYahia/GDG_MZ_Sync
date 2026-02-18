import { IPersonaRepository, CreatePersonaParams } from "@/domain/repositories/persona-repository";
import { Persona } from "@/domain/entities/persona";
import { db } from "../drizzle";
import { personas } from "../schema/personas";
import { eq } from "drizzle-orm";

export class DrizzlePersonaRepository implements IPersonaRepository {
    async findBySimulationId(simulationId: string): Promise<Persona[]> {
        const result = await db.select().from(personas).where(eq(personas.simulationId, simulationId));
        return result as unknown as Persona[];
    }

    async createMany(simulationId: string, items: CreatePersonaParams[]): Promise<Persona[]> {
        if (items.length === 0) return [];

        // items usually don't have simulationId if passed to parent, but here the interface expects CreatePersonaParams which IS Omit<Persona, id|created>.
        // So it includes simulationId.
        // If not, we map it.

        const result = await db.insert(personas).values(
            items.map(p => ({
                ...p,
                simulationId: p.simulationId || simulationId // Ensure it matches if missing
            }))
        ).returning();

        return result as unknown as Persona[];
    }
}
