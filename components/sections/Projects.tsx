import { Section } from "@/components/layout/Section";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { site } from "@/data/site";
import { staticProjects, type Project } from "@/data/projects.static";
import { simulations } from "@/data/simulations";
import { fetchGitHubProjects } from "@/lib/github";

async function getProjects(): Promise<{ source: "github" | "static"; projects: Project[] }> {
  try {
    const projects = await fetchGitHubProjects(site.githubUsername, 12);
    if (projects.length === 0) return { source: "static", projects: staticProjects };
    return { source: "github", projects };
  } catch {
    return { source: "static", projects: staticProjects };
  }
}

export async function Projects({
  title,
  subtitle,
  simulationsTitle,
  simulationsSubtitle,
  simulationsHint,
  simulationsPlayLabel,
  simulationsCodeLabel,
  simulationsBaseHref,
}: Readonly<{
  title: string;
  subtitle: string;
  simulationsTitle: string;
  simulationsSubtitle: string;
  simulationsHint: string;
  simulationsPlayLabel: string;
  simulationsCodeLabel: string;
  simulationsBaseHref: string;
}>) {
  const { source, projects } = await getProjects();
  const simulationCards = simulations.map((simulation) => {
    const projectMatch =
      simulation.repoName
        ? projects.find((project) => project.name === simulation.repoName)
        : undefined;
    return { simulation, projectMatch };
  });

  return (
    <Section
      id="projects"
      title={title}
      subtitle={
        <span>
          {subtitle} <span className="opacity-70">(source: {source})</span>
        </span>
      }
    >
      <div id="simulations" className="rounded-3xl border border-black/10 bg-white/40 p-6 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="mb-4">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {simulationsTitle}
          </div>
          <p className="mt-2 max-w-2xl text-sm text-zinc-700 dark:text-zinc-200">
            {simulationsSubtitle}
          </p>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-300">
            {simulationsHint}
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {simulationCards.map(({ simulation, projectMatch }) => {
            const playableUrl = `${simulationsBaseHref}/${simulation.id}`;
            const title = projectMatch?.name ?? simulation.title;
            const description = projectMatch?.description ?? simulation.description;
            return (
              <div
                key={simulation.id}
                className="group rounded-2xl border border-black/10 bg-white/60 p-5 shadow-sm shadow-black/5 backdrop-blur transition hover:-translate-y-0.5 hover:border-black/20 hover:shadow-md hover:shadow-black/10 dark:border-white/10 dark:bg-white/5 dark:shadow-black/40 dark:hover:border-white/20"
              >
                <div className="mb-4 overflow-hidden rounded-xl border border-black/5 bg-linear-to-br from-black/60 via-black/40 to-black/70 p-3 dark:border-white/10">
                  <div className="flex items-center justify-between text-xs text-white/80">
                    <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/90">
                      Simulation
                    </span>
                    {projectMatch?.language ? (
                      <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/90">
                        {projectMatch.language}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                      {title.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white">
                        {title}
                      </div>
                      <div className="text-[11px] text-white/70">
                        Playable Simulation
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <a
                      href={playableUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-base font-semibold tracking-tight text-zinc-900 group-hover:underline dark:text-white"
                    >
                      {title}
                    </a>
                    {description ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                        {description}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        No description
                      </p>
                    )}
                  </div>
                  {projectMatch?.language ? (
                    <span className="shrink-0 rounded-full border border-black/10 bg-white/60 px-2 py-1 text-xs text-zinc-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
                      {projectMatch.language}
                    </span>
                  ) : null}
                </div>

                {simulation.tags && simulation.tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-600 dark:text-zinc-300">
                    {simulation.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-black/10 bg-white/70 px-2 py-0.5 backdrop-blur dark:border-white/10 dark:bg-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 flex items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-3">
                    {typeof projectMatch?.stars === "number" ? (
                      <span>★ {projectMatch.stars}</span>
                    ) : null}
                    {typeof projectMatch?.forks === "number" ? (
                      <span>⑂ {projectMatch.forks}</span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={playableUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-zinc-700 transition hover:text-zinc-900 hover:underline dark:text-zinc-200 dark:hover:text-white"
                    >
                      {simulationsPlayLabel}
                    </a>
                    {projectMatch?.url ? (
                      <a
                        href={projectMatch.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-zinc-700 transition hover:text-zinc-900 hover:underline dark:text-zinc-200 dark:hover:text-white"
                      >
                        {simulationsCodeLabel}
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.url} project={p} />
        ))}
      </div>
    </Section>
  );
}


