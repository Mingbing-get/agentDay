import type { ProjectArchetype } from "@/lib/projects/types";

export type DemoViewModel = {
  archetype: ProjectArchetype;
  eyebrow: string;
  accent: string;
  headline: string;
  summary: string;
  sections: Array<{
    title: string;
    value: string;
    detail: string;
  }>;
};

const presets: Record<ProjectArchetype, Omit<DemoViewModel, "headline" | "summary">> = {
  landing: {
    archetype: "landing",
    eyebrow: "Launch narrative",
    accent: "#b4492d",
    sections: [
      {
        title: "Hook",
        value: "03 sec",
        detail: "Hero copy built to explain the idea immediately."
      },
      {
        title: "Trust",
        value: "4 proof blocks",
        detail: "Highlights traction, social proof, and operational confidence."
      },
      {
        title: "Conversion",
        value: "Single CTA",
        detail: "Every section funnels back to one conversion action."
      }
    ]
  },
  tool: {
    archetype: "tool",
    eyebrow: "Operator workspace",
    accent: "#116466",
    sections: [
      {
        title: "Workflow",
        value: "3 steps",
        detail: "Users enter data, review AI output, and export the result."
      },
      {
        title: "Output",
        value: "Structured",
        detail: "Results come back as concise blocks instead of opaque text blobs."
      },
      {
        title: "Safety",
        value: "Guardrails",
        detail: "The interface keeps prompts, assumptions, and outcomes legible."
      }
    ]
  },
  dashboard: {
    archetype: "dashboard",
    eyebrow: "Signal board",
    accent: "#274690",
    sections: [
      {
        title: "Pulse",
        value: "Live panels",
        detail: "A monitoring layout built around fast scanning and anomaly detection."
      },
      {
        title: "Insights",
        value: "Ranked views",
        detail: "Priority queues pull the most actionable items to the top."
      },
      {
        title: "Actions",
        value: "Embedded",
        detail: "Operators can respond from the same surface instead of context-switching."
      }
    ]
  }
};

export function buildDemoViewModel(input: {
  archetype: ProjectArchetype;
  title: string;
  summary: string;
  theme: string;
}): DemoViewModel {
  const preset = presets[input.archetype];

  return {
    ...preset,
    headline: input.title,
    summary: input.summary
  };
}
