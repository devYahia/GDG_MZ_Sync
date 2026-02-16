"use client";

import { useMemo, useState } from "react";
import { Folder, FileCode, ChevronRight, ChevronDown, Trash2, FilePlus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type FileMap = { [path: string]: string };

interface FileNode {
    name: string;
    path: string;
    type: "file" | "folder";
    children?: FileNode[];
}

interface FileExplorerProps {
    files: FileMap;
    onSelect: (path: string) => void;
    selectedFile: string | null;
    onCreateFile: (path: string) => void;
    onDeleteFile: (path: string) => void;
}

const buildTree = (files: FileMap): FileNode[] => {
    const root: FileNode[] = [];
    const map: { [key: string]: FileNode } = {};

    Object.keys(files).sort().forEach((path) => {
        const parts = path.split("/");
        let currentLevel = root;
        let currentPath = "";

        parts.forEach((part, index) => {
            currentPath = currentPath ? `${currentPath}/${part}` : part;

            // Check if node exists at this level
            let node = currentLevel.find((n) => n.name === part);

            if (!node) {
                const isFile = index === parts.length - 1;
                node = {
                    name: part,
                    path: currentPath,
                    type: isFile ? "file" : "folder",
                    children: isFile ? undefined : [],
                };
                currentLevel.push(node);
            }

            if (node.type === "folder") {
                currentLevel = node.children!;
            }
        });
    });

    return root;
};

const FileItem = ({
    node,
    level,
    onSelect,
    selectedFile,
    onDelete
}: {
    node: FileNode,
    level: number,
    onSelect: (path: string) => void,
    selectedFile: string | null,
    onDelete: (path: string) => void
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const isSelected = selectedFile === node.path;

    const handleClick = () => {
        if (node.type === "folder") {
            setIsOpen(!isOpen);
        } else {
            onSelect(node.path);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Delete ${node.name}?`)) {
            onDelete(node.path);
        }
    };

    return (
        <div>
            <div
                className={`group flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-[#37373d] ${isSelected ? "bg-[#37373d] text-blue-300" : "text-gray-300"}`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={handleClick}
            >
                {node.type === "folder" ? (
                    <>
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        <Folder className="w-4 h-4 text-yellow-500" />
                    </>
                ) : (
                    <FileCode className="w-4 h-4 text-blue-400 ml-4" />
                )}
                <span className="text-sm truncate flex-1">{node.name}</span>
                {node.type === "file" && (
                    <button
                        onClick={handleDelete}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 p-1 transition-opacity"
                        title="Delete file"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                )}
            </div>

            {isOpen && node.children && (
                <div>
                    {node.children.map((child) => (
                        <FileItem
                            key={child.path}
                            node={child}
                            level={level + 1}
                            onSelect={onSelect}
                            selectedFile={selectedFile}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function FileExplorer({ files, onSelect, selectedFile, onCreateFile, onDeleteFile }: FileExplorerProps) {
    const tree = useMemo(() => buildTree(files), [files]);
    const [isCreating, setIsCreating] = useState(false);
    const [newFileName, setNewFileName] = useState("");

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFileName.trim()) {
            onCreateFile(newFileName.trim());
            setNewFileName("");
            setIsCreating(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-2 border-b border-[#333] flex justify-between items-center bg-[#252526]">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Explorer</span>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="text-gray-400 hover:text-white p-1 hover:bg-[#3c3c3c] rounded"
                    title="New File"
                >
                    <FilePlus className="w-4 h-4" />
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreateSubmit} className="p-2 bg-[#2d2d2d] flex flex-col gap-2 border-b border-[#333]">
                    <Input
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="path/to/file.ext"
                        className="h-7 text-xs bg-[#3c3c3c] border-none text-white focus-visible:ring-1 focus-visible:ring-blue-500"
                        autoFocus
                    />
                    <div className="flex justify-end gap-1">
                        <Button type="button" size="sm" variant="ghost" className="h-6 text-xs hover:bg-[#3c3c3c] hover:text-white" onClick={() => setIsCreating(false)}>Cancel</Button>
                        <Button type="submit" size="sm" className="h-6 text-xs bg-blue-600 hover:bg-blue-700">Create</Button>
                    </div>
                </form>
            )}

            <div className="flex-1 overflow-y-auto">
                {tree.map((node) => (
                    <FileItem
                        key={node.path}
                        node={node}
                        level={0}
                        onSelect={onSelect}
                        selectedFile={selectedFile}
                        onDelete={onDeleteFile}
                    />
                ))}
                {Object.keys(files).length === 0 && !isCreating && (
                    <div className="p-4 text-gray-500 text-sm text-center">
                        No files. <br /> Connect a repo or create a file.
                    </div>
                )}
            </div>
        </div>
    );
}
