import { TaskField } from "@/lib/tasks";

export type ProjectType = "predefined" | "custom";
export type ProjectStatus = "in_progress" | "completed";

export interface UserProject {
    id: string;
    title: string;
    description: string;
    field: TaskField;
    fieldLabel: string;
    type: ProjectType;
    status: ProjectStatus;
    lastActivity: string | Date;
    difficulty: string;
    level: number;
    duration: string;
    tools: string[];
    clientPersona: string;
    clientMood: string;
    /** Only set for custom simulations */
    simulationId?: string;
}
