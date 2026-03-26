import { describe, expect, it } from "vitest";

import { getDefaultProjectDate } from "@/lib/time";

describe("getDefaultProjectDate", () => {
  it("uses the configured timezone instead of UTC when computing today's project date", () => {
    const result = getDefaultProjectDate(
      new Date("2026-03-25T16:30:00.000Z"),
      "Asia/Shanghai"
    );

    expect(result).toBe("2026-03-26");
  });

  it("still returns the UTC date when the timezone is UTC", () => {
    const result = getDefaultProjectDate(new Date("2026-03-25T16:30:00.000Z"), "UTC");

    expect(result).toBe("2026-03-25");
  });
});
