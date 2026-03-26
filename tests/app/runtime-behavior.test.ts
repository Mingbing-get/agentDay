import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("runtime rendering behavior", () => {
  it("marks the homepage as force-dynamic so new projects appear after generation", async () => {
    const source = await readFile("src/app/page.tsx", "utf8");

    expect(source).toContain('export const dynamic = "force-dynamic"');
  });

  it("marks sitemap generation as force-dynamic so newly published dossiers are discoverable", async () => {
    const source = await readFile("src/app/sitemap.ts", "utf8");

    expect(source).toContain('export const dynamic = "force-dynamic"');
  });
});
