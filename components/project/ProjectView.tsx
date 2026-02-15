"use client"

import { useState, useMemo } from "react"
import type { SimulationTask } from "@/lib/tasks"
import { ProjectSidebar, type SidebarItem } from "./ProjectSidebar"
import { ProjectDescription } from "./ProjectDescription"
import { ProjectChat } from "./ProjectChat"
import { IDEPlaceholder } from "./IDEPlaceholder"

interface ProjectViewProps {
  task: SimulationTask
}

export function ProjectView({ task }: ProjectViewProps) {
  const [activeId, setActiveId] = useState("description")

  // Build sidebar items: Description + Personas from task
  const sidebarItems: SidebarItem[] = useMemo(() => {
    const items: SidebarItem[] = [
      {
        id: "description",
        label: "Project Description",
        type: "description",
      },
    ]

    // Add a persona entry for the client persona from the task
    if (task.clientPersona) {
      items.push({
        id: "persona-client",
        label: `Chat with ${task.clientPersona}`,
        type: "persona",
      })
    }

    return items
  }, [task])

  return (
    <div className="flex flex-1 min-h-0">
      {/* Left: Sidebar Navigation (~18%) */}
      <div className="flex w-[240px] shrink-0 min-w-0 flex-col">
        <ProjectSidebar
          items={sidebarItems}
          activeId={activeId}
          onSelect={setActiveId}
        />
      </div>

      {/* Middle: Content Area (~42%) */}
      <div className="flex flex-1 min-w-0 flex-col border-r border-white/10">
        {activeId === "description" ? (
          <ProjectDescription
            title={task.title}
            overview={task.description}
          />
        ) : (
          <ProjectChat task={task} />
        )}
      </div>

      {/* Right: IDE Placeholder (~40%) */}
      <div className="flex w-[40%] min-w-0 flex-col">
        <IDEPlaceholder />
      </div>
    </div>
  )
}
