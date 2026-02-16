"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: (url: string, branch: string, token: string) => Promise<void>;
}

export default function ConnectionModal({ isOpen, onClose, onConnect }: ConnectionModalProps) {
    const [url, setUrl] = useState("");
    const [token, setToken] = useState("");
    const [branch, setBranch] = useState("main");
    const [branches, setBranches] = useState<string[]>([]);
    const [loadingBranches, setLoadingBranches] = useState(false);
    const [connecting, setConnecting] = useState(false);

    // Debounced branch fetching
    useEffect(() => {
        const fetchBranches = async () => {
            if (!url || typeof url !== 'string' || !url.includes("github.com")) return;
            setLoadingBranches(true);
            try {
                const res = await fetch("http://127.0.0.1:8000/api/repo/branches", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ github_url: url, access_token: token }),
                });
                const data = await res.json();
                if (data.branches && Array.isArray(data.branches)) {
                    setBranches(data.branches);
                    if (data.branches.includes("main")) setBranch("main");
                    else if (data.branches.includes("master")) setBranch("master");
                    else if (data.branches.length > 0) setBranch(data.branches[0]);
                }
            } catch (e) {
                console.error("Failed to fetch branches", e);
            } finally {
                setLoadingBranches(false);
            }
        };

        const timer = setTimeout(fetchBranches, 1000);
        return () => clearTimeout(timer);
    }, [url, token]);

    const handleConnect = async () => {
        if (!url) return;
        setConnecting(true);
        try {
            await onConnect(url, branch, token);
            onClose();
        } catch (e) {
            // Error handled in parent
        } finally {
            setConnecting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#252526] border-[#333] text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Connect to GitHub Repository</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="url">Repository URL</Label>
                        <Input
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://github.com/username/repo"
                            className="bg-[#3c3c3c] border-none text-white"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="token">Access Token (Optional)</Label>
                        <Input
                            id="token"
                            type="password"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="github_pat_..."
                            className="bg-[#3c3c3c] border-none text-white"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="branch">Branch</Label>
                        <div className="relative">
                            {/* Fallback to Input if select is acting up or empty, but Select is better */}
                            <Select value={branch} onValueChange={setBranch} disabled={branches.length === 0}>
                                <SelectTrigger className="bg-[#3c3c3c] border-none text-white w-full">
                                    <SelectValue placeholder={loadingBranches ? "Loading branches..." : "Select branch"} />
                                </SelectTrigger>
                                <SelectContent className="bg-[#252526] border-[#333] text-white">
                                    {branches.map((b) => (
                                        <SelectItem key={b} value={b} className="hover:bg-[#3c3c3c] cursor-pointer focus:bg-[#3c3c3c]">
                                            {b}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {loadingBranches && <Loader2 className="absolute right-8 top-2.5 w-4 h-4 animate-spin text-gray-400" />}
                        </div>
                        {branches.length === 0 && url.length > 10 && !loadingBranches && (
                            <div className="text-xs text-yellow-500">
                                Could not load branches. Type manually:
                                <Input
                                    value={branch}
                                    onChange={(e) => setBranch(e.target.value)}
                                    className="mt-1 bg-[#3c3c3c] border-none text-white h-7"
                                    placeholder="main"
                                />
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleConnect} disabled={connecting} className="bg-blue-600 hover:bg-blue-700">
                        {connecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Connect & Extract
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
