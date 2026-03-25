import { describe, expect, it } from "vitest";

import {
  buildDemoPageMetadata,
  buildProjectPageMetadata,
  buildProjectStructuredData,
  buildSiteMetadata,
  buildSitemapEntries
} from "@/lib/seo";
import type { ProjectRecord } from "@/lib/projects/types";

const sampleProject: ProjectRecord = {
  id: "project-1",
  date: "2026-03-25",
  slug: "2026-03-25-ai-timeboxing-coach",
  title: "AI Timeboxing Coach",
  summary: "An AI-generated daily project for planning focused work sessions.",
  theme: "copper-editorial",
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
  publishedAt: new Date("2026-03-25T09:00:00.000Z"),
  createdAt: new Date("2026-03-25T09:00:00.000Z"),
  updatedAt: new Date("2026-03-25T09:00:00.000Z")
};

describe("seo helpers", () => {
  it("builds site metadata with a canonical site url", () => {
    const metadata = buildSiteMetadata("https://agentdaily.example");

    expect(metadata.metadataBase?.toString()).toBe("https://agentdaily.example/");
    expect(metadata.openGraph?.siteName).toBe("Agent Daily");
    expect(metadata.twitter?.card).toBe("summary_large_image");
  });

  it("builds indexable dossier metadata for published projects", () => {
    const metadata = buildProjectPageMetadata(sampleProject, "https://agentdaily.example");

    expect(metadata.title).toContain(sampleProject.title);
    expect(metadata.description).toContain(sampleProject.summary);
    expect(metadata.alternates?.canonical).toBe(
      `https://agentdaily.example/projects/${sampleProject.slug}`
    );
    expect(metadata.robots?.index).toBe(true);
    expect(metadata.openGraph?.type).toBe("article");
  });

  it("marks demo pages as noindex to avoid duplicate indexing", () => {
    const metadata = buildDemoPageMetadata(sampleProject, "https://agentdaily.example");

    expect(metadata.robots).toEqual({
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true
      }
    });
    expect(metadata.alternates?.canonical).toBe(
      `https://agentdaily.example/projects/${sampleProject.slug}`
    );
  });

  it("builds creative work structured data and excludes demo pages from the sitemap", () => {
    const structuredData = buildProjectStructuredData(
      sampleProject,
      "https://agentdaily.example"
    );
    const entries = buildSitemapEntries([sampleProject], "https://agentdaily.example");

    expect(structuredData["@type"]).toBe("CreativeWork");
    expect(structuredData.url).toBe(
      `https://agentdaily.example/projects/${sampleProject.slug}`
    );
    expect(entries.map((entry) => entry.url)).toEqual([
      "https://agentdaily.example/",
      `https://agentdaily.example/projects/${sampleProject.slug}`
    ]);
  });
});
