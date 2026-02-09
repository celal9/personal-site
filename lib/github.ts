import type { Project } from "@/data/projects.static";

type GitHubRepo = {
  name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  fork: boolean;
  archived: boolean;
  private: boolean;
};

export async function fetchGitHubProjects(
  username: string,
  limit = 12
): Promise<Project[]> {
  if (!username || username === "YOUR_GITHUB_USERNAME") return [];

  const res = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
    {
      headers: {
        Accept: "application/vnd.github+json",
      },
      // Cache for a bit to avoid rate-limit issues
      next: { revalidate: 60 * 30 },
    }
  );

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const repos = (await res.json()) as GitHubRepo[];

  return repos
    .filter((r) => !r.private && !r.fork && !r.archived)
    .slice(0, limit)
    .map((r) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      homepage: r.homepage,
      language: r.language,
      topics: r.topics ?? [],
      stars: r.stargazers_count,
      forks: r.forks_count,
      updatedAt: r.updated_at,
    }));
}


