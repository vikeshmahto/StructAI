import { create } from "zustand";
import type { ProjectStructure, FileSystemNode } from "@/types/project";

export type GenerationStep =
  | "idle"
  | "thinking"
  | "generating"
  | "processing"
  | "done";

interface GeneratorStore {
  // Input
  prompt: string;
  selectedStack: string[];

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
  generate: () => Promise<void>;
  selectFile: (f: FileSystemNode | null, path?: string) => void;
  downloadZip: () => Promise<void>;
  reset: () => void;
}

export const useGeneratorStore = create<GeneratorStore>((set, get) => ({
  prompt: "",
  selectedStack: [],
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

  generate: async () => {
    const { prompt, selectedStack } = get();

    if (!prompt || prompt.length < 10) {
      set({ error: "Please describe your project in more detail (at least 10 characters)." });
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
          prompt,
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
