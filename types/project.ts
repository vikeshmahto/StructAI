export interface EnvVariable {
  key: string;
  description: string;
  example: string;
  required: boolean;
  sensitive: boolean;
}

export interface FileSystemNode {
  name: string;
  type: "folder" | "file";
  content?: string;
  language?: string;
  children?: FileSystemNode[];
}

export interface ProjectStructure {
  project_name: string;
  description: string;
  stack: string[];
  package_manager: "npm" | "pnpm" | "yarn" | "bun";
  setup_commands: string[];
  env_variables: EnvVariable[];
  folders: FileSystemNode[];
  scripts: Record<string, string>;
  readme: string;
}

export interface GenerateRequest {
  prompt: string;
  stack?: string[];
  preferences?: Record<string, unknown>;
}

export interface GenerateResponse {
  project: ProjectStructure;
}

export interface GenerateErrorResponse {
  error: string;
  details?: unknown;
}
