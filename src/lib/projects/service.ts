import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type {
  ArtifactSection,
  HomeViewModel,
  ProjectDossier,
  ProjectMeta,
  ProjectRepository
} from "@/lib/projects/types";

async function safeReadText(path: string) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

async function safeReadJson<T>(path: string): Promise<T | null> {
  try {
    const content = await readFile(path, "utf8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

function buildSection(title: string, content: string | null, fallback: string): ArtifactSection {
  return {
    title,
    available: content !== null,
    content: content ?? fallback
  };
}

export async function getHomeViewModel(repository: ProjectRepository): Promise<HomeViewModel> {
  const projects = await repository.listPublishedProjects();
  return {
    todayProject: projects[0] ?? null,
    historyProjects: projects.slice(1)
  };
}

export async function getProjectDossier(
  slug: string,
  repository: ProjectRepository,
  generatedRoot: string
): Promise<ProjectDossier> {
  const project = await repository.findProjectBySlug(slug);

  if (!project) {
    throw new Error(`Project ${slug} not found`);
  }

  const projectDir = join(generatedRoot, "generated", "projects", slug);
  const meta = (await safeReadJson<ProjectMeta>(join(projectDir, "metadata.json"))) ?? {
    date: project.date,
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    theme: project.theme,
    archetype: project.archetype,
    heroImage: project.heroImage,
    demo: {
      headline: project.title,
      subheadline: project.summary,
      accent: "#111827"
    }
  };

  return {
    project,
    meta,
    sections: {
      overview: buildSection(
        "Overview",
        await safeReadText(join(projectDir, "brief.md")),
        "# Not generated\n\nOverview artifact is not available for this project."
      ),
      architectureSvg: buildSection(
        "Architecture",
        await safeReadText(join(projectDir, "architecture.svg")),
        "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='120'><text x='16' y='64' fill='#111827'>Not generated</text></svg>"
      ),
      design: buildSection(
        "Design Doc",
        await safeReadText(join(projectDir, "design.md")),
        "# Not generated\n\nDesign doc is not available for this project."
      ),
      plan: buildSection(
        "Task Plan",
        await safeReadText(join(projectDir, "plan.md")),
        "# Not generated\n\nTask plan is not available for this project."
      ),
      codeSummary: buildSection(
        "Code Summary",
        await safeReadText(join(projectDir, "code-summary.md")),
        "# Not generated\n\nCode summary is not available for this project."
      ),
      testReport: buildSection(
        "Test Report",
        await safeReadText(join(projectDir, "test-report.json")),
        '{\n  "status": "Not generated"\n}'
      )
    }
  };
}
