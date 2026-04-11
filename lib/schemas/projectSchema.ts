import { z } from "zod";

const envVariableSchema = z.object({
  key: z.string().min(1),
  description: z.string().min(1),
  example: z.string(),
  required: z.boolean(),
  sensitive: z.boolean().default(false),

});

const fileSystemNodeSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    name: z.string().min(1),
    type: z.enum(["folder", "file"]),
    content: z.string().optional(),
    language: z.string().optional(),
    children: z.array(fileSystemNodeSchema).optional(),
  })
);

export const projectStructureSchema = z.object({
  project_name: z.string().min(1),
  description: z.string().min(5),
  stack: z.array(z.string()).min(1),
  package_manager: z.enum(["npm", "pnpm", "yarn", "bun"]),
  setup_commands: z.array(z.string()),
  env_variables: z.array(envVariableSchema),
  folders: z.array(fileSystemNodeSchema),
  scripts: z.record(z.string(), z.string()),
  readme: z.string().min(10),
});
