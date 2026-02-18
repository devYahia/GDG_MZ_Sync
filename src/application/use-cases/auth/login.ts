import { IUserRepository } from "@/domain/repositories/user-repository";
import { AuthError } from "@/domain/errors/app-error";
import { signIn } from "@/infrastructure/auth/auth";

export class LoginUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(formData: FormData) {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email || !password) {
            throw new AuthError("Email and password are required");
        }

        try {
            await signIn("credentials", {
                email,
                password,
                redirect: false,
            });
            return { success: true };
        } catch (error: any) {
            if (error.type === "CredentialsSignin") {
                throw new AuthError("Invalid email or password");
            }
            throw new AuthError(error.message || "Authentication failed");
        }
    }
}
