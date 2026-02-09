import { Mail, ExternalLink } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { site } from "@/data/site";

export function Contact({
  title,
  subtitle,
}: Readonly<{ title: string; subtitle: string }>) {
  return (
    <Section id="contact" title={title} subtitle={subtitle}>
      <div className="grid gap-4 lg:grid-cols-3">
        <a
          href={`mailto:${site.email}`}
          className="rounded-2xl border border-black/10 bg-white/60 p-5 backdrop-blur transition hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <Mail className="h-4 w-4" /> Email
          </div>
          <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
            {site.email}
          </div>
        </a>

        <a
          href={site.socials.github}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-black/10 bg-white/60 p-5 backdrop-blur transition hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            GitHub <ExternalLink className="h-4 w-4" />
          </div>
          <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
            {site.socials.github.replace("https://", "")}
          </div>
        </a>

        <a
          href={site.socials.linkedin}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-black/10 bg-white/60 p-5 backdrop-blur transition hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            LinkedIn <ExternalLink className="h-4 w-4" />
          </div>
          <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
            {site.socials.linkedin.replace("https://", "")}
          </div>
        </a>
      </div>
    </Section>
  );
}


