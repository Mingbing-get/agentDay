import { describe, expect, it } from "vitest";

import { isMissingTableError } from "@/lib/projects/prisma-repository";

describe("isMissingTableError", () => {
  it("treats Prisma P2021 errors as missing table errors", () => {
    const error = {
      code: "P2021",
      message:
        "Invalid `prisma.project.findMany()` invocation: The table `main.Project` does not exist in the current database."
    };

    expect(isMissingTableError(error)).toBe(true);
  });

  it("still recognizes sqlite no such table messages", () => {
    const error = new Error("SQLITE_ERROR: no such table: Project");

    expect(isMissingTableError(error)).toBe(true);
  });

  it("does not swallow unrelated errors", () => {
    const error = new Error("connection refused");

    expect(isMissingTableError(error)).toBe(false);
  });
});
