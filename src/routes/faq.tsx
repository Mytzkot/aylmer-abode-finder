import { createFileRoute } from "@tanstack/react-router";
import { Bot, Send } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContactBar } from "@/components/FloatingContactBar";
import { FAQ_KB } from "@/data/properties";

export const Route = createFileRoute("/faq")({ component: FaqPage });

interface Msg { role: "user" | "bot"; text: string }

function answer(q: string): string {
  const lower = q.toLowerCase();
  const hit = FAQ_KB.find((f) => f.keywords.some((k) => lower.includes(k)));
  if (hit) return hit.a;
  return "I can answer questions about Wi-Fi, furnishings, utilities, credit checks, pets, and bus access. For anything else, please WhatsApp +1 343-987-4565.";
}

function FaqPage() {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Hi! 👋 Ask me about Wi-Fi, furnishings, utilities, credit, pets, or bus access." },
  ]);

  const send = (q?: string) => {
    const text = (q ?? input).trim();
    if (!text) return;
    setMsgs((m) => [...m, { role: "user", text }, { role: "bot", text: answer(text) }]);
    setInput("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-12 md:py-16">
        <h1 className="font-display text-4xl md:text-5xl text-ink flex items-center gap-3">
          <Bot className="w-9 h-9 accent-text" /> FAQ
        </h1>
        <p className="text-ink/60 mt-2 mb-8">Ask anything about our furnished rooms.</p>

        <div className="bg-card rounded-3xl border border-border/60 shadow-sm flex flex-col h-[28rem] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user" ? "bg-ink text-cream" : "bg-cream text-ink"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-border/60 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type your question..."
              className="flex-1 px-4 py-2.5 rounded-full bg-cream text-sm focus:outline-none focus:ring-2 focus:ring-cyan-pop"
            />
            <button
              onClick={() => send()}
              className="touch-min w-11 h-11 rounded-full bg-coral text-white flex items-center justify-center hover:opacity-90"
              aria-label="Send"
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
              {f.q}
            </button>
          ))}
        </div>
      </main>
      <Footer />
      <FloatingContactBar />
    </div>
  );
}
