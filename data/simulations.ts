export type Simulation = {
  id: string;
  title: string;
  description: string;
  videoSrc: string;
  posterSrc?: string;
  playable?: {
    scriptSrc: string;
    canvasId: string;
    width?: number;
    height?: number;
  };
  repoName?: string;
  repoUrl?: string;
  tags?: string[];
};

export const simulations: Simulation[] = [
  {
    id: "bunny-run",
    title: "Bunny Run (OpenGL)",
    description:
      "C++ ve GLSL ile geliştirilen kısa bir koşu simülasyonu. WebGL portu ve video önizlemesi.",
    videoSrc: "/simulations/bunny-run.mp4",
    posterSrc: "/simulations/bunny-run.jpg",
    playable: {
      scriptSrc: "/simulations/bunny-run/bunny-run.js",
      canvasId: "bunny-run-canvas",
      width: 520,
      height: 320,
    },
    repoName: "Ceng-477-hw3-OpenGL-with-Programmable-Shaders-Bunny-Run",
    tags: ["C++", "OpenGL", "Shaders"],
  },
];

