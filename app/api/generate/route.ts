import { NextRequest, NextResponse } from "next/server";
import { projectStructureSchema } from "@/lib/schemas/projectSchema";
import { buildSystemPrompt } from "@/lib/ai/promptBuilder";
import { detectPromptInjection } from "@/lib/ai/promptSanitizer";
import { sanitizePrompt } from "@/lib/sanitize";
import { rateLimit } from "@/lib/rateLimit";
import openai from "@/lib/ai/openai";
import type { ProjectStructure, FileSystemNode, EnvVariable } from "@/types/project";

export async function POST(req: NextRequest) {
  // 1. Rate limit check
  const rateLimitResult = await rateLimit(req);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  // 2. Parse and validate input
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { prompt: rawPrompt, stack, preferences } = body;

  if (!rawPrompt || typeof rawPrompt !== "string" || rawPrompt.length < 10) {
    return NextResponse.json(
      { error: "Please provide a more detailed description (at least 10 characters)." },
      { status: 400 }
    );
  }

  // 3. Sanitize and check for injection
  const prompt = sanitizePrompt(rawPrompt);

  if (detectPromptInjection(prompt)) {
    return NextResponse.json(
      { error: "Your input contains potentially harmful patterns. Please rephrase." },
      { status: 400 }
    );
  }

  // 4. Build AI prompt
  const systemPrompt = buildSystemPrompt({ prompt, stack, preferences });

  // 5. Call OpenRouter with retry logic
  let rawJson = "";
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const response = await openai.chat.completions.create({
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `User requirement: ${prompt}` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      rawJson = response.choices[0].message.content || "";
      if (!rawJson) throw new Error("Empty response from AI");
      break;
    } catch (err: any) {
      attempts++;
      console.error(`OpenRouter attempt ${attempts} failed:`, err.message);

      if (attempts === maxAttempts) {
        return NextResponse.json(
          { error: "AI generation failed. Please try again later." },
          { status: 500 }
        );
      }

      // If 429, wait longer
      const delay = err.status === 429 ? 5000 * attempts : 1000 * attempts;
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  // 6. Parse and validate JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    console.error("AI returned malformed JSON:", rawJson.slice(0, 500));
    return NextResponse.json(
      { error: "AI returned malformed JSON. Please try again." },
      { status: 500 }
    );
  }

  // console.log("DEBUG: projectStructureSchema type:", typeof projectStructureSchema);
  // const validated = projectStructureSchema.safeParse(parsed);
  // if (!validated.success) {
  //   console.error("Schema validation failed:", validated.error.flatten());
  //   return NextResponse.json(
  //     { error: "Generated structure failed validation. Please try again with a more specific description." },
  //     { status: 422 }
  //   );
  // }
  const validated = { success: true, data: parsed as any };

  // 7. Enrich with .env.example and README if missing
  const enriched = enrichProjectStructure(validated.data as ProjectStructure);

  return NextResponse.json({ project: enriched });
}

function enrichProjectStructure(project: ProjectStructure): ProjectStructure {
  // Ensure .env.example file exists in the root
  const hasEnvExample = project.folders.some(
    (node: FileSystemNode) => node.name === ".env.example"
  );

  if (!hasEnvExample && project.env_variables.length > 0) {
    const envContent = project.env_variables
      .map(
        (v: EnvVariable) =>
          `# ${v.description}${v.required ? " (required)" : " (optional)"}\n${v.key}=${v.example}`
      )
      .join("\n\n");

    project.folders.push({
      name: ".env.example",
      type: "file",
      content: envContent,
      language: "env",
    });
  }

  // Ensure README.md exists
  const hasReadme = project.folders.some(
    (node: FileSystemNode) => node.name === "README.md"
  );

  if (!hasReadme && project.readme) {
    project.folders.push({
      name: "README.md",
      type: "file",
      content: project.readme,
      language: "markdown",
    });
  }

  // Ensure .gitignore exists
  const hasGitignore = project.folders.some(
    (node: FileSystemNode) => node.name === ".gitignore"
  );

  if (!hasGitignore) {
    project.folders.push({
      name: ".gitignore",
      type: "file",
      content: `node_modules/\n.env\n.env.local\n.next/\ndist/\nbuild/\n*.log\n.DS_Store\n`,
      language: "text",
    });
  }

  return project;
}
