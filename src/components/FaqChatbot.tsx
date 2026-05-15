import { Bot, X, Send } from "lucide-react";
import { useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import { FAQ_KB } from "@/data/properties";

interface Msg { role: "user" | "bot"; text: string }

function answer(q: string): string {
  const lower = q.toLowerCase();
  const hit = FAQ_KB.find(f => f.keywords.some(k => lower.includes(k)));
  if (hit) return hit.a;
  return "I can answer questions about Wi-Fi, furnishings, utilities, credit checks, pets, and bus access. For anything else, please WhatsApp +1 343-987-4565.";
}

export function FaqChatbot() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Hi! 👋 Ask me about Wi-Fi, furnishings, utilities, credit, pets, or bus access." },
  ]);

  const send = () => {
    const q = input.trim();
    if (!q) return;
    setMsgs(m => [...m, { role: "user", text: q }, { role: "bot", text: answer(q) }]);
    setInput("");
  };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-24 end-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center active:scale-95 transition"
          aria-label="Open chat">
          <Bot className="w-7 h-7" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-24 end-4 z-40 w-[92vw] max-w-sm h-[28rem] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-border bg-primary text-primary-foreground">
            <div className="flex items-center gap-2 font-semibold"><Bot className="w-5 h-5" /> {t.faq.title}</div>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/20" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {FAQ_KB.slice(0, 4).map(f => (
                <button key={f.q} onClick={() => { setInput(f.q); setTimeout(send, 0); }}
                  className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground transition">
                  {f.q}
                </button>
              ))}
            </div>
          </div>
          <div className="p-2 border-t border-border flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder={t.faq.placeholder}
              className="flex-1 px-3 py-2 rounded-full bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <button onClick={send} className="touch-min w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center" aria-label="Send">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
