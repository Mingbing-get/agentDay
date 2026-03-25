import type { MetadataRoute } from "next";

import { buildRobotsRules } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return buildRobotsRules();
}
