"use client";

import { useEffect, useRef, useState } from "react";

export default function Terminal() {
    const [lines, setLines] = useState<string[]>([
        "Welcome to Daytona IDE",
        "Ready to execute commands..."
    ]);
    const endRef = useRef<HTMLDivElement>(null);

    // Expose a way to add lines (in a real app this would be via context or props)
    // For now, we'll listen to a custom event or just use props if we refactor page.tsx
    // Let's stick to props in a real implementation, but for this quick file creation, 
    // I'll make it static for now and update page.tsx to pass props later if needed.
    // Actually, let's make it receive props. I'll need to update page.tsx too.

    // Wait, I already wrote page.tsx and it renders <Terminal /> without props.
    // I'll make this component self-contained for now, or use a window event for simplicity 
    // without rewriting page.tsx immediately.

    useEffect(() => {
        const handleLog = (e: CustomEvent) => {
            setLines(prev => [...prev, `> ${e.detail}`]);
        };
        window.addEventListener("terminal-log", handleLog as EventListener);
        return () => window.removeEventListener("terminal-log", handleLog as EventListener);
    }, []);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [lines]);

    return (
        <div className="h-full w-full bg-black text-green-400 font-mono text-sm p-2 overflow-y-auto">
            {lines.map((line, i) => (
                <div key={i}>{line}</div>
            ))}
            <div ref={endRef} />
        </div>
    );
}
