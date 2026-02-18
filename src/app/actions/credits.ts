"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";

export type CreditResult = {
    error?: string;
    success?: boolean;
    credits?: number;
};

export async function checkAndDeductCredits(): Promise<CreditResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "You must be logged in to start a simulation." };
    }

    try {
        const result = await container.creditsUseCase.checkAndDeduct(session.user.id);

        if (!result.success) {
            return { error: `Insufficient credits. You need 3 credits to start a simulation.` };
        }

        revalidatePath("/dashboard", "layout");
        return { success: true, credits: result.remaining };
    } catch (error: any) {
        return { error: "Failed to deduct credits. Please try again." };
    }
}

export async function getUserCredits(): Promise<CreditResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Not authenticated" };
    }

    try {
        const credits = await container.creditsUseCase.getCredits(session.user.id);
        return { success: true, credits };
    } catch (error: any) {
        return { error: "Could not load credits" };
    }
}

export async function addCredits(amount: number): Promise<CreditResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "You must be logged in to purchase credits." };
    }

    try {
        const result = await container.creditsUseCase.addCredits(session.user.id, amount);
        revalidatePath("/dashboard", "layout");
        return { success: true, credits: result };
    } catch (error: any) {
        return { error: error.message || "Failed to add credits. Please try again." };
    }
}
