"use client";

import { Users, Terminal, MessageSquare, Mic, Briefcase, GitBranch } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

export function Features() {
    return (
        <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
            <GridItem
                area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
                icon={<Users className="h-4 w-4" />}
                title="Adaptive AI Personas"
                description="Master stakeholder management by interacting with diverse, AI-driven professional temperaments."
            />
            <GridItem
                area="md:[grid-area:1/7/2/13] xl:[grid-area:1/5/2/9]"
                icon={<Terminal className="h-4 w-4" />}
                title="Production Sandbox"
                description="Escape the 'Notebook Trap'. Deploy to live environments and handle real-world chaos events."
            />
            <GridItem
                area="md:[grid-area:2/1/3/7] xl:[grid-area:1/9/2/13]"
                icon={<MessageSquare className="h-4 w-4" />}
                title="Jargon Barrier Dismantled"
                description="Real-time analysis of your communication clarity and 'jargon-to-value' ratio."
            />
            <GridItem
                area="md:[grid-area:2/7/3/13] xl:[grid-area:2/1/3/5]"
                icon={<Mic className="h-4 w-4" />}
                title="Voice Intelligence"
                description="Practice explaining complex concepts to non-technical stakeholders via voice notes."
            />
            <GridItem
                area="md:[grid-area:3/1/4/7] xl:[grid-area:2/5/3/9]"
                icon={<Briefcase className="h-4 w-4" />}
                title="Market-Grounded Data"
                description="Projects modeled after scraped freelance contracts, not academic toys."
            />
            <GridItem
                area="md:[grid-area:3/7/4/13] xl:[grid-area:2/9/3/13]"
                icon={<GitBranch className="h-4 w-4" />}
                title="Git-Integrated Workflow"
                description="Success is measured by PR approvals and version control history, not just code output."
            />
        </ul>
    );
}

interface GridItemProps {
    area: string;
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
    return (
        <li className={cn("min-h-[14rem] list-none", area)}>
            <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-white/10 p-2 md:rounded-[1.5rem] md:p-3">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                />
                <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] border-white/5 bg-black/40 p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6 backdrop-blur-md">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                        <div className="w-fit rounded-lg border-[0.75px] border-white/10 bg-white/5 p-2 text-white">
                            {icon}
                        </div>
                        <div className="space-y-3">
                            <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-white">
                                {title}
                            </h3>
                            <h2 className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-white/50">
                                {description}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
};
