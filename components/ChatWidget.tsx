"use client";

import { useMemo, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
};

type ChatResponse = {
  reply: string;
  sources: string[];
  error?: string;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isLoading,
    [input, isLoading],
  );

  const handleSend = async () => {
    if (!canSend) return;
    const content = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { role: "user", content }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content }],
        }),
      });
      const json = (await res.json()) as ChatResponse;

      if (!res.ok || json.error) {
        throw new Error(json.error ?? "Chat error.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: json.reply, sources: json.sources },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: message, sources: [] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-9999 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-micro font-semibold text-zinc-700 shadow-lg shadow-black/10 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-zinc-200"
      >
        {isOpen ? "Close chat" : "Chat"}
      </button>

      {isOpen ? (
        <div className="fixed bottom-20 right-6 z-9999 w-[90vw] max-w-md overflow-hidden rounded-2xl border border-black/10 bg-white/90 shadow-xl shadow-black/10 backdrop-blur dark:border-white/10 dark:bg-white/10">
          <div className="border-b border-black/10 px-4 py-3 text-body font-semibold text-zinc-900 dark:border-white/10 dark:text-white">
            Ask about my portfolio
          </div>
          <div className="max-h-[60vh] space-y-4 overflow-y-auto px-4 py-4 text-body text-zinc-700 dark:text-zinc-200">
            {messages.length === 0 ? (
              <div className="text-micro text-zinc-500 dark:text-zinc-300">
                Ask about projects, tech stack, or experience.
              </div>
            ) : null}
            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className={`rounded-xl border px-3 py-2 ${
                  msg.role === "user"
                    ? "border-blue-500/30 bg-blue-500/10 text-zinc-900 dark:text-white"
                    : "border-black/10 bg-white/70 text-zinc-800 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.role === "assistant" && msg.sources?.length ? (
                  <div className="mt-2 text-micro text-zinc-500 dark:text-zinc-300">
                    Sources: {msg.sources.join(", ")}
                  </div>
                ) : null}
              </div>
            ))}
            {isLoading ? (
              <div className="text-micro text-zinc-500 dark:text-zinc-300">
                Thinking...
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2 border-t border-black/10 px-4 py-3 dark:border-white/10">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your question..."
              className="text-body h-10 flex-1 rounded-lg border border-black/10 bg-white/70 px-3 outline-none backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-white"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className="text-micro rounded-lg bg-zinc-900 px-4 py-2 font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-white/90"
            >
              Send
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
