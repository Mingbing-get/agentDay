import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type {
  GenerationRunRecord,
  ProjectArtifactPresence,
  ProjectRecord,
  ProjectRepository
} from "@/lib/projects/types";

function parseArtifacts(value: string): ProjectArtifactPresence {
  return JSON.parse(value) as ProjectArtifactPresence;
}

function serializeArtifacts(value: ProjectArtifactPresence) {
  return JSON.stringify(value);
}

function mapProject(record: {
  id: string;
  date: string;
  slug: string;
  title: string;
  summary: string;
  theme: string;
  archetype: string;
  status: string;
  featured: boolean;
  heroImage: string | null;
  artifactPresence: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): ProjectRecord {
  return {
    ...record,
    archetype: record.archetype as ProjectRecord["archetype"],
    status: record.status as ProjectRecord["status"],
    artifactPresence: parseArtifacts(record.artifactPresence)
  };
}

function mapRun(record: {
  id: string;
  projectId: string;
  status: string;
  startedAt: Date;
  finishedAt: Date | null;
  errorSummary: string | null;
}): GenerationRunRecord {
  return {
    ...record,
    status: record.status as GenerationRunRecord["status"]
  };
}

export function isMissingTableError(error: unknown) {
  if (error instanceof Error && /no such table/i.test(error.message)) {
    return true;
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as { code?: unknown; message?: unknown };

    if (candidate.code === "P2021") {
      return true;
    }

    if (typeof candidate.message === "string" && /does not exist in the current database/i.test(candidate.message)) {
      return true;
    }
  }

  return false;
}

export class PrismaProjectRepository implements ProjectRepository {
  async findProjectByDate(date: string) {
    try {
      const record = await prisma.project.findUnique({ where: { date } });
      return record ? mapProject(record) : null;
    } catch (error) {
      if (isMissingTableError(error)) {
        return null;
      }
      throw error;
    }
  }

  async findProjectBySlug(slug: string) {
    try {
      const record = await prisma.project.findUnique({ where: { slug } });
      return record ? mapProject(record) : null;
    } catch (error) {
      if (isMissingTableError(error)) {
        return null;
      }
      throw error;
    }
  }

  async listPublishedProjects() {
    try {
      const records = await prisma.project.findMany({
        where: { status: "published" },
        orderBy: [{ date: "desc" }]
      });
      return records.map(mapProject);
    } catch (error) {
      if (isMissingTableError(error)) {
        return [];
      }
      throw error;
    }
  }

  async createProject(input: {
    date: string;
    slug: string;
    title: string;
    summary: string;
    theme: string;
    archetype: ProjectRecord["archetype"];
    status: ProjectRecord["status"];
    featured: boolean;
    heroImage: string | null;
    artifactPresence: ProjectArtifactPresence;
    publishedAt: Date | null;
  }) {
    const record = await prisma.project.create({
      data: {
        ...input,
        artifactPresence: serializeArtifacts(input.artifactPresence)
      }
    });
    return mapProject(record);
  }

  async updateProject(projectId: string, input: Partial<ProjectRecord>) {
    const data: Prisma.ProjectUpdateInput = {
      ...input,
      artifactPresence:
        input.artifactPresence === undefined ? undefined : serializeArtifacts(input.artifactPresence)
    };
    const record = await prisma.project.update({
      where: { id: projectId },
      data
    });
    return mapProject(record);
  }

  async createGenerationRun(input: {
    projectId: string;
    status: GenerationRunRecord["status"];
    startedAt: Date;
    finishedAt: Date | null;
    errorSummary: string | null;
  }) {
    const record = await prisma.generationRun.create({
      data: input
    });
    return mapRun(record);
  }

  async updateGenerationRun(
    runId: string,
    input: Partial<Pick<GenerationRunRecord, "status" | "finishedAt" | "errorSummary">>
  ) {
    const record = await prisma.generationRun.update({
      where: { id: runId },
      data: input
    });
    return mapRun(record);
  }

  async listGenerationRunsForProject(projectId: string) {
    const records = await prisma.generationRun.findMany({
      where: { projectId },
      orderBy: [{ startedAt: "desc" }]
    });
    return records.map(mapRun);
  }
}
