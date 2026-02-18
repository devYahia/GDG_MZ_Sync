export interface Milestone {
    id: string;
    title: string;
    description: string;
    completed: boolean;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    answer: string;
}

export interface Resource {
    title: string;
    url: string;
    type: string;
}

export interface Simulation {
    id: string;
    userId: string;
    title: string;
    context: string | null;
    domain: string | null;
    difficulty: 'easy' | 'medium' | 'hard' | null;
    level: number;
    estimatedDuration: string | null;
    techStack: string[];
    overview: string | null;
    learningObjectives: string[];
    functionalRequirements: string[];
    nonFunctionalRequirements: string[];
    milestones: Milestone[];
    resources: Resource[];
    quiz: QuizQuestion[];
    field: string | null;
    duration: string | null;
    tools: string[];
    clientPersona: string | null;
    clientMood: string | null;
    description: string | null;

    createdAt: Date;
    updatedAt: Date;
}
