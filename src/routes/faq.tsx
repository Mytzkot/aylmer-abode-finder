import { createFileRoute } from "@tanstack/react-router";
import { Bot, Send } from "lucide-react";
import { useState } from "react";
import { FAQ_KB } from "@/data/properties";
import { T, useTranslated } from "@/i18n/LanguageProvider";

export const Route = createFileRoute("/faq")({ component: FaqPage });

interface Msg { role: "user" | "bot"; text: string }

const FALLBACK = "I can answer questions about Wi-Fi, furnishings, utilities, credit checks, pets, and bus access. For anything else, please WhatsApp +1 343-202-5460.";

function answer(q: string): string {
  const lower = q.toLowerCase();
  const hit = FAQ_KB.find((f) => f.keywords.some((k) => lower.includes(k)));
  if (hit) return hit.a;
  return FALLBACK;
}

function Bubble({ text, isUser }: { text: string; isUser: boolean }) {
  const translated = useTranslated(text);
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser ? "bg-ink text-cream" : "bg-cream text-ink"
        }`}
      >
        {translated}
      </div>
    </div>
  );
}

function FaqPage() {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Hi! 👋 Ask me about Wi-Fi, furnishings, utilities, credit, pets, or bus access." },
  ]);
  const placeholder = useTranslated("Type your question...");
  const sendLabel = useTranslated("Send");

  const send = (q?: string) => {
    const text = (q ?? input).trim();
    if (!text) return;
    setMsgs((m) => [...m, { role: "user", text }, { role: "bot", text: answer(text) }]);
    setInput("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-12 md:py-16">
        <h1 className="font-display text-4xl md:text-5xl text-ink flex items-center gap-3">
          <Bot className="w-9 h-9 accent-text" /> <T>FAQ</T>
        </h1>
        <p className="text-ink/60 mt-2 mb-8"><T>Ask anything about our furnished rooms.</T></p>

        <div className="bg-card rounded-3xl border border-border/60 shadow-sm flex flex-col h-[28rem] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {msgs.map((m, i) => (
              <Bubble key={i} text={m.text} isUser={m.role === "user"} />
            ))}
          </div>
          <div className="p-3 border-t border-border/60 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={placeholder}
              className="flex-1 px-4 py-2.5 rounded-full bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-cyan-pop"
            />
            <button
              onClick={() => send()}
              className="touch-min w-11 h-11 rounded-full bg-coral text-white flex items-center justify-center hover:opacity-90"
              aria-label={sendLabel}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {FAQ_KB.map((f) => (
            <button
              key={f.q}
              onClick={() => send(f.q)}
              className="text-xs px-3 py-1.5 rounded-full bg-card border border-border/60 hover:border-cyan-pop text-ink font-semibold transition"
            >
              <T>{f.q}</T>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
