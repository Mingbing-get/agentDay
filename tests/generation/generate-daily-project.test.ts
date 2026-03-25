import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";

import { InMemoryProjectRepository } from "../helpers/in-memory-repository";
import { generateDailyProject } from "@/lib/generation/service";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function createTempDir() {
  const dir = await mkdtemp(join(tmpdir(), "agent-day-"));
  tempDirs.push(dir);
  return dir;
}

describe("generateDailyProject", () => {
  it("creates all required artifacts and publishes the project", async () => {
    const repository = new InMemoryProjectRepository();
    const generatedRoot = await createTempDir();

    const result = await generateDailyProject({
      date: "2026-03-25",
      topic: "AI timeboxing coach",
      force: false,
      generatedRoot,
      repository,
      now: new Date("2026-03-25T08:00:00.000Z")
    });

    expect(result.project.status).toBe("published");
    expect(result.project.artifactPresence.architectureSvg).toBe(true);
    expect(result.project.artifactPresence.demo).toBe(true);
    expect(result.project.slug).toMatch(/^2026-03-25-/);

    const artifactFiles = [
      "metadata.json",
      "brief.md",
      "design.md",
      "architecture.mmd",
      "architecture.svg",
      "plan.md",
      "code-summary.md",
      "test-report.json",
      "demo/config.json"
    ];

    await Promise.all(
      artifactFiles.map(async (file) => {
        const content = await readFile(join(result.projectDir, file), "utf8");
        expect(content.length).toBeGreaterThan(0);
      })
    );

    const stored = await repository.findProjectByDate("2026-03-25");
    expect(stored?.featured).toBe(true);

    const runs = await repository.listGenerationRunsForProject(stored!.id);
    expect(runs).toHaveLength(1);
    expect(runs[0]?.status).toBe("published");
  });

  it("rejects a second generation on the same date without force", async () => {
    const repository = new InMemoryProjectRepository();
    const generatedRoot = await createTempDir();

    await generateDailyProject({
      date: "2026-03-25",
      topic: "First idea",
      force: false,
      generatedRoot,
      repository,
      now: new Date("2026-03-25T08:00:00.000Z")
    });

    await expect(
      generateDailyProject({
        date: "2026-03-25",
        topic: "Second idea",
        force: false,
        generatedRoot,
        repository,
        now: new Date("2026-03-25T09:00:00.000Z")
      })
    ).rejects.toThrow("already exists");
  });

  it("allows force regeneration only when the existing project is draft", async () => {
    const repository = new InMemoryProjectRepository();
    const generatedRoot = await createTempDir();

    const draft = await repository.createProject({
      date: "2026-03-25",
      slug: "2026-03-25-draft-project",
      title: "Draft Project",
      summary: "Draft summary",
      theme: "lab",
      archetype: "tool",
      status: "draft",
      featured: false,
      heroImage: null,
      artifactPresence: {
        metadata: true,
        brief: false,
        design: false,
        architectureMmd: false,
        architectureSvg: false,
        plan: false,
        codeSummary: false,
        testReport: false,
        demo: false
      },
      publishedAt: null
    });

    await repository.createGenerationRun({
      projectId: draft.id,
      status: "draft",
      startedAt: new Date("2026-03-25T07:00:00.000Z"),
      finishedAt: new Date("2026-03-25T07:10:00.000Z"),
      errorSummary: null
    });

    const result = await generateDailyProject({
      date: "2026-03-25",
      topic: "Recovered project",
      force: true,
      generatedRoot,
      repository,
      now: new Date("2026-03-25T08:00:00.000Z")
    });

    expect(result.project.status).toBe("published");
    expect(result.project.id).toBe(draft.id);
  });
});
