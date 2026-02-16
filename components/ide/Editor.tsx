"use client";

import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect } from "react";

interface EditorProps {
    fileContent: string;
    fileName: string;
    language: string;
    onChange?: (value: string | undefined) => void;
}

export default function CodeEditor({ fileContent, fileName, language, onChange }: EditorProps) {
    const monaco = useMonaco();

    useEffect(() => {
        if (monaco) {
            // Configure theme or other settings here
            monaco.editor.defineTheme("my-dark", {
                base: "vs-dark",
                inherit: true,
                rules: [],
                colors: {
                    "editor.background": "#1e1e1e",
                },
            });
            monaco.editor.setTheme("my-dark");
        }
    }, [monaco]);

    // Determine language based on extension if simple mapping needed
    const getLanguage = (ext: string) => {
        switch (ext) {
            case "py": return "python";
            case "js": return "javascript";
            case "ts": return "typescript";
            case "tsx": return "typescript";
            case "css": return "css";
            case "html": return "html";
            case "json": return "json";
            case "md": return "markdown";
            default: return "plaintext";
        }
    };

    const lang = getLanguage(fileName.split('.').pop() || "");

    return (
        <div className="h-full w-full">
            <Editor
                height="100%"
                defaultLanguage="python"
                language={lang}
                value={fileContent}
                theme="vs-dark"
                onChange={onChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                }}
            />
        </div>
    );
}
