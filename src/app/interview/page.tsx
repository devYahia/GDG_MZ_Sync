import { InterviewClient } from "@/components/dashboard/interviewer/InterviewClient"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "AI Interview Practice | Interna",
    description: "Experience premium, unscripted AI interviews.",
}

export default function InterviewPage() {
    return (
        <main className="flex-1 w-full bg-background min-h-screen">
            <InterviewClient />
        </main>
    )
}
