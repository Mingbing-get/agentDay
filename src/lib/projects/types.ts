export type ProjectArchetype = "landing" | "tool" | "dashboard";
export type GenerationStatus = "draft" | "published" | "failed";

export type ProjectArtifactPresence = {
  metadata: boolean;
  brief: boolean;
  design: boolean;
  architectureMmd: boolean;
  architectureSvg: boolean;
  plan: boolean;
  codeSummary: boolean;
  testReport: boolean;
  demo: boolean;
};

export type ProjectRecord = {
  id: string;
  date: string;
  slug: string;
  title: string;
  summary: string;
  theme: string;
  archetype: ProjectArchetype;
  status: GenerationStatus;
  featured: boolean;
  heroImage: string | null;
  artifactPresence: ProjectArtifactPresence;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GenerationRunRecord = {
  id: string;
  projectId: string;
  status: GenerationStatus;
  startedAt: Date;
  finishedAt: Date | null;
  errorSummary: string | null;
};

export type ProjectMeta = {
  date: string;
  slug: string;
  title: string;
  summary: string;
  theme: string;
  archetype: ProjectArchetype;
  heroImage: string | null;
  demo: {
    headline: string;
    subheadline: string;
    accent: string;
  };
};

export type ArtifactSection = {
  title: string;
  available: boolean;
  content: string;
};

export type ProjectDossier = {
  project: ProjectRecord;
  meta: ProjectMeta;
  sections: {
    overview: ArtifactSection;
    architectureSvg: ArtifactSection;
    design: ArtifactSection;
    plan: ArtifactSection;
    codeSummary: ArtifactSection;
    testReport: ArtifactSection;
  };
};

export type HomeViewModel = {
  todayProject: ProjectRecord | null;
  historyProjects: ProjectRecord[];
};

export interface ProjectRepository {
  findProjectByDate(date: string): Promise<ProjectRecord | null>;
  findProjectBySlug(slug: string): Promise<ProjectRecord | null>;
  listPublishedProjects(): Promise<ProjectRecord[]>;
  createProject(input: {
    date: string;
    slug: string;
    title: string;
    summary: string;
    theme: string;
    archetype: ProjectArchetype;
    status: GenerationStatus;
    featured: boolean;
    heroImage: string | null;
    artifactPresence: ProjectArtifactPresence;
    publishedAt: Date | null;
  }): Promise<ProjectRecord>;
  updateProject(
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
  ): Promise<ProjectRecord>;
  createGenerationRun(input: {
    projectId: string;
    status: GenerationStatus;
    startedAt: Date;
    finishedAt: Date | null;
    errorSummary: string | null;
  }): Promise<GenerationRunRecord>;
  updateGenerationRun(
    runId: string,
    input: Partial<Pick<GenerationRunRecord, "status" | "finishedAt" | "errorSummary">>
  ): Promise<GenerationRunRecord>;
  listGenerationRunsForProject(projectId: string): Promise<GenerationRunRecord[]>;
}
