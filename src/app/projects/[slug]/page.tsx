import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

import { PrismaProjectRepository } from "@/lib/projects/prisma-repository";
import { getProjectDossier } from "@/lib/projects/service";
import { buildProjectPageMetadata, buildProjectStructuredData } from "@/lib/seo";

const generatedRoot = process.cwd();

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await new PrismaProjectRepository().findProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project not found"
    };
  }

  return buildProjectPageMetadata(project);
}

export default async function ProjectPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const dossier = await getProjectDossier(slug, new PrismaProjectRepository(), generatedRoot);
    const structuredData = buildProjectStructuredData(dossier.project);

    return (
      <main className="page-shell">
        <div className="page-frame">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
          <header className="site-header">
            <div className="site-brand">
              <span className="site-brand__eyebrow">Project dossier</span>
              <h1 className="dossier-title">{dossier.project.title}</h1>
              <p className="site-brand__summary">{dossier.project.summary}</p>
            </div>
            <div className="header-actions">
              <Link className="button-secondary" href="/">
                Back home
              </Link>
              <Link className="button-primary" href={`/projects/${dossier.project.slug}/demo`}>
                Open demo
              </Link>
            </div>
          </header>

          <section className="dossier-grid">
            <aside className="dossier-sidebar panel">
              <span className="meta-pill">{dossier.project.date}</span>
              <div className="stat-grid">
                <div className="stat-card">
                  <strong>Archetype</strong>
                  <span>{dossier.project.archetype}</span>
                </div>
                <div className="stat-card">
                  <strong>Status</strong>
                  <span>{dossier.project.status}</span>
                </div>
                <div className="stat-card">
                  <strong>Theme</strong>
                  <span>{dossier.meta.theme}</span>
                </div>
                <div className="stat-card">
                  <strong>Artifacts</strong>
                  <span>{Object.values(dossier.project.artifactPresence).filter(Boolean).length} ready</span>
                </div>
              </div>
            </aside>

            <div className="dossier-main panel">
              <div className="section-stack">
                <article className="section-card">
                  <span className="meta-pill">{dossier.sections.overview.title}</span>
                  <ReactMarkdown>{dossier.sections.overview.content}</ReactMarkdown>
                </article>
                <article className="section-card">
                  <span className="meta-pill">{dossier.sections.architectureSvg.title}</span>
                  <div
                    dangerouslySetInnerHTML={{ __html: dossier.sections.architectureSvg.content }}
                  />
                </article>
                <article className="section-card">
                  <span className="meta-pill">{dossier.sections.design.title}</span>
                  <ReactMarkdown>{dossier.sections.design.content}</ReactMarkdown>
                </article>
                <article className="section-card">
                  <span className="meta-pill">{dossier.sections.plan.title}</span>
                  <ReactMarkdown>{dossier.sections.plan.content}</ReactMarkdown>
                </article>
                <article className="section-card">
                  <span className="meta-pill">{dossier.sections.codeSummary.title}</span>
                  <ReactMarkdown>{dossier.sections.codeSummary.content}</ReactMarkdown>
                </article>
                <article className="section-card">
                  <span className="meta-pill">{dossier.sections.testReport.title}</span>
                  <pre>{dossier.sections.testReport.content}</pre>
                </article>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  } catch {
    notFound();
  }
}
