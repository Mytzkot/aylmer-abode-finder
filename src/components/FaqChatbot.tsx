import { Bot, X, Send, Phone, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useLang, T, useTranslated } from "@/i18n/LanguageProvider";
import { FAQ_KB, CONTACT } from "@/data/properties";

interface Msg { role: "user" | "bot"; text: string; fallback?: boolean }

const FALLBACK = "I'm not sure about that one — please contact us directly:";

function getAnswer(q: string): { text: string; fallback?: boolean } {
  const lower = q.toLowerCase();
  const hit = FAQ_KB.find((f) => f.keywords.some((k) => lower.includes(k)));
  if (hit) return { text: hit.a };
  return { text: FALLBACK, fallback: true };
}

function Bubble({ msg, isUser }: { msg: Msg; isUser: boolean }) {
  const translated = useTranslated(msg.text);
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          isUser ? "bg-coral text-white" : "bg-cream text-ink"
        }`}
      >
        {translated}
        {msg.fallback && (
          <div className="mt-2 flex flex-col gap-1.5">
            <a
              href={CONTACT.tel}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink text-cream text-xs font-semibold hover:opacity-90"
            >
              <Phone className="w-3.5 h-3.5" /> 1-343-202-5460
            </a>
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:opacity-90"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export function FaqChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "bot",
      text: "Hi! 👋 Ask me anything about our furnished monthly rooms — Wi-Fi, furniture, pricing, pets, transit, applying…",
    },
  ]);

  const openLabel = useTranslated("Open chat");
  const closeLabel = useTranslated("Close");
  const sendLabel = useTranslated("Send");
  const title = useTranslated("Ask Zorba");
  const placeholder = useTranslated("Type your question…");

  const send = (qOverride?: string) => {
    const q = (qOverride ?? input).trim();
    if (!q) return;
    const a = getAnswer(q);
    setMsgs((m) => [
      ...m,
      { role: "user", text: q },
      { role: "bot", text: a.text, fallback: a.fallback },
    ]);
    setInput("");
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-[60] w-[54px] h-[54px] rounded-full bg-coral text-white shadow-2xl flex items-center justify-center active:scale-95 hover:scale-105 transition ring-2 ring-white/40"
          aria-label={openLabel}
        >
          <Bot className="w-6 h-6" />
        </button>
      )}
      {open && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[60] w-[92vw] max-w-sm h-[28rem] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-border bg-ink text-cream">
            <div className="flex items-center gap-2 font-semibold">
              <Bot className="w-5 h-5 text-coral" /> {title}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded hover:bg-white/15"
              aria-label={closeLabel}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-card">
            {msgs.map((m, i) => (
              <Bubble key={i} msg={m} isUser={m.role === "user"} />
            ))}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {FAQ_KB.slice(0, 5).map((f) => (
                <button
                  key={f.q}
                  onClick={() => send(f.q)}
                  className="text-xs px-2.5 py-1 rounded-full bg-cream border border-border text-ink hover:bg-coral hover:text-white hover:border-coral transition"
                >
                  <T>{f.q}</T>
                </button>
              ))}
            </div>
          </div>
          <div className="p-2 border-t border-border flex gap-2 bg-card">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 rounded-full bg-cream text-sm text-ink focus:outline-none focus:ring-2 focus:ring-coral"
            />
            <button
              onClick={() => send()}
              className="w-11 h-11 rounded-full bg-coral text-white flex items-center justify-center hover:opacity-90"
              aria-label={sendLabel}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
