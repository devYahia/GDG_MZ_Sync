export interface Persona {
    id: string;
    simulationId: string;
    name: string;
    role: string;
    personality: string | null;
    systemPrompt: string | null;
    initialMessage: string | null;
    createdAt: Date;
}
