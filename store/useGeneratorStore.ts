import { create } from "zustand";
import type { ProjectStructure, FileSystemNode } from "@/types/project";

export type GenerationStep =
  | "idle"
  | "thinking"
  | "generating"
  | "processing"
  | "done";

export type DocumentStatus = "idle" | "parsing" | "success" | "error";

interface GeneratorStore {
  // Input
  prompt: string;
  selectedStack: string[];

  // Document upload
  documentFile: File | null;
  documentText: string;
  documentStatus: DocumentStatus;
  documentError: string | null;
  documentWordCount: number;

  // Output
  project: ProjectStructure | null;
  isLoading: boolean;
  error: string | null;
  generationStep: GenerationStep;

  // Selected file for preview
  selectedFile: FileSystemNode | null;
  selectedFilePath: string;

  // Actions
  setPrompt: (p: string) => void;
  toggleStack: (s: string) => void;
  setDocumentFile: (file: File) => void;
  removeDocument: () => void;
  generate: () => Promise<void>;
  selectFile: (f: FileSystemNode | null, path?: string) => void;
  downloadZip: () => Promise<void>;
  reset: () => void;
}

export const useGeneratorStore = create<GeneratorStore>((set, get) => ({
  prompt: "",
  selectedStack: [],
  documentFile: null,
  documentText: "",
  documentStatus: "idle",
  documentError: null,
  documentWordCount: 0,
  project: null,
  isLoading: false,
  error: null,
  generationStep: "idle",
  selectedFile: null,
  selectedFilePath: "",

  setPrompt: (prompt) => set({ prompt }),

  toggleStack: (stack) =>
    set((state) => ({
      selectedStack: state.selectedStack.includes(stack)
        ? state.selectedStack.filter((s) => s !== stack)
        : [...state.selectedStack, stack],
    })),

  setDocumentFile: async (file: File) => {
    set({
      documentFile: file,
      documentStatus: "parsing",
      documentError: null,
      documentText: "",
      documentWordCount: 0,
    });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-document", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        set({
          documentStatus: "error",
          documentError: data.message || "Failed to parse document.",
        });
        return;
      }

      set({
        documentText: data.extractedText,
        documentWordCount: data.wordCount,
        documentStatus: "success",
      });
    } catch (err) {
      set({
        documentStatus: "error",
        documentError:
          err instanceof Error ? err.message : "Failed to upload document.",
      });
    }
  },

  removeDocument: () =>
    set({
      documentFile: null,
      documentText: "",
      documentStatus: "idle",
      documentError: null,
      documentWordCount: 0,
    }),

  generate: async () => {
    const { prompt, selectedStack, documentText } = get();

    // At least one of prompt or document must be provided
    const hasPrompt = prompt && prompt.length >= 10;
    const hasDocument = documentText && documentText.length > 0;

    if (!hasPrompt && !hasDocument) {
      set({
        error:
          "Please describe your project (at least 10 characters) or upload a requirements document.",
      });
      return;
    }

    set({
      isLoading: true,
      error: null,
      generationStep: "thinking",
      project: null,
      selectedFile: null,
      selectedFilePath: "",
    });

    try {
      set({ generationStep: "generating" });

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt || undefined,
          documentText: hasDocument ? documentText : undefined,
          stack: selectedStack.length > 0 ? selectedStack : undefined,
        }),
      });

      set({ generationStep: "processing" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Generation failed");

      set({ project: data.project, generationStep: "done" });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : String(err),
        generationStep: "idle",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  selectFile: (selectedFile, path = "") =>
    set({ selectedFile, selectedFilePath: path }),

  downloadZip: async () => {
    const { project } = get();
    if (!project) return;

    try {
      const res = await fetch("/api/zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project }),
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.project_name}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Download failed",
      });
    }
  },

  reset: () =>
    set({
      project: null,
      error: null,
      generationStep: "idle",
      selectedFile: null,
      selectedFilePath: "",
    }),
}));
