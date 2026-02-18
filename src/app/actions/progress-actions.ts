"use server";

import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import { GetProgressUseCase } from "@/application/use-cases/progress/get-progress";
import { UpdateProgressUseCase } from "@/application/use-cases/progress/update-progress";
import { UpsertProgressParams } from "@/domain/repositories/progress-repository";
import { revalidatePath } from "next/cache";

const getProgressUseCase = new GetProgressUseCase(container.progressRepository);
const updateProgressUseCase = new UpdateProgressUseCase(container.progressRepository);

export async function getProgressAction() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return getProgressUseCase.execute(session.user.id);
}

export async function updateProgressAction(data: Omit<UpsertProgressParams, "userId">) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    try {
        const progress = await updateProgressUseCase.execute({
            ...data,
            userId: session.user.id
        });

        revalidatePath("/dashboard");
        return { success: true, data: progress };
    } catch (error: any) {
        return { error: error.message };
    }
}
