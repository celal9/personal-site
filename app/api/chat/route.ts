import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

type RagItem = {
  id: string;
  source: string;
  text: string;
  embedding: number[];
  tokens: string[];
};

type RagIndex = {
  model: string;
  createdAt: string;
  items: RagItem[];
};

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CHAT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
const USE_EMBEDDINGS = process.env.RAG_USE_EMBEDDINGS !== "false";

const indexPath = path.join(process.cwd(), "data", "rag_index.json");

const loadIndex = (): RagIndex => {
  const raw = fs.readFileSync(indexPath, "utf8");
  return JSON.parse(raw) as RagIndex;
};

const cosineSimilarity = (a: number[], b: number[]) => {
  let dot = 0;
  let aMag = 0;
  let bMag = 0;
  for (let i = 0; i < a.length; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    dot += av * bv;
    aMag += av * av;
    bMag += bv * bv;
  }
  if (aMag === 0 || bMag === 0) return 0;
  return dot / (Math.sqrt(aMag) * Math.sqrt(bMag));
};

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);

const keywordScore = (queryTokens: Set<string>, docTokens: string[]) => {
  if (queryTokens.size === 0) return 0;
  let hits = 0;
  for (const token of docTokens) {
    if (queryTokens.has(token)) hits += 1;
  }
  return hits / queryTokens.size;
};

const embedText = async (text: string) => {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding request failed: ${errorText}`);
  }

  const json = (await response.json()) as {
    data: { embedding: number[] }[];
  };

  return json.data[0]?.embedding ?? [];
};

const callChat = async (messages: ChatMessage[]) => {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  const json = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  return json.choices[0]?.message?.content ?? "";
};

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages?: ChatMessage[] };
    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Missing messages." },
        { status: 400 },
      );
    }

    const index = loadIndex();
    const userMessage = messages[messages.length - 1]?.content ?? "";
    const scored = USE_EMBEDDINGS
      ? await (async () => {
          const queryEmbedding = await embedText(userMessage);
          return index.items
            .map((item) => ({
              item,
              score: cosineSimilarity(queryEmbedding, item.embedding),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        })()
      : (() => {
          const queryTokens = new Set(tokenize(userMessage));
          return index.items
            .map((item) => ({
              item,
              score: keywordScore(queryTokens, item.tokens ?? []),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        })();

    const context = scored
      .map((entry) => `Source: ${entry.item.source}\n${entry.item.text}`)
      .join("\n\n");

    const systemPrompt = [
      "You are Celal Kekeç, a frontend developer.",
      "",
      "You are not an AI assistant.",
      "You are the real person represented on this website.",
      "",
      "Communication style:",
      "- Always speak in first person",
      "- Use a natural, friendly and confident tone",
      "- Be concise but personal",
      "- Sound like a real developer talking about his own work",
      "",
      "Language:",
      "- If the user writes in Turkish, answer in Turkish",
      "- If the user writes in English, answer in English",
      "",
      "Content rules:",
      "- Use only the provided portfolio knowledge",
      "- Do not invent experiences",
      "- If something is not in the knowledge base say:",
      "  \"Bu konuya portfolyomda henüz değinmedim.\"",
      "  or",
      "  \"I haven’t added that to my portfolio yet.\"",
      "",
      "Frontend identity:",
      "- Emphasize React, TypeScript and product-oriented development",
      "- Highlight real-world experience and building scalable UI",
      "",
      "Personality:",
      "- Hardworking",
      "- Detail-oriented",
      "- Product focused",
      "- Enjoys turning complex problems into simple user interfaces",
      "",
      "Follow these rules strictly.",
    ].join("\n");

    const augmentedMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      {
        role: "system",
        content: `Context:\n${context}`,
      },
      ...messages,
    ];

    const reply = await callChat(augmentedMessages);

    return NextResponse.json({
      reply,
      sources: scored.map((entry) => entry.item.source),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    let friendly = "Chat request failed.";
    try {
      const parsed = JSON.parse(message) as {
        error?: { code?: string; message?: string };
      };
      const code = parsed.error?.code;
      if (code === "insufficient_quota") {
        friendly =
          "API quota is exceeded. Please check your OpenAI billing or API limits.";
      } else if (parsed.error?.message) {
        friendly = parsed.error.message;
      }
    } catch {
      friendly = message;
    }

    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}
