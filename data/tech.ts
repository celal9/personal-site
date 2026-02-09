export type TechItem = {
  title: string;
  description: string;
  exampleTitle: string;
  exampleCode: string;
};

export const techItems: TechItem[] = [
  {
    title: "Next.js (App Router)",
    description: "Server Components, routing ve production optimizasyonu.",
    exampleTitle: "Redirect örneği",
    exampleCode: `import { redirect } from "next/navigation";

export default function Page() {
  redirect("/tr");
}`,
  },
  {
    title: "React",
    description: "Bileşen tabanlı UI + hooks ile state yönetimi.",
    exampleTitle: "useState mini örnek",
    exampleCode: `const [count, setCount] = useState(0);
return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;`,
  },
  {
    title: "TypeScript",
    description: "Tip güvenliği, daha iyi refactor ve ölçeklenebilirlik.",
    exampleTitle: "Type örneği",
    exampleCode: `type Project = {
  name: string;
  url: string;
  stars: number;
};`,
  },
  {
    title: "next-intl",
    description: "Locale bazlı routing + mesaj dosyalarıyla i18n.",
    exampleTitle: "Server-side çeviri",
    exampleCode: `import { getTranslations } from "next-intl/server";

const t = await getTranslations("home");
console.log(t("projects.title"));`,
  },
  {
    title: "Tailwind CSS",
    description: "Hızlı ve tutarlı UI; responsive tasarım sınıfları.",
    exampleTitle: "Responsive grid",
    exampleCode: `<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {/* cards */}
</div>`,
  },
];


