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
    name: "Ceng-477-hw3-OpenGL-with-Programmable-Shaders-Bunny-Run",
    description: "C++ ve GLSL ile geliştirilen Bunny Run simülasyonu.",
    url: "https://github.com/celal9/Ceng-477-hw3-OpenGL-with-Programmable-Shaders-Bunny-Run",
    homepage: null,
    language: "C++",
    topics: ["opengl", "glsl", "graphics"],
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


