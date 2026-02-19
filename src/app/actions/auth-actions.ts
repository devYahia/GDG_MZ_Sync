"use server";

import { signOut, auth } from "@/infrastructure/auth/auth";
import { container } from "@/infrastructure/container";
import { CreateUserParams } from "@/domain/repositories/user-repository";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function loginAction(prevState: string | undefined, formData: FormData) {
    try {
        await container.loginUseCase.execute(formData);
    } catch (error: any) {
        if (error.name === "AuthError") {
            return { error: error.message };
        }
        return { error: "Something went wrong." };
    }

    redirect("/dashboard");
}

export async function signupAction(data: CreateUserParams & { password?: string }) {
    try {
        await container.signupUseCase.execute(data);
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function logoutAction() {
    await signOut();
}

export async function getProfileAction() {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    const user = await container.userRepository.findById(session.user.id);
    if (!user) return { error: "User not found" };

    return { user };
}

export async function getEnhancedProfileAction() {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    try {
        const [user, achievements, simulations] = await Promise.all([
            container.userRepository.findById(session.user.id),
            container.achievementRepository.getEnrichedAchievements(session.user.id),
            container.simulationRepository.findByUserId(session.user.id),
        ]);

        if (!user) return { error: "User not found" };

        return {
            user,
            achievements,
            simulationCount: simulations.length,
        };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function completeOnboardingAction(data: {
    field: string;
    experienceLevel: string;
    interests: string[];
}) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Not authenticated" };

    try {
        await container.completeOnboardingUseCase.execute({
            userId: session.user.id,
            field: data.field,
            experienceLevel: data.experienceLevel,
            interests: data.interests,
        });
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}
