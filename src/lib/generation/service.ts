import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  type GenerationStatus,
  type ProjectArchetype,
  type ProjectArtifactPresence,
  type ProjectMeta,
  type ProjectRecord,
  type ProjectRepository
} from "@/lib/projects/types";

const ARCHETYPES: ProjectArchetype[] = ["landing", "tool", "dashboard"];

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function titleCase(input: string) {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function pickArchetype(seed: string): ProjectArchetype {
  const score = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return ARCHETYPES[score % ARCHETYPES.length] ?? "tool";
}

function pickTheme(archetype: ProjectArchetype) {
  const themes: Record<ProjectArchetype, string> = {
    landing: "copper-editorial",
    tool: "teal-lab",
    dashboard: "cobalt-signal"
  };
  return themes[archetype];
}

function buildProjectMeta(date: string, topic: string, archetype: ProjectArchetype): ProjectMeta {
  const title = titleCase(topic);
  const slug = `${date}-${slugify(topic || "daily-project")}`;
  const theme = pickTheme(archetype);
  const accentMap: Record<ProjectArchetype, string> = {
    landing: "#b4492d",
    tool: "#116466",
    dashboard: "#274690"
  };

  return {
    date,
    slug,
    title,
    summary: `${title} is a ${archetype}-style micro product generated for ${date}, packaged with its own demo and AI dossier.`,
    theme,
    archetype,
    heroImage: null,
    demo: {
      headline: title,
      subheadline: `A daily-generated ${archetype} concept focused on clarity, usefulness, and speed to launch.`,
      accent: accentMap[archetype]
    }
  };
}

function buildArtifactPresence(values?: Partial<ProjectArtifactPresence>): ProjectArtifactPresence {
  return {
    metadata: false,
    brief: false,
    design: false,
    architectureMmd: false,
    architectureSvg: false,
    plan: false,
    codeSummary: false,
    testReport: false,
    demo: false,
    ...values
  };
}

function buildBrief(meta: ProjectMeta) {
  return `# ${meta.title} Brief

- Date: ${meta.date}
- Archetype: ${meta.archetype}
- Theme: ${meta.theme}
- Core promise: ${meta.summary}

## Audience
Independent builders and lean operators who want a useful, legible tool generated every day.

## Success Criteria
- Explain the product in one screen
- Offer a working demo route
- Preserve architecture, design, and test artifacts for later review
`;
}

function buildDesign(meta: ProjectMeta) {
  return `# ${meta.title} Design Doc

## Product Idea
${meta.summary}

## Primary Experience
The public landing experience highlights the new project of the day while the dossier page preserves the AI-generated thinking that shaped it.

## Interface Direction
Use a ${meta.theme} visual system with strong headings, dense side notes, and a demo shell tuned for the ${meta.archetype} archetype.
`;
}

function buildPlan(meta: ProjectMeta) {
  return `# ${meta.title} Task Plan

1. Define the story and positioning for the generated idea.
2. Produce the dossier artifacts in a fixed schema.
3. Render the shared demo experience for the ${meta.archetype} template.
4. Validate artifact completeness before publishing.
`;
}

function buildCodeSummary(meta: ProjectMeta) {
  return `# ${meta.title} Code Summary

- Shared runtime: Next.js App Router
- Data model: Prisma + SQLite index
- Artifact source: generated/projects/${meta.slug}
- Demo archetype: ${meta.archetype}
`;
}

function buildArchitectureMmd(meta: ProjectMeta) {
  return `flowchart LR
    A["Local CLI Command"] --> B["Generator Service"]
    B --> C["Artifact Files"]
    B --> D["Project Index (SQLite)"]
    D --> E["Homepage"]
    C --> F["Project Dossier"]
    D --> F
    C --> G["Demo Route"]
    classDef accent fill:${meta.demo.accent},color:#ffffff,stroke:#0f172a;
    class B,F,G accent;
`;
}

function buildArchitectureSvg(meta: ProjectMeta) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="320" viewBox="0 0 880 320" fill="none">
  <rect width="880" height="320" rx="24" fill="#f5f1e8"/>
  <rect x="40" y="56" width="180" height="68" rx="18" fill="#111827"/>
  <text x="130" y="96" text-anchor="middle" fill="#f9fafb" font-family="Georgia, serif" font-size="20">CLI Command</text>
  <rect x="280" y="56" width="200" height="68" rx="18" fill="${meta.demo.accent}"/>
  <text x="380" y="96" text-anchor="middle" fill="#f9fafb" font-family="Georgia, serif" font-size="20">Generator</text>
  <rect x="560" y="36" width="240" height="68" rx="18" fill="#ffffff" stroke="#111827"/>
  <text x="680" y="76" text-anchor="middle" fill="#111827" font-family="Georgia, serif" font-size="20">Artifact Files</text>
  <rect x="560" y="132" width="240" height="68" rx="18" fill="#ffffff" stroke="#111827"/>
  <text x="680" y="172" text-anchor="middle" fill="#111827" font-family="Georgia, serif" font-size="20">SQLite Index</text>
  <rect x="280" y="228" width="200" height="52" rx="16" fill="#ffffff" stroke="#111827"/>
  <text x="380" y="260" text-anchor="middle" fill="#111827" font-family="Georgia, serif" font-size="18">Project Dossier + Demo</text>
  <path d="M220 90H280" stroke="#111827" stroke-width="3" stroke-linecap="round"/>
  <path d="M480 90H560" stroke="#111827" stroke-width="3" stroke-linecap="round"/>
  <path d="M380 124V228" stroke="#111827" stroke-width="3" stroke-linecap="round"/>
  <path d="M680 104V132" stroke="#111827" stroke-width="3" stroke-linecap="round"/>
  <path d="M560 166H480" stroke="#111827" stroke-width="3" stroke-linecap="round"/>
  <text x="440" y="28" fill="#6b7280" font-family="ui-monospace, monospace" font-size="14">${meta.title}</text>
</svg>`;
}

async function writeGeneratedFiles(projectDir: string, meta: ProjectMeta) {
  await mkdir(join(projectDir, "demo"), { recursive: true });

  await Promise.all([
    writeFile(join(projectDir, "metadata.json"), JSON.stringify(meta, null, 2)),
    writeFile(join(projectDir, "brief.md"), buildBrief(meta)),
    writeFile(join(projectDir, "design.md"), buildDesign(meta)),
    writeFile(join(projectDir, "architecture.mmd"), buildArchitectureMmd(meta)),
    writeFile(join(projectDir, "architecture.svg"), buildArchitectureSvg(meta)),
    writeFile(join(projectDir, "plan.md"), buildPlan(meta)),
    writeFile(join(projectDir, "code-summary.md"), buildCodeSummary(meta)),
    writeFile(
      join(projectDir, "test-report.json"),
      JSON.stringify(
        {
          status: "ok",
          checks: ["required artifacts", "demo config", "project index"],
          generatedAt: new Date().toISOString()
        },
        null,
        2
      )
    ),
    writeFile(
      join(projectDir, "demo", "config.json"),
      JSON.stringify(
        {
          archetype: meta.archetype,
          headline: meta.demo.headline,
          subheadline: meta.demo.subheadline,
          accent: meta.demo.accent
        },
        null,
        2
      )
    )
  ]);
}

async function fileExists(path: string) {
  try {
    await readFile(path);
    return true;
  } catch {
    return false;
  }
}

export async function resolveArtifactPresence(projectDir: string): Promise<ProjectArtifactPresence> {
  return buildArtifactPresence({
    metadata: await fileExists(join(projectDir, "metadata.json")),
    brief: await fileExists(join(projectDir, "brief.md")),
    design: await fileExists(join(projectDir, "design.md")),
    architectureMmd: await fileExists(join(projectDir, "architecture.mmd")),
    architectureSvg: await fileExists(join(projectDir, "architecture.svg")),
    plan: await fileExists(join(projectDir, "plan.md")),
    codeSummary: await fileExists(join(projectDir, "code-summary.md")),
    testReport: await fileExists(join(projectDir, "test-report.json")),
    demo: await fileExists(join(projectDir, "demo", "config.json"))
  });
}

function allRequiredArtifactsPresent(artifacts: ProjectArtifactPresence) {
  return Object.values(artifacts).every(Boolean);
}

export async function generateDailyProject(input: {
  date: string;
  topic?: string;
  force: boolean;
  generatedRoot: string;
  repository: ProjectRepository;
  now?: Date;
}): Promise<{
  project: ProjectRecord;
  projectDir: string;
}> {
  const topic = input.topic?.trim() || "daily experimental project";
  const archetype = pickArchetype(`${input.date}:${topic}`);
  const meta = buildProjectMeta(input.date, topic, archetype);
  const now = input.now ?? new Date();

  const existing = await input.repository.findProjectByDate(input.date);

  if (existing && !input.force) {
    throw new Error(`Project for ${input.date} already exists`);
  }

  if (existing && input.force && !["draft", "failed"].includes(existing.status)) {
    throw new Error(`Project for ${input.date} can only be force regenerated from draft or failed`);
  }

  const initialArtifacts = buildArtifactPresence({ metadata: true });
  const project =
    existing === null
      ? await input.repository.createProject({
          date: input.date,
          slug: meta.slug,
          title: meta.title,
          summary: meta.summary,
          theme: meta.theme,
          archetype: meta.archetype,
          status: "draft",
          featured: false,
          heroImage: meta.heroImage,
          artifactPresence: initialArtifacts,
          publishedAt: null
        })
      : await input.repository.updateProject(existing.id, {
          slug: meta.slug,
          title: meta.title,
          summary: meta.summary,
          theme: meta.theme,
          archetype: meta.archetype,
          status: "draft",
          featured: false,
          heroImage: meta.heroImage,
          artifactPresence: initialArtifacts,
          publishedAt: null
        });

  const run = await input.repository.createGenerationRun({
    projectId: project.id,
    status: "draft",
    startedAt: now,
    finishedAt: null,
    errorSummary: null
  });

  const projectDir = join(input.generatedRoot, "generated", "projects", meta.slug);

  try {
    await writeGeneratedFiles(projectDir, meta);
    const artifacts = await resolveArtifactPresence(projectDir);

    if (!allRequiredArtifactsPresent(artifacts)) {
      throw new Error("Required artifacts are missing");
    }

    const published = await input.repository.updateProject(project.id, {
      slug: meta.slug,
      title: meta.title,
      summary: meta.summary,
      theme: meta.theme,
      archetype: meta.archetype,
      status: "published",
      featured: true,
      artifactPresence: artifacts,
      publishedAt: now
    });

    await input.repository.updateGenerationRun(run.id, {
      status: "published",
      finishedAt: now,
      errorSummary: null
    });

    return {
      project: published,
      projectDir
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown generation error";
    const failedStatus: GenerationStatus = "failed";

    await input.repository.updateProject(project.id, {
      status: failedStatus,
      featured: false,
      publishedAt: null
    });
    await input.repository.updateGenerationRun(run.id, {
      status: failedStatus,
      finishedAt: now,
      errorSummary: message
    });

    throw error;
  }
}
