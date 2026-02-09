export const site = {
  name: "Celal Kekeç",
  role: "Frontend Developer",
  location: "TR",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "you@example.com",
  githubUsername: process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? "YOUR_GITHUB_USERNAME",
  socials: {
    github:
      process.env.NEXT_PUBLIC_GITHUB_URL ??
      "https://github.com/YOUR_GITHUB_USERNAME",
    linkedin:
      process.env.NEXT_PUBLIC_LINKEDIN_URL ??
      "https://www.linkedin.com/in/YOUR_LINKEDIN/",
  },
} as const;


