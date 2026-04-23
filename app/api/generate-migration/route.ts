import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/ai/openai";
import type { ProjectStructure, MigrationResult } from "@/types/project";

// ─── DB Detection ──────────────────────────────────────────────────────────────

interface DbProfile {
  dbType: string;
  orm: string | null;
  fileExtension: string;
  fileNamePrefix: string;
}

function detectDatabase(project: ProjectStructure): DbProfile {
  const stackLower = project.stack.map((s) => s.toLowerCase()).join(" ");
  const envKeys = project.env_variables.map((e) => e.key.toLowerCase()).join(" ");
  const combined = `${stackLower} ${envKeys}`;

  if (combined.includes("prisma")) {
    return {
      dbType: "PostgreSQL",
      orm: "Prisma",
      fileExtension: "sql",
      fileNamePrefix: "migration",
    };
  }
  if (combined.includes("django")) {
    return {
      dbType: "PostgreSQL/SQLite",
      orm: "Django ORM",
      fileExtension: "py",
      fileNamePrefix: "0001_initial",
    };
  }
  if (combined.includes("typeorm") || combined.includes("type-orm")) {
    return {
      dbType: "PostgreSQL",
      orm: "TypeORM",
      fileExtension: "ts",
      fileNamePrefix: `${Date.now()}-InitialMigration`,
    };
  }
  if (combined.includes("sequelize")) {
    return {
      dbType: "PostgreSQL/MySQL",
      orm: "Sequelize",
      fileExtension: "js",
      fileNamePrefix: `${Date.now()}-create-tables`,
    };
  }
  if (combined.includes("drizzle")) {
    return {
      dbType: "PostgreSQL",
      orm: "Drizzle ORM",
      fileExtension: "sql",
      fileNamePrefix: "drizzle_migration",
    };
  }
  if (combined.includes("supabase") || envKeys.includes("supabase")) {
    return {
      dbType: "PostgreSQL (Supabase)",
      orm: null,
      fileExtension: "sql",
      fileNamePrefix: "supabase_migration",
    };
  }
  if (
    combined.includes("mongodb") ||
    combined.includes("mongoose") ||
    envKeys.includes("mongodb_uri") ||
    envKeys.includes("mongo_uri")
  ) {
    return {
      dbType: "MongoDB",
      orm: "Mongoose",
      fileExtension: "js",
      fileNamePrefix: "seed-schema",
    };
  }
  if (combined.includes("mysql") || envKeys.includes("mysql")) {
    return { dbType: "MySQL", orm: null, fileExtension: "sql", fileNamePrefix: "migration" };
  }
  if (combined.includes("sqlite")) {
    return { dbType: "SQLite", orm: null, fileExtension: "sql", fileNamePrefix: "migration" };
  }

  // Default: raw PostgreSQL
  return { dbType: "PostgreSQL", orm: null, fileExtension: "sql", fileNamePrefix: "migration" };
}

// ─── Prompt Builder ────────────────────────────────────────────────────────────

function buildMigrationPrompt(project: ProjectStructure, db: DbProfile): string {
  const envVarList = project.env_variables.map((e) => `- ${e.key}: ${e.description}`).join("\n");

  const stackList = project.stack.join(", ");

  const folderSummary = project.folders
    .map((f) => f.name)
    .slice(0, 20)
    .join(", ");

  let ormInstructions = "";
  if (db.orm === "Prisma") {
    ormInstructions = `
Generate a complete Prisma migration SQL file. Infer all models (tables) from the project description,
features, and folder structure. Include:
- CREATE TABLE statements for every entity
- Primary keys, foreign keys, indexes
- NOT NULL constraints where appropriate
- This is a raw SQL migration file that Prisma would run (not schema.prisma itself)
`;
  } else if (db.orm === "Django ORM") {
    ormInstructions = `
Generate a complete Django migration file (Python) in the format of a standard Django initial migration.
- Class name: Migration
- dependencies = []
- operations = [ migrations.CreateModel(...) for each model ]
- Infer all models from the project description and features
- Include all fields, relationships (ForeignKey, ManyToMany), and Meta classes
`;
  } else if (db.orm === "TypeORM") {
    ormInstructions = `
Generate a complete TypeORM migration file in TypeScript.
- Export default class implementing MigrationInterface
- Implement async up(queryRunner: QueryRunner): Promise<void> with full CREATE TABLE SQL
- Implement async down(queryRunner: QueryRunner): Promise<void> with DROP TABLE statements
- Infer all entities from the project description
`;
  } else if (db.orm === "Sequelize") {
    ormInstructions = `
Generate a complete Sequelize migration file in JavaScript (CommonJS).
- module.exports = { async up(queryInterface, Sequelize) {...}, async down(queryInterface) {...} }
- Use queryInterface.createTable for each model inferred from the project
- Include all fields, data types, and associations
`;
  } else if (db.orm === "Drizzle ORM") {
    ormInstructions = `
Generate a complete Drizzle ORM SQL migration file.
- Pure SQL CREATE TABLE statements
- Infer all tables from the project description
- Include indexes and foreign keys
`;
  } else if (db.orm === "Mongoose") {
    ormInstructions = `
Generate a complete Mongoose schema seed/initialization file in JavaScript.
- Define a Mongoose Schema for each collection inferred from the project
- Export each model using mongoose.model()
- Include all fields, types, required flags, defaults, and refs for relationships
- Add a brief comment explaining how to import and use each schema
`;
  } else {
    ormInstructions = `
Generate a complete raw SQL migration file.
- CREATE TABLE statements for every entity inferred from the project
- Primary keys, foreign keys, NOT NULL constraints, indexes
- Compatible with ${db.dbType}
`;
  }

  return `You are a senior database architect. Generate ONLY the migration file content — no explanations before or after, just the raw file code.

PROJECT: ${project.project_name}
DESCRIPTION: ${project.description}
STACK: ${stackList}
DATABASE: ${db.dbType}${db.orm ? ` via ${db.orm}` : ""}

ENVIRONMENT VARIABLES (hints to infer database structure):
${envVarList}

TOP-LEVEL FOLDERS (hints to infer modules/features):
${folderSummary}

${ormInstructions}

RULES:
1. Infer ALL database tables/collections/models from the project description, stack, and folder names
2. Every entity must have a primary key
3. Foreign key relationships must be explicit
4. Output ONLY the migration file — no markdown fences, no explanations, no headers
5. The file must be production-ready and immediately runnable

Output the migration file content now:`;
}

