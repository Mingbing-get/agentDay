import type { Metadata, MetadataRoute } from "next";

import type { ProjectRecord } from "@/lib/projects/types";

const SITE_NAME = "Agent Daily";
const DEFAULT_SITE_URL = "http://localhost:3000";
const DEFAULT_DESCRIPTION =
  "Agent Daily publishes one AI-generated project per day, with a live demo, architecture diagram, design notes, planning artifacts, and test output.";

export function getSiteUrl(siteUrl?: string) {
  return siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? DEFAULT_SITE_URL;
}

function buildAbsoluteUrl(path: string, siteUrl?: string) {
  return new URL(path, getSiteUrl(siteUrl)).toString();
}

export function buildSiteMetadata(siteUrl?: string): Metadata {
  const resolvedSiteUrl = getSiteUrl(siteUrl);

  return {
    metadataBase: new URL(resolvedSiteUrl),
    applicationName: SITE_NAME,
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`
    },
    description: DEFAULT_DESCRIPTION,
    keywords: [
      "AI-generated projects",
      "daily AI builds",
      "project dossier",
      "architecture diagrams",
      "design documentation",
      "Next.js showcase"
    ],
    category: "technology",
    alternates: {
      canonical: resolvedSiteUrl
    },
    openGraph: {
      type: "website",
      url: resolvedSiteUrl,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      locale: "en_US"
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1
      }
    }
  };
}

export function buildHomeMetadata(siteUrl?: string): Metadata {
  const canonical = buildAbsoluteUrl("/", siteUrl);

  return {
    title: "Daily AI Projects and Technical Dossiers",
    description: DEFAULT_DESCRIPTION,
    alternates: {
      canonical
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      title: "Agent Daily",
      description: DEFAULT_DESCRIPTION
    },
    twitter: {
      card: "summary_large_image",
      title: "Agent Daily",
      description: DEFAULT_DESCRIPTION
    }
  };
}

export function buildProjectPageMetadata(project: ProjectRecord, siteUrl?: string): Metadata {
  const canonical = buildAbsoluteUrl(`/projects/${project.slug}`, siteUrl);
  const description = `${project.summary} View the full dossier, architecture diagram, design notes, task plan, code summary, and test report.`;

  return {
    title: `${project.title} Dossier`,
    description,
    alternates: {
      canonical
    },
    openGraph: {
      type: "article",
      url: canonical,
      siteName: SITE_NAME,
      title: `${project.title} Dossier`,
      description,
      publishedTime: project.publishedAt?.toISOString(),
      modifiedTime: project.updatedAt.toISOString(),
      tags: [project.archetype, project.theme, "AI-generated project"]
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} Dossier`,
      description
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true
      }
    }
  };
}

export function buildDemoPageMetadata(project: ProjectRecord, siteUrl?: string): Metadata {
  return {
    title: `${project.title} Demo`,
    description: `${project.summary} Live demo page for the daily-generated project.`,
    alternates: {
      canonical: buildAbsoluteUrl(`/projects/${project.slug}`, siteUrl)
    },
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true
      }
    }
  };
}

export function buildProjectStructuredData(project: ProjectRecord, siteUrl?: string) {
  const canonical = buildAbsoluteUrl(`/projects/${project.slug}`, siteUrl);
  const demoUrl = buildAbsoluteUrl(`/projects/${project.slug}/demo`, siteUrl);

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.title,
    description: project.summary,
    url: canonical,
    datePublished: project.publishedAt?.toISOString() ?? project.createdAt.toISOString(),
    dateModified: project.updatedAt.toISOString(),
    creator: {
      "@type": "Organization",
      name: SITE_NAME
    },
    keywords: [project.archetype, project.theme, "AI-generated project"],
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: buildAbsoluteUrl("/", siteUrl)
    },
    workExample: {
      "@type": "WebPage",
      name: `${project.title} Demo`,
      url: demoUrl
    }
  };
}

export function buildSitemapEntries(
  projects: ProjectRecord[],
  siteUrl?: string
): MetadataRoute.Sitemap {
  return [
    {
      url: buildAbsoluteUrl("/", siteUrl),
      changeFrequency: "daily",
      priority: 1,
      lastModified: new Date()
    },
    ...projects.map((project) => ({
      url: buildAbsoluteUrl(`/projects/${project.slug}`, siteUrl),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      lastModified: project.updatedAt
    }))
  ];
}

export function buildRobotsRules(siteUrl?: string): MetadataRoute.Robots {
  const resolvedSiteUrl = getSiteUrl(siteUrl);

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/projects/"],
      disallow: ["/projects/*/demo"]
    },
    sitemap: `${resolvedSiteUrl.replace(/\/$/, "")}/sitemap.xml`,
    host: resolvedSiteUrl
  };
}
