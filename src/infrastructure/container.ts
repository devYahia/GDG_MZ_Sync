import { DrizzleUserRepository } from "@/infrastructure/database/repositories/drizzle-user-repository";
import { DrizzleSimulationRepository } from "@/infrastructure/database/repositories/drizzle-simulation-repository";
import { DrizzlePersonaRepository } from "@/infrastructure/database/repositories/drizzle-persona-repository";
import { DrizzleProgressRepository } from "@/infrastructure/database/repositories/drizzle-progress-repository";
import { DrizzleAchievementRepository } from "@/infrastructure/database/repositories/drizzle-achievement-repository";
import { db } from "@/infrastructure/database/drizzle";

// Use Cases
import { SignupUseCase } from "@/application/use-cases/auth/signup";
import { LoginUseCase } from "@/application/use-cases/auth/login";
import { GetUserProjectsUseCase } from "@/application/use-cases/projects/get-user-projects";
import { CompleteOnboardingUseCase } from "@/application/use-cases/onboarding/complete-onboarding";
import { CreditsUseCase } from "@/application/use-cases/credits/credits-use-case";
import { CreateSimulationUseCase } from "@/application/use-cases/simulation/create-simulation";

// Repositories
const userRepository = new DrizzleUserRepository();
const simulationRepository = new DrizzleSimulationRepository();
const personaRepository = new DrizzlePersonaRepository();
const progressRepository = new DrizzleProgressRepository();
const achievementRepository = new DrizzleAchievementRepository();

// Use Case Instances
const signupUseCase = new SignupUseCase(userRepository);
const loginUseCase = new LoginUseCase(userRepository);
const getUserProjectsUseCase = new GetUserProjectsUseCase(progressRepository, simulationRepository);
const completeOnboardingUseCase = new CompleteOnboardingUseCase(userRepository);
const creditsUseCase = new CreditsUseCase(userRepository);
const createSimulationUseCase = new CreateSimulationUseCase(simulationRepository, personaRepository, userRepository);

export const container = {
    // Repos
    userRepository,
    simulationRepository,
    personaRepository,
    progressRepository,
    achievementRepository,

    // Use Cases
    signupUseCase,
    loginUseCase,
    getUserProjectsUseCase,
    completeOnboardingUseCase,
    creditsUseCase,
    createSimulationUseCase,

    db,
};
