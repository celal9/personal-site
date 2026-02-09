import type { Project } from "@/data/projects.static";

export function ProjectCard({ project }: Readonly<{ project: Project }>) {
  return (
    <div className="group rounded-2xl border border-black/10 bg-white/60 p-5 shadow-sm shadow-black/5 backdrop-blur transition hover:-translate-y-0.5 hover:border-black/20 hover:shadow-md hover:shadow-black/10 dark:border-white/10 dark:bg-white/5 dark:shadow-black/40 dark:hover:border-white/20">
      <div className="mb-4 overflow-hidden rounded-xl border border-black/5 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 dark:border-white/10 dark:from-blue-950/40 dark:via-slate-900/30 dark:to-indigo-950/40">
        <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
          <span className="rounded-full border border-black/10 bg-white/70 px-2 py-0.5 text-[11px] font-medium text-zinc-700 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-zinc-200">
            Featured
          </span>
          {project.language ? (
            <span className="rounded-full border border-black/10 bg-white/70 px-2 py-0.5 text-[11px] font-medium text-zinc-700 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-zinc-200">
              {project.language}
            </span>
          ) : null}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-sm font-semibold text-indigo-700 shadow-sm dark:bg-white/10 dark:text-indigo-200">
            {project.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
              {project.name}
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
              GitHub Project
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="block truncate text-base font-semibold tracking-tight text-zinc-900 group-hover:underline dark:text-white"
          >
            {project.name}
          </a>
          {project.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
              {project.description}
            </p>
          ) : (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              No description
            </p>
          )}
        </div>
        {project.language ? (
          <span className="shrink-0 rounded-full border border-black/10 bg-white/60 px-2 py-1 text-xs text-zinc-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
            {project.language}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          {typeof project.stars === "number" ? <span>★ {project.stars}</span> : null}
          {typeof project.forks === "number" ? <span>⑂ {project.forks}</span> : null}
        </div>
        <div className="flex items-center gap-3">
          {project.homepage ? (
            <a
              href={project.homepage}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-zinc-700 transition hover:text-zinc-900 hover:underline dark:text-zinc-200 dark:hover:text-white"
            >
              Live
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
    </div>
  );
}


