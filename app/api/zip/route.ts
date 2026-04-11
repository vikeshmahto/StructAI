import { NextRequest, NextResponse } from "next/server";
import archiver from "archiver";
import { PassThrough } from "stream";
import type { ProjectStructure, FileSystemNode, EnvVariable } from "@/types/project";

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { project } = body as { project: ProjectStructure };

  if (!project || !project.project_name || !project.folders) {
    return NextResponse.json(
      { error: "Invalid project data." },
      { status: 400 }
    );
  }

  const passThrough = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.pipe(passThrough);

  // Recursively add files to archive
  function addToArchive(
    nodes: FileSystemNode[],
    basePath: string = project.project_name
  ) {
    for (const node of nodes) {
      const nodePath = `${basePath}/${node.name}`;
      if (node.type === "folder" && node.children) {
        addToArchive(node.children, nodePath);
      } else if (node.type === "file" && node.content !== undefined) {
        archive.append(node.content, { name: nodePath });
      }
    }
  }

  // Add .env.example
  if (project.env_variables && project.env_variables.length > 0) {
    const envExample = project.env_variables
      .map(
        (v: EnvVariable) =>
          `# ${v.description}\n${v.key}=${v.example}`
      )
      .join("\n\n");
    archive.append(envExample, {
      name: `${project.project_name}/.env.example`,
    });
  }

  // Add README.md
  if (project.readme) {
    archive.append(project.readme, {
      name: `${project.project_name}/README.md`,
    });
  }

  // Add package.json
  const packageJson = {
    name: project.project_name,
    version: "0.1.0",
    private: true,
    scripts: project.scripts || {},
  };
  archive.append(JSON.stringify(packageJson, null, 2), {
    name: `${project.project_name}/package.json`,
  });

  // Add all project files
  addToArchive(project.folders);

  archive.finalize();

  const chunks: Buffer[] = [];
  for await (const chunk of passThrough) {
    chunks.push(chunk as Buffer);
  }

  const buffer = Buffer.concat(chunks);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${project.project_name}.zip"`,
      "Content-Length": String(buffer.length),
    },
  });
}
