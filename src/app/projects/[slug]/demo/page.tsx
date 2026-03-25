import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buildDemoViewModel } from "@/lib/generation/demo";
import { PrismaProjectRepository } from "@/lib/projects/prisma-repository";
import { getProjectDossier } from "@/lib/projects/service";
import { buildDemoPageMetadata } from "@/lib/seo";

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
      title: "Project demo not found",
      robots: {
        index: false,
        follow: false
      }
    };
  }

  return buildDemoPageMetadata(project);
}

export default async function ProjectDemoPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const dossier = await getProjectDossier(slug, new PrismaProjectRepository(), generatedRoot);
    const demo = buildDemoViewModel({
      archetype: dossier.project.archetype,
      title: dossier.meta.demo.headline,
      summary: dossier.meta.demo.subheadline,
      theme: dossier.meta.theme
    });

    return (
      <main className="page-shell">
        <div className="page-frame">
          <header className="site-header">
            <div className="site-brand">
              <span className="site-brand__eyebrow">Shared demo runtime</span>
              <h1 className="demo-title">{demo.headline}</h1>
              <p className="site-brand__summary">{demo.summary}</p>
            </div>
            <div className="header-actions">
              <Link className="button-secondary" href={`/projects/${slug}`}>
                View dossier
              </Link>
              <Link className="button-primary" href="/">
                Back home
              </Link>
            </div>
          </header>

          <section className="demo-shell panel">
            <div
              className="demo-hero"
              style={{
                background: `linear-gradient(140deg, ${demo.accent}, #111827)`
              }}
            >
              <div>
                <span className="meta-pill" style={{ color: "rgba(255,255,255,0.72)" }}>
                  {demo.eyebrow}
                </span>
                <h2 className="demo-title">{demo.headline}</h2>
                <p>{demo.summary}</p>
              </div>
              <div className="demo-meta">
                <span className="demo-pill">{dossier.project.archetype}</span>
                <span className="demo-pill">{dossier.meta.theme}</span>
                <span className="demo-pill">{dossier.project.date}</span>
              </div>
            </div>

            <div className="demo-grid">
              {demo.sections.map((section) => (
                <article className="demo-card" key={section.title}>
                  <span className="meta-pill">{section.title}</span>
                  <h3>{section.value}</h3>
                  <p>{section.detail}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  } catch {
    notFound();
  }
}
