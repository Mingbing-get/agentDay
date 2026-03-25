import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";

import { InMemoryProjectRepository } from "../helpers/in-memory-repository";
import { getHomeViewModel, getProjectDossier } from "@/lib/projects/service";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function createTempDir() {
  const dir = await mkdtemp(join(tmpdir(), "agent-day-projects-"));
  tempDirs.push(dir);
  return dir;
}

describe("project service", () => {
  it("sorts published projects with the newest one featured on the homepage", async () => {
    const repository = new InMemoryProjectRepository();

    await repository.createProject({
      date: "2026-03-24",
      slug: "2026-03-24-archive",
      title: "Archive",
      summary: "Previous archive project",
      theme: "studio",
      archetype: "landing",
      status: "published",
      featured: false,
      heroImage: null,
      artifactPresence: {
        metadata: true,
        brief: true,
        design: true,
        architectureMmd: true,
        architectureSvg: true,
        plan: true,
        codeSummary: true,
        testReport: true,
        demo: true
      },
      publishedAt: new Date("2026-03-24T10:00:00.000Z")
    });

    await repository.createProject({
      date: "2026-03-25",
      slug: "2026-03-25-today",
      title: "Today",
      summary: "Newest project",
      theme: "studio",
      archetype: "dashboard",
      status: "published",
      featured: true,
      heroImage: null,
      artifactPresence: {
        metadata: true,
        brief: true,
        design: true,
        architectureMmd: true,
        architectureSvg: true,
        plan: true,
        codeSummary: true,
        testReport: true,
        demo: true
      },
      publishedAt: new Date("2026-03-25T10:00:00.000Z")
    });

    const model = await getHomeViewModel(repository);

    expect(model.todayProject?.slug).toBe("2026-03-25-today");
    expect(model.historyProjects.map((project) => project.slug)).toEqual(["2026-03-24-archive"]);
  });

  it("loads dossier sections and tolerates missing optional content", async () => {
    const repository = new InMemoryProjectRepository();
    const generatedRoot = await createTempDir();
    const projectDir = join(generatedRoot, "generated", "projects", "2026-03-25-lab");

    await mkdir(join(projectDir, "demo"), { recursive: true });
    await writeFile(
      join(projectDir, "metadata.json"),
      JSON.stringify(
        {
          title: "Lab",
          summary: "A test project",
          theme: "paper-lab",
          archetype: "tool",
          demo: {
            headline: "Lab",
            subheadline: "Useful workflow",
            accent: "#111111"
          }
        },
        null,
        2
      )
    );
    await writeFile(join(projectDir, "brief.md"), "# Brief");
    await writeFile(join(projectDir, "design.md"), "# Design");
    await writeFile(join(projectDir, "architecture.mmd"), "graph TD;A-->B;");
    await writeFile(join(projectDir, "architecture.svg"), "<svg></svg>");
    await writeFile(join(projectDir, "plan.md"), "# Plan");
    await writeFile(join(projectDir, "code-summary.md"), "# Code");
    await writeFile(join(projectDir, "test-report.json"), JSON.stringify({ status: "ok" }));
    await writeFile(join(projectDir, "demo/config.json"), JSON.stringify({ archetype: "tool" }));

    await repository.createProject({
      date: "2026-03-25",
      slug: "2026-03-25-lab",
      title: "Lab",
      summary: "A test project",
      theme: "paper-lab",
      archetype: "tool",
      status: "published",
      featured: true,
      heroImage: null,
      artifactPresence: {
        metadata: true,
        brief: true,
        design: true,
        architectureMmd: true,
        architectureSvg: true,
        plan: true,
        codeSummary: true,
        testReport: true,
        demo: true
      },
      publishedAt: new Date("2026-03-25T10:00:00.000Z")
    });

    const dossier = await getProjectDossier("2026-03-25-lab", repository, generatedRoot);

    expect(dossier.project.slug).toBe("2026-03-25-lab");
    expect(dossier.sections.architectureSvg.available).toBe(true);
    expect(dossier.sections.design.content).toContain("# Design");
    expect(dossier.sections.overview.content).toContain("# Brief");

    await rm(join(projectDir, "code-summary.md"));

    const updated = await getProjectDossier("2026-03-25-lab", repository, generatedRoot);
    expect(updated.sections.codeSummary.available).toBe(false);
    expect(updated.sections.codeSummary.content).toContain("Not generated");

    const report = JSON.parse(await readFile(join(projectDir, "test-report.json"), "utf8"));
    expect(report.status).toBe("ok");
  });
});
