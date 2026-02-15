"use client"

import { useState } from "react"
import { FileCode, FolderOpen, Folder, ChevronRight, ChevronDown, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface IDEFileTreeProps {
  files: Record<string, string>
  activeFileId: string
  onSelectFile: (path: string) => void
  onAddFile: () => void
  onRemoveFile: (path: string) => void
}

function getPathParts(path: string) {
  return path.split("/").filter(Boolean)
}

function groupPathsByFolder(paths: string[]): { folders: Record<string, string[]>; rootFiles: string[] } {
  const folders: Record<string, string[]> = {}
  const rootFiles: string[] = []
  for (const p of paths) {
    const parts = getPathParts(p)
    if (parts.length === 1) rootFiles.push(p)
    else {
      const folder = parts[0]
      if (!folders[folder]) folders[folder] = []
      folders[folder].push(parts.slice(1).join("/"))
    }
  }
  return { folders, rootFiles }
}

export function IDEFileTree({
  files,
  activeFileId,
  onSelectFile,
  onAddFile,
  onRemoveFile,
}: IDEFileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ src: true })
  const paths = Object.keys(files).sort()
  const { folders, rootFiles } = groupPathsByFolder(paths)

  const toggleFolder = (folder: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folder]: !prev[folder] }))
  }

  return (
    <div className="flex h-full flex-col bg-[#252526] text-[#cccccc] text-sm">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-2 py-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Explorer</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-white/50 hover:text-white"
          onClick={onAddFile}
          title="New file"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {rootFiles.map((path) => (
          <FileRow
            key={path}
            path={path}
            name={path}
            isActive={activeFileId === path}
            onSelect={() => onSelectFile(path)}
            onRemove={() => onRemoveFile(path)}
            canRemove={paths.length > 1}
          />
        ))}
        {Object.entries(folders).map(([folder, subPaths]) => {
          const isExpanded = expandedFolders[folder] !== false
          return (
            <div key={folder}>
              <button
                type="button"
                className="flex w-full items-center gap-1 py-0.5 px-2 hover:bg-white/5 text-left"
                onClick={() => toggleFolder(folder)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                )}
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4 shrink-0 text-amber-500/90" />
                ) : (
                  <Folder className="h-4 w-4 shrink-0 text-amber-500/90" />
                )}
                <span className="truncate">{folder}</span>
              </button>
              {isExpanded &&
                subPaths.map((sub) => {
                  const fullPath = `${folder}/${sub}`
                  return (
                    <div key={fullPath} className="pl-4">
                      <FileRow
                        path={fullPath}
                        name={sub}
                        isActive={activeFileId === fullPath}
                        onSelect={() => onSelectFile(fullPath)}
                        onRemove={() => onRemoveFile(fullPath)}
                        canRemove={paths.length > 1}
                      />
                    </div>
                  )
                })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FileRow({
  path,
  name,
  isActive,
  onSelect,
  onRemove,
  canRemove,
}: {
  path: string
  name: string
  isActive: boolean
  onSelect: () => void
  onRemove: () => void
  canRemove: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <div
      className={cn(
        "group flex items-center gap-1.5 py-0.5 px-2 cursor-pointer",
        isActive && "bg-white/10 text-white"
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onSelect}
    >
      <FileCode className="h-4 w-4 shrink-0 text-blue-400/90" />
      <span className="truncate flex-1">{name}</span>
      {canRemove && (hover || isActive) && (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0 opacity-70 hover:opacity-100 hover:text-red-400"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          title="Delete file"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