// ─── Run Instructions ─────────────────────────────────────────────────────────

function buildRunInstructions(db: DbProfile): string[] {
  if (db.orm === "Prisma") {
    return [
      "Place this file in the prisma/migrations/<timestamp>_initial/ folder",
      "Name the file migration.sql",
      "Run: npx prisma migrate deploy (production) or npx prisma migrate dev (development)",
      "Or run directly: npx prisma db execute --file ./prisma/migrations/<folder>/migration.sql",
    ];
  }
  if (db.orm === "Django ORM") {
    return [
      "Place this file in your app's migrations/ folder as 0001_initial.py",
      "Make sure __init__.py exists in the migrations/ folder",
      "Run: python manage.py migrate",
      "To verify: python manage.py showmigrations",
    ];
  }
  if (db.orm === "TypeORM") {
    return [
      `Save as src/migrations/${db.fileNamePrefix}.ts`,
      "Ensure your ormconfig has 'migrations' path configured",
      "Run: npx typeorm migration:run -d src/data-source.ts",
      "To revert: npx typeorm migration:revert -d src/data-source.ts",
    ];
  }
  if (db.orm === "Sequelize") {
    return [
      `Save as migrations/${db.fileNamePrefix}.js`,
      "Run: npx sequelize-cli db:migrate",
      "To undo: npx sequelize-cli db:migrate:undo",
      "To undo all: npx sequelize-cli db:migrate:undo:all",
    ];
  }
  if (db.orm === "Drizzle ORM") {
    return [
      "Save as drizzle/migrations/0001_initial.sql",
      "Run: npx drizzle-kit migrate",
      "Or push directly: npx drizzle-kit push",
    ];
  }
  if (db.orm === "Mongoose") {
    return [
      "Import and run this file once on app startup or as a setup script",
      "Run: node seed-schema.js (ensure MONGODB_URI is set in your .env)",
      "Or import schemas in your app: import './seed-schema.js'",
    ];
  }
  if (db.dbType === "PostgreSQL (Supabase)") {
    return [
      "Go to Supabase Dashboard → SQL Editor",
      "Paste the migration SQL and click Run",
      "Or use Supabase CLI: supabase db push",
      "Or: supabase migration new initial && paste content into the generated file",
    ];
  }
  if (db.dbType.includes("MySQL")) {
    return [
      "Connect to your MySQL database: mysql -u <user> -p <database>",
      `Run: SOURCE ${db.fileNamePrefix}.sql;`,
      "Or: mysql -u <user> -p <database> < migration.sql",
    ];
  }
  if (db.dbType === "SQLite") {
    return [
      `Run: sqlite3 your_database.db < ${db.fileNamePrefix}.sql`,
      "Or open the SQLite shell: sqlite3 your_database.db",
      "Then paste the SQL content directly",
    ];
  }
  // Default PostgreSQL
  return [
    "Connect to your database: psql -U <user> -d <database>",
    `Run: \\i ${db.fileNamePrefix}.sql`,
    "Or: psql -U <user> -d <database> -f migration.sql",
    "Ensure all tables are created: \\dt",
  ];
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: { project?: ProjectStructure };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { project } = body;

  if (!project || !project.project_name || !project.folders) {
    return NextResponse.json({ error: "Missing or invalid project data" }, { status: 400 });
  }

  const db = detectDatabase(project);
  const prompt = buildMigrationPrompt(project, db);

  let migrationContent: string;

  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 4096,
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    // Strip markdown code fences if model wraps output
    migrationContent = raw
      .replace(/^```[a-z]*\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();

    if (!migrationContent || migrationContent.length < 10) {
      return NextResponse.json(
        { error: "AI returned empty migration content. Please try again." },
        { status: 500 }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI call failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const result: MigrationResult = {
    dbType: db.dbType + (db.orm ? ` via ${db.orm}` : ""),
    fileName: `${db.fileNamePrefix}.${db.fileExtension}`,
    migrationContent,
    runInstructions: buildRunInstructions(db),
  };

  return NextResponse.json({ migration: result });
}
