export type Project = {
  name: string;
  description?: string | null;
  url: string;
  homepage?: string | null;
  language?: string | null;
  topics?: string[];
  stars?: number;
  forks?: number;
  updatedAt?: string;
};

export const staticProjects: Project[] = [
  {
    name: "personal-site",
    description: "Bu portföy sitesi (Next.js + next-intl + Tailwind).",
    url: "https://github.com/YOUR_GITHUB_USERNAME/personal-site",
    homepage: null,
    language: "TypeScript",
    topics: ["nextjs", "portfolio", "i18n"],
  },
  {
    name: "example-project",
    description: "GitHub kullanıcı adını ayarlayınca burası otomatik dolar.",
    url: "https://github.com/YOUR_GITHUB_USERNAME/example-project",
    homepage: null,
    language: "TypeScript",
    topics: ["demo"],
  }
];


