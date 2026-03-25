import type {
  GenerationRunRecord,
  GenerationStatus,
  ProjectArtifactPresence,
  ProjectRecord,
  ProjectRepository
} from "@/lib/projects/types";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export class InMemoryProjectRepository implements ProjectRepository {
  private projects = new Map<string, ProjectRecord>();
  private projectsBySlug = new Map<string, ProjectRecord>();
  private runs = new Map<string, GenerationRunRecord>();

  async findProjectByDate(date: string) {
    return clone(this.projects.get(date) ?? null);
  }

  async findProjectBySlug(slug: string) {
    return clone(this.projectsBySlug.get(slug) ?? null);
  }

  async listPublishedProjects() {
    return clone(
      [...this.projects.values()]
        .filter((project) => project.status === "published")
        .sort((a, b) => b.date.localeCompare(a.date))
    );
  }

  async createProject(input: {
    date: string;
    slug: string;
    title: string;
    summary: string;
    theme: string;
    archetype: ProjectRecord["archetype"];
    status: GenerationStatus;
    featured: boolean;
    heroImage: string | null;
    artifactPresence: ProjectArtifactPresence;
    publishedAt: Date | null;
  }) {
    const record: ProjectRecord = {
      id: `project-${this.projects.size + 1}`,
      createdAt: new Date("2026-03-25T00:00:00.000Z"),
      updatedAt: new Date("2026-03-25T00:00:00.000Z"),
      ...input
    };
    this.projects.set(record.date, record);
    this.projectsBySlug.set(record.slug, record);
    return clone(record);
  }

  async updateProject(
    projectId: string,
    input: Partial<
      Pick<
        ProjectRecord,
        | "slug"
        | "title"
        | "summary"
        | "theme"
        | "archetype"
        | "status"
        | "featured"
        | "heroImage"
        | "artifactPresence"
        | "publishedAt"
      >
    >
  ) {
    const current = [...this.projects.values()].find((project) => project.id === projectId);
    if (!current) {
      throw new Error(`Project ${projectId} not found`);
    }

    const next: ProjectRecord = {
      ...current,
      ...input,
      updatedAt: new Date("2026-03-25T00:00:00.000Z")
    };

    this.projects.set(next.date, next);
    this.projectsBySlug.set(next.slug, next);
    return clone(next);
  }

  async createGenerationRun(input: {
    projectId: string;
    status: GenerationStatus;
    startedAt: Date;
    finishedAt: Date | null;
    errorSummary: string | null;
  }) {
    const run: GenerationRunRecord = {
      id: `run-${this.runs.size + 1}`,
      ...input
    };
    this.runs.set(run.id, run);
    return clone(run);
  }

  async updateGenerationRun(
    runId: string,
    input: Partial<Pick<GenerationRunRecord, "status" | "finishedAt" | "errorSummary">>
  ) {
    const current = this.runs.get(runId);
    if (!current) {
      throw new Error(`Run ${runId} not found`);
    }

    const next: GenerationRunRecord = {
      ...current,
      ...input
    };
    this.runs.set(runId, next);
    return clone(next);
  }

  async listGenerationRunsForProject(projectId: string) {
    return clone(
      [...this.runs.values()]
        .filter((run) => run.projectId === projectId)
        .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
    );
  }
}
