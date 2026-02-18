"use server";

import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import { UserProject } from "@/application/dto/project-dto";

export async function getUserProjects(): Promise<{
    projects: UserProject[];
    error?: string;
}> {
    const session = await auth();
    if (!session?.user?.id) return { projects: [], error: "Not authenticated" };

    try {
        const projects = await container.getUserProjectsUseCase.execute(session.user.id);
        return { projects };
    } catch (error: any) {
        console.error("Failed to fetch user projects:", error);
        return { projects: [], error: error.message };
    }
}
