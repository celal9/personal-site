import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

type RagChunk = {
  id: string;
  source: string;
  text: string;
  embedding: number[];
  tokens: string[];
};

type RagIndex = {
  model: string;
  createdAt: string;
  items: RagChunk[];
};

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
const USE_EMBEDDINGS = process.env.RAG_USE_EMBEDDINGS !== "false";

const knowledgeDir = path.join(process.cwd(), "data", "knowledge");
const outputPath = path.join(process.cwd(), "data", "rag_index.json");

const chunkText = (text: string, maxChars = 800): string[] => {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let buffer = "";

  for (const para of paragraphs) {
    if (!buffer) {
      buffer = para;
      continue;
    }

    if (buffer.length + para.length + 2 <= maxChars) {
      buffer = `${buffer}\n\n${para}`;
      continue;
    }

    chunks.push(buffer);
    buffer = para;
  }

  if (buffer) chunks.push(buffer);
  return chunks;
};

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);

const embedTexts = async (texts: string[]) => {
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
      input: texts,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Embedding request failed: ${errorText}`);
  }

  const json = (await response.json()) as {
    data: { embedding: number[] }[];
  };

  return json.data.map((item) => item.embedding);
};

const buildIndex = async () => {
  const files = fs
    .readdirSync(knowledgeDir)
    .filter((file) => file.endsWith(".md"));

  if (files.length === 0) {
    throw new Error("No markdown files found in data/knowledge.");
  }

  const items: RagChunk[] = [];

  for (const file of files) {
    const filePath = path.join(knowledgeDir, file);
    const source = `knowledge/${file}`;
    const content = fs.readFileSync(filePath, "utf8");
    const chunks = chunkText(content);

    const embeddings = USE_EMBEDDINGS ? await embedTexts(chunks) : [];
    chunks.forEach((chunk, idx) => {
      items.push({
        id: `${file}-${idx}`,
        source,
        text: chunk,
        embedding: embeddings[idx] ?? [],
        tokens: tokenize(chunk),
      });
    });
  }

  const index: RagIndex = {
    model: EMBEDDING_MODEL,
    createdAt: new Date().toISOString(),
    items,
  };

  fs.writeFileSync(outputPath, JSON.stringify(index, null, 2), "utf8");
  console.log(`RAG index written: ${outputPath}`);
};

buildIndex().catch((err) => {
  console.error(err);
  process.exit(1);
});
