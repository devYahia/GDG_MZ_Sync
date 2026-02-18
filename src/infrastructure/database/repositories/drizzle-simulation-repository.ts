import { ISimulationRepository, CreateSimulationParams } from "@/domain/repositories/simulation-repository";
import { Simulation } from "@/domain/entities/simulation";
import { db } from "../drizzle";
import { simulations } from "../schema/simulations";
import { eq, desc } from "drizzle-orm";

export class DrizzleSimulationRepository implements ISimulationRepository {
    async findById(id: string): Promise<Simulation | null> {
        const result = await db.select().from(simulations).where(eq(simulations.id, id)).limit(1);
        // Cast jsonb fields if necessary, Drizzle handles basic types well.
        return (result[0] as unknown as Simulation) || null;
    }

    async findByUserId(userId: string): Promise<Simulation[]> {
        const result = await db.select()
            .from(simulations)
            .where(eq(simulations.userId, userId))
            .orderBy(desc(simulations.createdAt));

        return result as unknown as Simulation[];
    }

    async create(data: CreateSimulationParams): Promise<Simulation> {
        const result = await db.insert(simulations).values({
            userId: data.userId,
            title: data.title,
            context: data.context,
            domain: data.domain,
            difficulty: data.difficulty,
            level: data.level,
            estimatedDuration: data.estimatedDuration,
            techStack: data.techStack as any,
            overview: data.overview,
            learningObjectives: data.learningObjectives as any,
            functionalRequirements: data.functionalRequirements as any,
            nonFunctionalRequirements: data.nonFunctionalRequirements as any,
            milestones: data.milestones as any,
            resources: data.resources as any,
            quiz: data.quiz as any,
            field: data.field,
            duration: data.duration,
            tools: data.tools as any,
            clientPersona: data.clientPersona,
            clientMood: data.clientMood,
            description: data.description,
        }).returning();

        return result[0] as unknown as Simulation;
    }

    async delete(id: string): Promise<void> {
        await db.delete(simulations).where(eq(simulations.id, id));
    }
}
