import { redirect } from "next/navigation"
import { auth } from "@/infrastructure/auth/auth"
import { container } from "@/infrastructure/container"

export default async function InterviewLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    const user = await container.userRepository.findById(session.user.id)
    if (!user) redirect("/login")

    // Ensure onboarding is completed
    if (!user.field || !user.experienceLevel) {
        redirect("/onboarding")
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30">
            {/* We strip away all Dashboard sidebars here to provide a distraction-free, full-screen experience */}
            <main className="min-h-screen w-full overflow-y-auto overflow-x-hidden flex flex-col">
                {children}
            </main>
        </div>
    )
}
