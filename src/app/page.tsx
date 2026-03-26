import type { Metadata } from "next";
import Link from "next/link";

import { PrismaProjectRepository } from "@/lib/projects/prisma-repository";
import { getHomeViewModel } from "@/lib/projects/service";
import { buildHomeMetadata } from "@/lib/seo";

export const metadata: Metadata = buildHomeMetadata();
export const dynamic = "force-dynamic";

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default async function HomePage() {
  const model = await getHomeViewModel(new PrismaProjectRepository());

  return (
    <main className="page-shell">
      <div className="page-frame">
        <header className="site-header">
          <div className="site-brand">
            <span className="site-brand__eyebrow">One AI-generated project per day</span>
            <h1 className="site-brand__title">Agent Daily</h1>
            <p className="site-brand__summary">
              A public studio log where every day lands as a working micro-product, complete
              with architecture diagrams, design notes, planning artifacts, and a live demo.
            </p>
          </div>
          <div className="header-actions">
            <span className="meta-pill">Template-driven builds</span>
            <span className="meta-pill">Dossier archive</span>
          </div>
        </header>

        {model.todayProject ? (
          <>
            <section className="hero-grid">
              <article className="hero-card panel">
                <span className="meta-pill">Today&apos;s release · {formatDate(model.todayProject.date)}</span>
                <h2 className="hero-card__title">{model.todayProject.title}</h2>
                <p className="hero-card__summary">{model.todayProject.summary}</p>
                <div className="hero-actions">
                  <Link
                    className="button-primary"
                    href={`/projects/${model.todayProject.slug}/demo`}
                  >
                    Open demo
                  </Link>
                  <Link className="button-secondary" href={`/projects/${model.todayProject.slug}`}>
                    Open dossier
                  </Link>
                </div>
              </article>

              <aside className="artifact-panel panel">
                <span className="meta-pill">AI artifact center</span>
                <div className="artifact-grid">
                  <div className="artifact-chip">
                    <strong>Architecture Diagram</strong>
                    <span>Mermaid source + SVG output</span>
                  </div>
                  <div className="artifact-chip">
                    <strong>Design Doc</strong>
                    <span>Product framing and interface direction</span>
                  </div>
                  <div className="artifact-chip">
                    <strong>Task Plan</strong>
                    <span>Structured build steps for the generated concept</span>
                  </div>
                  <div className="artifact-chip">
                    <strong>Code + Tests</strong>
                    <span>Implementation summary and generated validation report</span>
                  </div>
                </div>
              </aside>
            </section>

            <section>
              <div className="section-heading">
                <div>
                  <span className="meta-pill">Archive</span>
                  <h2 className="section-title">Earlier drops</h2>
                </div>
                <p className="muted">Descending by published date. Every entry keeps its dossier.</p>
              </div>
              <div className="archive-grid">
                {model.historyProjects.map((project) => (
                  <Link key={project.id} className="archive-card card" href={`/projects/${project.slug}`}>
                    <span className="meta-pill">{formatDate(project.date)}</span>
                    <h3>{project.title}</h3>
                    <p>{project.summary}</p>
                    <span className="meta-pill">{project.archetype}</span>
                  </Link>
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="empty-state panel">
            <span className="meta-pill">No release yet</span>
            <h2 className="section-title">Run `pnpm generate:daily` to publish today&apos;s project.</h2>
            <p className="muted">
              The homepage will automatically promote the newest published project once the
              generator creates its dossier and updates the SQLite index.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
