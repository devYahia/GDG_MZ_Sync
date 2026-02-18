import { auth } from "@/infrastructure/auth/auth"
import { container } from "@/infrastructure/container"
import { notFound, redirect } from "next/navigation"
import { SimulationView } from "@/components/simulation-view"

interface ViewMilestone {
    title: string
    description: string
    deliverables: string[]
}

export default async function SimulationDetailPage({ params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    try {
        const simulation = await container.simulationRepository.findById(params.id)
        if (!simulation) notFound()

        const personas = await container.personaRepository.findBySimulationId(params.id)

        // Map to View structure
        const viewData = {
            title: simulation.title,
            domain: simulation.domain || "fullstack",
            difficulty: (simulation.difficulty as any) || "easy",
            estimated_duration: "Project-based",
            tech_stack: simulation.techStack || [],
            overview: simulation.context || "",
            learning_objectives: simulation.learningObjectives || [],
            functional_requirements: simulation.functionalRequirements || [],
            non_functional_requirements: simulation.nonFunctionalRequirements || [],
            milestones: (simulation.milestones || []).map((m: any) => ({
                title: m.title,
                description: m.description,
                deliverables: m.deliverables || []
            })),
            personas: personas.map(p => ({
                name: p.name,
                role: p.role,
                personality: p.personality || "Neutral",
                system_prompt: p.systemPrompt || "",
                initial_message: p.initialMessage || "Hello, I'm your client for this project."
            })),
            team: [],
            resources: (simulation.resources || []).map((r: any) => ({
                title: r.title,
                url: r.url,
                type: r.type || "documentation",
                description: r.description || ""
            })),
            quiz: (simulation.quiz || []).map((q: any) => ({
                question: q.question,
                options: q.options || [],
                correct_option_index: q.correct_option_index ?? 0,
                explanation: q.explanation || ""
            }))
        }

        return <SimulationView data={viewData} />
    } catch (err) {
        console.error(err)
        notFound()
    }
}
