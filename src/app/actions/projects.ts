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

export async function deleteUserProject(id: string, isCustom: boolean): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Not authenticated" };

    try {
        const { db } = await import("@/infrastructure/database/drizzle");
        const { eq, and } = await import("drizzle-orm");

        if (isCustom) {
            const { simulations } = await import("@/infrastructure/database/schema/simulations");
            await db.delete(simulations).where(and(eq(simulations.id, id), eq(simulations.userId, session.user.id)));
        } else {
            const { internProgress } = await import("@/infrastructure/database/schema/intern-progress");
            await db.delete(internProgress).where(and(eq(internProgress.id, id), eq(internProgress.userId, session.user.id)));
        }

        const { revalidatePath } = await import("next/cache");
        revalidatePath("/dashboard/projects");

        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete user project:", error);
        return { success: false, error: error.message };
    }
}
