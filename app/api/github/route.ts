import { NextResponse } from "next/server";
import { site } from "@/data/site";
import { fetchGitHubProjects } from "@/lib/github";
import { staticProjects } from "@/data/projects.static";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.max(1, Math.min(24, Number(limitParam))) : 8;

  const username =
    process.env.GITHUB_USERNAME ??
    process.env.NEXT_PUBLIC_GITHUB_USERNAME ??
    site.githubUsername;

  try {
    const projects = await fetchGitHubProjects(username, limit);
    if (projects.length === 0) {
      return NextResponse.json(
        { source: "static", projects: staticProjects.slice(0, limit) },
        { status: 200 }
      );
    }
    return NextResponse.json({ source: "github", projects }, { status: 200 });
  } catch {
    return NextResponse.json(
      { source: "static", projects: staticProjects.slice(0, limit) },
      { status: 200 }
    );
  }
}


