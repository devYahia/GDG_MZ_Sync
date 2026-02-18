import { InterviewClient } from "@/components/dashboard/interviewer/InterviewClient"

export const metadata = {
    title: "AI Interview Practice | GDG Sync",
    description: "Master your interview skills with our AI-powered simulator.",
}

export default function InterviewPage() {
    return (
        <div className="h-full w-full">
            <InterviewClient />
        </div>
    )
}
