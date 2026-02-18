import { IProgressRepository } from "@/domain/repositories/progress-repository";
import { ISimulationRepository } from "@/domain/repositories/simulation-repository";
import { TASKS, FIELD_CONFIG, TaskField } from "@/lib/tasks";
import { UserProject } from "@/application/dto/project-dto";

export class GetUserProjectsUseCase {
    constructor(
        private progressRepository: IProgressRepository,
        private simulationRepository: ISimulationRepository
    ) { }

    async execute(userId: string): Promise<UserProject[]> {
        const [progressList, simulationsList] = await Promise.all([
            this.progressRepository.findByUserId(userId),
            this.simulationRepository.findByUserId(userId),
        ]);

        const projects: UserProject[] = [];

        // Predefined tasks
        for (const row of progressList) {
            const task = TASKS.find((t) => t.id === row.projectId);
            if (!task) continue;

            projects.push({
                id: row.projectId,
                title: task.title,
                description: task.description,
                field: task.field,
                fieldLabel: FIELD_CONFIG[task.field]?.label ?? task.field,
                type: "predefined",
                status: row.status === "completed" ? "completed" : "in_progress",
                lastActivity: row.lastActivityAt ?? row.createdAt,
                difficulty: task.difficulty,
                level: task.level,
                duration: task.duration,
                tools: task.tools,
                clientPersona: task.clientPersona,
                clientMood: task.clientMood,
            });
        }

        // Custom simulations
        for (const sim of simulationsList) {
            const field = (sim.domain as TaskField) || "fullstack";
            const config = FIELD_CONFIG[field] || FIELD_CONFIG["fullstack"];

            projects.push({
                id: `sim-${sim.id}`,
                simulationId: sim.id,
                title: sim.title,
                description: sim.description || "Custom AI-generated simulation",
                field,
                fieldLabel: config.label,
                type: "custom",
                status: "in_progress",
                lastActivity: sim.updatedAt ?? sim.createdAt,
                difficulty: sim.difficulty || "medium",
                level: sim.level,
                duration: sim.duration || "Variable",
                tools: sim.techStack,
                clientPersona: sim.clientPersona || "AI Client",
                clientMood: sim.clientMood || "Neutral",
            });
        }

        // Sort by activity
        return projects.sort(
            (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
        );
    }
}
