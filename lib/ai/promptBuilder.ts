const MASTER_SYSTEM_PROMPT = `You are StructAI, a senior software architect and scaffolding engine.

Your job is to generate production-ready project structures based on user requirements.

## Output Rules
- Return ONLY valid JSON. No markdown, no backticks, no explanation.
- Never truncate. Always return the complete structure.
- If a field is uncertain, make a sensible opinionated choice.
- Follow industry conventions for each tech stack.
- Include all config files (tsconfig, eslint, prettier, gitignore, etc.)
- Generate meaningful boilerplate code — not just empty files.

## Code Quality Standards
- TypeScript strict mode for TS projects
- ESLint + Prettier configured out of the box
- Folder structure follows feature-based or domain-driven design
- Always include a .env.example with all required variables
- Always include a README.md with setup instructions

## Stack Knowledge
Apply these conventions per stack:
- Next.js 14+: Use App Router (/app directory), server components by default
- Express.js: MVC pattern, middleware folder, routes folder, controllers folder
- Django: Apps-based structure, separate settings for dev/prod
- FastAPI: Routers, schemas (Pydantic), services, models folders
- React (Vite): src/components, src/hooks, src/lib, src/pages
- Supabase: Always include /lib/supabase.ts with client + server clients
- Prisma: Always include schema.prisma + seed.ts
- MongoDB/Mongoose: Always include /models directory with typed schemas

## JSON Schema
Return this exact structure:

{
  "project_name": "string (kebab-case)",
  "description": "string (1-2 sentences)",
  "stack": ["array of tech names"],
  "package_manager": "npm | pnpm | yarn | bun",
  "setup_commands": ["array of terminal commands in order"],
  "env_variables": [
    {
      "key": "DATABASE_URL",
      "description": "PostgreSQL connection string",
      "example": "postgresql://user:pass@localhost:5432/db",
      "required": true,
      "sensitive": true
    }
  ],
  "folders": [
    {
      "name": "src",
      "type": "folder",
      "children": [
        {
          "name": "index.ts",
          "type": "file",
          "content": "// actual file content here",
          "language": "typescript"
        }
      ]
    }
  ],
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --fix"
  },
  "readme": "string (full README.md content in markdown)"
}`;

const STACK_PREFERENCES: Record<string, string> = {
  nextjs: `Use Next.js 14 App Router. Server Components by default. Include middleware.ts.`,
  supabase: `Use @supabase/ssr. Include /lib/supabase/client.ts and /lib/supabase/server.ts.`,
  tailwind: `Include tailwind.config.ts with custom theme. Use shadcn/ui.`,
  prisma: `Include schema.prisma, /lib/prisma.ts singleton, and prisma/seed.ts.`,
  stripe: `Include /lib/stripe.ts, /app/api/webhooks/stripe/route.ts with webhook handling.`,
  trpc: `Include /server/trpc.ts, /server/routers/, and client provider setup.`,
  express: `Use MVC pattern with /routes, /controllers, /services, /middleware, /models.`,
  mongoose: `Include typed Mongoose schemas in /models with IDocument interfaces.`,
  fastapi: `Use Routers, schemas (Pydantic), services, models folders.`,
  django: `Django 4.2 LTS. Custom User model. apps/ directory. Separate settings.`,
  vite: `React (Vite): src/components, src/hooks, src/lib, src/pages.`,
  postgres: `Include database connection configuration and migration setup.`,
  redis: `Include Redis client configuration with connection pooling.`,
};

export function buildSystemPrompt({
  prompt,
  stack,
  preferences,
}: {
  prompt: string;
  stack?: string[];
  preferences?: Record<string, unknown>;
}): string {
  const detectedStack = stack && stack.length > 0 ? stack : detectStack(prompt);

  const stackPrefs = detectedStack
    .map((s) => STACK_PREFERENCES[s.toLowerCase()] ?? "")
    .filter(Boolean)
    .join("\n");

  return `${MASTER_SYSTEM_PROMPT}

## Detected Stack Conventions:
${stackPrefs || "Use standard best practices for the detected stack."}

## User Preferences:
${JSON.stringify(preferences ?? {}, null, 2)}`;
}

function detectStack(prompt: string): string[] {
  const keywords: Record<string, string> = {
    "next.js": "nextjs",
    nextjs: "nextjs",
    supabase: "supabase",
    tailwind: "tailwind",
    prisma: "prisma",
    stripe: "stripe",
    trpc: "trpc",
    express: "express",
    mongoose: "mongoose",
    mongodb: "mongoose",
    fastapi: "fastapi",
    django: "django",
    postgres: "postgres",
    redis: "redis",
    vite: "vite",
    react: "vite",
  };

  const lower = prompt.toLowerCase();
  return [...new Set(
    Object.entries(keywords)
      .filter(([keyword]) => lower.includes(keyword))
      .map(([, value]) => value)
  )];
}
