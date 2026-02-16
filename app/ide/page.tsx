"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
// We'll create these components next
import FileExplorer from "../../components/ide/FileExplorer";
import Editor from "../../components/ide/Editor";
import Terminal from "../../components/ide/Terminal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Play, FolderGit2, Github } from "lucide-react";
import ConnectionModal from "../../components/ide/ConnectionModal";

type FileMap = { [path: string]: string };

export default function IDEPage() {
    const searchParams = useSearchParams();
    const initialUrl = searchParams.get("url") || "";
    const initialSessionId = searchParams.get("session_id");

    const [repoUrl, setRepoUrl] = useState(initialUrl);
    const [token, setToken] = useState("");
    const [files, setFiles] = useState<FileMap>({});
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(initialSessionId);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Initial open if no files and no session
    useEffect(() => {
        if (initialSessionId) {
            setLoading(true);
            fetch(`http://127.0.0.1:8000/api/repo/session/${initialSessionId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.files) {
                        setFiles(data.files);
                        toast.success("Loaded session files");
                    }
                })
                .catch(err => toast.error("Failed to load session"))
                .finally(() => setLoading(false));
        } else if (Object.keys(files).length === 0) {
            setIsModalOpen(true);
        }
    }, [initialSessionId]);

    const handleConnect = async (url: string, branch: string, token: string) => {
        // Update state but don't depend on it for this call
        setRepoUrl(url);
        setToken(token);

        setLoading(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/api/repo/extract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ github_url: url, branch, access_token: token }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Failed to extract repo");

            setFiles(data.files);
            setSessionId(data.session_id);
            toast.success(`Extracted ${data.file_count} files`);

            // Auto-create workspace
            createWorkspace(url, branch);
        } catch (e: any) {
            toast.error(e.message);
            throw e; // Modal needs to know
        } finally {
            setLoading(false);
        }
    };

    // Kept for manual re-trigger if needed, but primary is modal now
    const handleExtract = async () => { };


    const createWorkspace = async (url: string = repoUrl, branch: string = "main") => {
        try {
            const res = await fetch("http://127.0.0.1:8000/api/repo/workspace", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ github_url: url, branch }),
            });
            const data = await res.json();
            if (data.id) setWorkspaceId(data.id);
        } catch (e) {
            console.error("Workspace creation failed", e);
        }
    }

    const handleRun = async () => {
        if (!workspaceId) {
            toast.error("Workspace not ready yet");
            // Try creating one
            await createWorkspace();
            return;
        }
        // For simplicity, just run a default command or ask user. 
        // Here we'll just run "ls -la" as a test or "python main.py" if it exists.
        const cmd = "ls -la"; // TODO: Make this dynamic

        try {
            const res = await fetch("http://127.0.0.1:8000/api/repo/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workspace_id: workspaceId, command: cmd }),
            });
            const data = await res.json();
            // Pass output to terminal component
            console.log("Execution output:", data.output);
            window.dispatchEvent(new CustomEvent("terminal-log", { detail: data.output || "No output" }));
            toast.success("Command executed");
        } catch (e) {
            toast.error("Execution failed");
            window.dispatchEvent(new CustomEvent("terminal-log", { detail: "Execution failed" }));
        }
    };

    const handleSave = async () => {
        if (!selectedFile || !sessionId) return;
        try {
            const res = await fetch("http://127.0.0.1:8000/api/repo/file/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionId,
                    rel_path: selectedFile,
                    content: files[selectedFile]
                }),
            });
            if (!res.ok) throw new Error("Save failed");
            toast.success("File saved");
        } catch (e) {
            toast.error("Failed to save file");
        }
    };

    const handleCreateFile = async (path: string) => {
        if (!sessionId) return;
        try {
            const res = await fetch("http://127.0.0.1:8000/api/repo/file/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: sessionId, rel_path: path, content: "" }),
            });
            if (!res.ok) throw new Error("Create failed");

            setFiles(prev => ({ ...prev, [path]: "" }));
            setSelectedFile(path);
            toast.success("File created");
        } catch (e) {
            toast.error("Failed to create file");
        }
    };

    const handleDeleteFile = async (path: string) => {
        if (!sessionId) return;
        try {
            const res = await fetch("http://127.0.0.1:8000/api/repo/file/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: sessionId, rel_path: path }),
            });
            if (!res.ok) throw new Error("Delete failed");

            setFiles(prev => {
                const next = { ...prev };
                delete next[path];
                return next;
            });
            if (selectedFile === path) setSelectedFile(null);
            toast.success("File deleted");
        } catch (e) {
            toast.error("Failed to delete file");
        }
    };

    return (
        <div className="h-screen flex flex-col bg-[#1e1e1e] text-white overflow-hidden">
            {/* Header */}
            <div className="h-14 border-b border-[#333] flex items-center px-4 justify-between bg-[#252526]">
                <div className="flex items-center gap-2">
                    <FolderGit2 className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-sm">Repo Extractor IDE</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        size="sm"
                        className="bg-gray-700 hover:bg-gray-600 border border-gray-600"
                    >
                        <Github className="w-4 h-4 mr-2" />
                        GitHub Connection
                    </Button>
                    <span className="text-xs text-gray-400 ml-2">
                        {repoUrl ? repoUrl : "No repo connected"}
                    </span>
                    <ConnectionModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onConnect={handleConnect}
                    />
                </div>
                <div>
                    <Button
                        onClick={handleRun}
                        disabled={!workspaceId}
                        size="sm"
                        variant="ghost"
                        className="text-green-400 hover:text-green-300 hover:bg-[#333]"
                    >
                        <Play className="w-4 h-4 mr-1" /> Run
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar / File Explorer */}
                <div className="w-64 border-r border-[#333] bg-[#252526] flex flex-col">

                    <FileExplorer
                        files={files}
                        onSelect={setSelectedFile}
                        selectedFile={selectedFile}
                        onCreateFile={handleCreateFile}
                        onDeleteFile={handleDeleteFile}
                    />
                </div>

                {/* Editor Area */}
                <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                    {/* Tabs (implied by selected file) */}
                    {selectedFile && (
                        <div className="h-9 bg-[#2d2d2d] flex items-center px-4 text-sm border-b border-[#1e1e1e] justify-between">
                            <span>{selectedFile}</span>
                            <Button onClick={handleSave} size="sm" className="h-6 text-xs bg-[#0e639c] hover:bg-[#1177bb]">Save</Button>
                        </div>
                    )}

                    <div className="flex-1 relative">
                        <Editor
                            fileContent={selectedFile ? files[selectedFile] : "// Select a file to view"}
                            fileName={selectedFile || "untitled"}
                            language={selectedFile?.split('.').pop() || "txt"}
                            onChange={(val: string | undefined) => {
                                if (selectedFile && val !== undefined) {
                                    setFiles(prev => ({ ...prev, [selectedFile]: val }));
                                }
                            }}
                        />
                    </div>

                    {/* Terminal Area (Bottom) */}
                    <div className="h-48 border-t border-[#333] bg-[#1e1e1e]">
                        <Terminal />
                    </div>
                </div>
            </div>
        </div>
    );
}
