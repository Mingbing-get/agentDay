import { describe, expect, it } from "vitest";

import { buildDemoViewModel } from "@/lib/generation/demo";

describe("buildDemoViewModel", () => {
  it.each(["landing", "tool", "dashboard"] as const)(
    "builds a renderable model for %s archetypes",
    (archetype) => {
      const model = buildDemoViewModel({
        archetype,
        title: "Project Atlas",
        summary: "Structured daily build",
        theme: "editorial-lab"
      });

      expect(model.eyebrow.length).toBeGreaterThan(0);
      expect(model.sections.length).toBeGreaterThan(1);
      expect(model.accent).toMatch(/^#/);
    }
  );
});
