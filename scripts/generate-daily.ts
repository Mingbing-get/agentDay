import { ensureDatabaseSchema } from "@/lib/db";
import { PrismaProjectRepository } from "@/lib/projects/prisma-repository";
import { generateDailyProject } from "@/lib/generation/service";

function getFlagValue(flag: string) {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function main() {
  await ensureDatabaseSchema();

  const date = getFlagValue("--date") ?? formatDate(new Date());
  const topic = getFlagValue("--topic") ?? undefined;
  const force = hasFlag("--force");
  const result = await generateDailyProject({
    date,
    topic,
    force,
    generatedRoot: process.cwd(),
    repository: new PrismaProjectRepository()
  });

  console.log(
    JSON.stringify(
      {
        status: "ok",
        slug: result.project.slug,
        route: `/projects/${result.project.slug}`,
        demoRoute: `/projects/${result.project.slug}/demo`,
        projectDir: result.projectDir
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
