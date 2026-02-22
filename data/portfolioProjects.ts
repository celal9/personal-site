export type PortfolioProject = {
  name: string;
  description: string;
  url: string;
  demo: string | null;
  language: string | null;
  tech: string[];
  category: "featured" | "interactive";
};

export const portfolioProjects: PortfolioProject[] = [
  {
    name: "personal-site",
    description:
      "Multi-language portfolio with responsive UI, reusable sections, and performance-friendly background effects.",
    url: "https://github.com/celal9/personal-site",
    demo: "https://personal-site-jv04.onrender.com/en",
    language: "TypeScript",
    tech: ["React", "Next.js", "TypeScript", "Tailwind", "i18n"],
    category: "featured",
  },
  {
    name: "simple-todo-app-main",
    description:
      "Clean task workflow with interactive UI states and a straightforward product-style layout.",
    url: "https://github.com/celal9/simple-todo-app-main",
    demo: "https://simple-todo-app-main.vercel.app",
    language: "JavaScript",
    tech: ["JavaScript", "UI", "UX"],
    category: "featured",
  },
  {
    name: "Ceng-477-hw3-OpenGL-with-Programmable-Shaders-Bunny-Run",
    description:
      "Playable visual demo focused on real-time rendering and interaction (Bunny Run).",
    url: "https://github.com/celal9/Ceng-477-hw3-OpenGL-with-Programmable-Shaders-Bunny-Run",
    demo: "/simulations/bunny-run",
    language: "C",
    tech: ["OpenGL", "GLSL", "Rendering"],
    category: "interactive",
  },
  {
    name: "CENG477_Group18_hw2",
    description:
      "Software rasterizer showcasing graphics pipeline concepts and visual output.",
    url: "https://github.com/celal9/CENG477_Group18_hw2",
    demo: null,
    language: "C++",
    tech: ["Graphics", "Rendering"],
    category: "interactive",
  },
];

export const otherProjects = [
  {
    name: "Artificial-Intelligence",
    description: "A* and IDA* search implementations.",
    url: "https://github.com/celal9/Artificial-Intelligence",
  },
  {
    name: "Artificial-Intelligence-v2",
    description: "First-order logic and theorem proving exercises.",
    url: "https://github.com/celal9/Artificial-Intelligence-v2",
  },
  {
    name: "c-plus-plus",
    description: "C++ practice notes and snippets.",
    url: "https://github.com/celal9/c-plus-plus",
  },
  {
    name: "CENG477-Group18",
    description: "Graphics coursework and experiments.",
    url: "https://github.com/celal9/CENG477-Group18",
  },
  {
    name: "GRAPH_HW_3",
    description: "Computer graphics assignment work.",
    url: "https://github.com/celal9/GRAPH_HW_3",
  },
  {
    name: "Java-Concurrency",
    description: "Concurrency patterns and threading examples in Java.",
    url: "https://github.com/celal9/Java-Concurrency",
  },
  {
    name: "Java-OOP",
    description: "Object-oriented programming fundamentals in Java.",
    url: "https://github.com/celal9/Java-OOP",
  },
  {
    name: "Java-streams",
    description: "Streams and file operations practice.",
    url: "https://github.com/celal9/Java-streams",
  },
  {
    name: "musicAPPPersonal",
    description: "Personal music app experiments.",
    url: "https://github.com/celal9/musicAPPPersonal",
  },
  {
    name: "nlq",
    description: "Natural language query experiments.",
    url: "https://github.com/celal9/nlq",
  },
  {
    name: "PICOS18",
    description: "Small real-time OS study project.",
    url: "https://github.com/celal9/PICOS18",
  },
  {
    name: "Picsimlab",
    description: "PIC18F4620 simulation and ADC exercises.",
    url: "https://github.com/celal9/Picsimlab",
  },
  {
    name: "Postgresql-v1",
    description: "E-commerce dataset queries and schema work.",
    url: "https://github.com/celal9/Postgresql-v1",
  },
  {
    name: "Postgresql-v2",
    description: "E-commerce application queries and scripts.",
    url: "https://github.com/celal9/Postgresql-v2",
  },
  {
    name: "VERILOG",
    description: "Queue management system in Verilog.",
    url: "https://github.com/celal9/VERILOG",
  },
  {
    name: "VERILOG-V2",
    description: "Polynomial memory and accumulator design.",
    url: "https://github.com/celal9/VERILOG-V2",
  },
];
