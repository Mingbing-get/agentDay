import type { MetadataRoute } from "next";

import { PrismaProjectRepository } from "@/lib/projects/prisma-repository";
import { buildSitemapEntries } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await new PrismaProjectRepository().listPublishedProjects();
  return buildSitemapEntries(projects);
}
