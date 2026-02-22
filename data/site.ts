export const site = {
  name: "Celal Kekeç",
  role: "Frontend Developer",
  location: "TR",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "celal8265@gmail.com",
  githubUsername: process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? "celal9",
  socials: {
    github: process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/celal9",
    linkedin:
      process.env.NEXT_PUBLIC_LINKEDIN_URL ??
      "https://www.linkedin.com/in/celal-kekec-63205a213/",
  },
} as const;
