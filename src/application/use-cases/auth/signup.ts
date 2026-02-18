import { IUserRepository, CreateUserParams } from "@/domain/repositories/user-repository";
import { User } from "@/domain/entities/user";
import { ValidationError } from "@/domain/errors/app-error";
import bcrypt from "bcryptjs";

export class SignupUseCase {
    constructor(private userRepository: IUserRepository) { }

    async execute(data: CreateUserParams & { password?: string }): Promise<User> {
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new ValidationError("User with this email already exists");
        }

        let hashedPassword = undefined;
        if (data.password) {
            hashedPassword = await bcrypt.hash(data.password, 10);
        }

        return this.userRepository.create({
            ...data,
            password: hashedPassword,
        });
    }
}
