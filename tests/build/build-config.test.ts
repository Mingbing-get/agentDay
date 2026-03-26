import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("build configuration", () => {
  it("uses webpack for production builds to avoid Turbopack panics in Docker", async () => {
    const packageJson = JSON.parse(await readFile("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.build).toBe("next build --webpack");
  });
});
