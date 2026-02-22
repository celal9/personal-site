import { Container } from "@/components/layout/Container";
import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-black/5 py-10 dark:border-white/10">
      <Container className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="text-body text-zinc-600 dark:text-zinc-300">
          © {new Date().getFullYear()} {site.name}
        </div>
        <div className="text-body flex items-center gap-3">
          <a
            href={site.socials.github}
            target="_blank"
            rel="noreferrer"
            className="text-zinc-700 hover:text-black dark:text-zinc-200 dark:hover:text-white"
          >
            GitHub
          </a>
          <a
            href={site.socials.linkedin}
            target="_blank"
            rel="noreferrer"
            className="text-zinc-700 hover:text-black dark:text-zinc-200 dark:hover:text-white"
          >
            LinkedIn
          </a>
        </div>
      </Container>
    </footer>
  );
}


