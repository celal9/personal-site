import { Section } from "@/components/layout/Section";
import { portfolioProjects, otherProjects } from "@/data/portfolioProjects";

export async function Projects({
  title,
  subtitle,
  simulationsTitle,
  simulationsSubtitle,
  simulationsHint,
  simulationsPlayLabel,
  simulationsCodeLabel,
  otherTitle,
  otherSubtitle,
}: Readonly<{
  title: string;
  subtitle: string;
  simulationsTitle: string;
  simulationsSubtitle: string;
  simulationsHint: string;
  simulationsPlayLabel: string;
  simulationsCodeLabel: string;
  otherTitle: string;
  otherSubtitle: string;
}>) {
  const featuredProjects = portfolioProjects.filter(
    (project) => project.category === "featured",
  );
  const interactiveProjects = portfolioProjects.filter(
    (project) => project.category === "interactive",
  );

  return (
    <Section id="projects" title={title} subtitle={subtitle}>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featuredProjects.map((project) => (
          <div
            key={project.url}
            className="group rounded-2xl border border-black/10 bg-white/60 p-5 shadow-sm shadow-black/5 backdrop-blur transition hover:-translate-y-0.5 hover:border-black/20 hover:shadow-md hover:shadow-black/10 dark:border-white/10 dark:bg-white/5 dark:shadow-black/40 dark:hover:border-white/20"
          >
            <div className="mb-4 flex items-center justify-between text-micro text-zinc-500 dark:text-zinc-300">
              <span className="rounded-full border border-black/10 bg-white/70 px-2 py-0.5 font-medium text-zinc-700 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-zinc-200">
                Featured
              </span>
              {project.language ? (
                <span className="rounded-full border border-black/10 bg-white/70 px-2 py-0.5 font-medium text-zinc-700 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-zinc-200">
                  {project.language}
                </span>
              ) : null}
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-body block truncate font-semibold tracking-tight text-zinc-900 group-hover:underline dark:text-white"
                >
                  {project.name}
                </a>
                <p className="text-body mt-2 line-clamp-3 text-zinc-700 dark:text-zinc-200">
                  {project.description}
                </p>
              </div>
            </div>
            {project.tech.length > 0 ? (
              <div className="text-micro mt-3 flex flex-wrap gap-2 text-zinc-600 dark:text-zinc-300">
                {project.tech.map((tech) => (
                  <span
                    key={`${project.name}-${tech}`}
                    className="rounded-full border border-black/10 bg-white/70 px-2 py-0.5 backdrop-blur dark:border-white/10 dark:bg-white/10"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="text-micro mt-4 flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
              {project.demo ? (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-zinc-700 transition hover:text-zinc-900 hover:underline dark:text-zinc-200 dark:hover:text-white"
                >
                  Demo
                </a>
              ) : null}
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-zinc-700 transition hover:text-zinc-900 hover:underline dark:text-zinc-200 dark:hover:text-white"
              >
                Code
              </a>
            </div>
          </div>
        ))}
      </div>

      <div id="simulations" className="mt-10">
        <div className="mb-4 space-y-2">
          <div className="text-label text-zinc-500 dark:text-zinc-400">
            {simulationsTitle}
          </div>
          <p className="text-body mt-2 max-w-2xl text-zinc-700 dark:text-zinc-200">
            {simulationsSubtitle}
          </p>
          <p className="text-micro mt-2 text-zinc-500 dark:text-zinc-300">
            {simulationsHint}
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {interactiveProjects.map((project) => (
            <div
              key={project.url}
              className="group rounded-2xl border border-black/10 bg-white/60 p-5 shadow-sm shadow-black/5 backdrop-blur transition hover:-translate-y-0.5 hover:border-black/20 hover:shadow-md hover:shadow-black/10 dark:border-white/10 dark:bg-white/5 dark:shadow-black/40 dark:hover:border-white/20"
            >
              <div className="mb-4 overflow-hidden rounded-xl border border-black/5 bg-linear-to-br from-black/60 via-black/40 to-black/70 p-3 dark:border-white/10">
                <div className="text-micro flex items-center justify-between text-white/80">
                  <span className="text-micro rounded-full border border-white/20 bg-white/10 px-2 py-0.5 font-medium text-white/90">
                    Interactive
                  </span>
                  {project.language ? (
                    <span className="text-micro rounded-full border border-white/20 bg-white/10 px-2 py-0.5 font-medium text-white/90">
                      {project.language}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="text-body flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-semibold text-white">
                    {project.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-body truncate font-semibold text-white">
                      {project.name}
                    </div>
                    <div className="text-micro text-white/70">
                      Playable Demo
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <a
                    href={project.demo ?? project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-body block truncate font-semibold tracking-tight text-zinc-900 group-hover:underline dark:text-white"
                  >
                    {project.name}
                  </a>
                  <p className="text-body mt-2 line-clamp-3 text-zinc-700 dark:text-zinc-200">
                    {project.description}
                  </p>
                </div>
              </div>

              {project.tech.length > 0 ? (
                <div className="text-micro mt-3 flex flex-wrap gap-2 text-zinc-600 dark:text-zinc-300">
                  {project.tech.map((tech) => (
                    <span
                      key={`${project.name}-${tech}`}
                      className="rounded-full border border-black/10 bg-white/70 px-2 py-0.5 backdrop-blur dark:border-white/10 dark:bg-white/10"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="text-micro mt-4 flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
                {project.demo ? (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-zinc-700 transition hover:text-zinc-900 hover:underline dark:text-zinc-200 dark:hover:text-white"
                  >
                    {simulationsPlayLabel}
                  </a>
                ) : null}
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-zinc-700 transition hover:text-zinc-900 hover:underline dark:text-zinc-200 dark:hover:text-white"
                >
                  {simulationsCodeLabel}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-3 text-label text-zinc-500 dark:text-zinc-400">
          {otherTitle}
        </div>
        <p className="text-body max-w-2xl text-zinc-700 dark:text-zinc-200">
          {otherSubtitle}
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {otherProjects.map((project) => (
            <a
              key={project.url}
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="text-body rounded-xl border border-black/10 bg-white/60 px-4 py-3 text-zinc-700 backdrop-blur transition hover:-translate-y-0.5 hover:border-black/20 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:border-white/20 dark:hover:bg-white/10"
            >
              <div className="font-medium text-zinc-900 dark:text-white">
                {project.name}
              </div>
              <div className="text-micro mt-1 text-zinc-500 dark:text-zinc-300">
                {project.description}
              </div>
            </a>
          ))}
        </div>
      </div>
    </Section>
  );
}
