import { z } from "zod";

export const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").nullable().optional(),
    email: z.string().email("Please enter a valid email address"),
    image: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    field: z.enum(['frontend', 'backend', 'fullstack', 'mobile', 'data', 'design']).optional(),
    experienceLevel: z.enum(['student', 'fresh_grad', 'junior']).optional(),
    interests: z.array(z.string()).optional(),
    region: z.string().nullable().optional(),
    credits: z.number().optional(),
    onboardingCompleted: z.boolean().optional(),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

export const onboardingSchema = z.object({
    field: z.string().min(1, "Field is required"),
    experienceLevel: z.string().min(1, "Experience level is required"),
    interests: z.array(z.string()).min(1, "Select at least one interest"),
});

export const updateProgressSchema = z.object({
    projectId: z.string().min(1, "Project ID is required"),
    status: z.enum(['not_started', 'in_progress', 'completed']),
    lastActivityAt: z.date().nullable().optional(),
    lastReviewAt: z.date().nullable().optional(),
    lastReviewApproved: z.boolean().optional(),
});
