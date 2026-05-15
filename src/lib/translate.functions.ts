import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  texts: z.array(z.string().min(1).max(4000)).min(1).max(80),
  targetLang: z.enum(["fr", "ar"]),
});

// In-memory cache (per server instance). Keyed by `${lang}::${text}`.
const cache = new Map<string, string>();

const SYSTEM_PROMPTS: Record<"fr" | "ar", string> = {
  fr: "You are a professional translator. Translate the given English UI strings to natural, modern Canadian French (français québécois — neutral, friendly, professional, the kind used by service businesses in Gatineau / Ottawa). Avoid stiff Parisian phrasing. Preserve currency symbols ($), numbers, proper nouns, URLs, and punctuation. Keep the same length register (short stays short). Return translations in the SAME ORDER as input. Do not add explanations.",
  ar: "You are a professional translator. Translate the given English UI strings to natural, modern Modern Standard Arabic (فصحى) suitable for a professional housing/rental website. Use Arabic numerals (١٢٣) only when natural — keep Western digits for prices and addresses. Preserve currency symbols ($), proper nouns (city/street names) in Arabic transliteration where natural, and punctuation. Return translations in the SAME ORDER as input. Do not add explanations.",
};

export const translateBatch = createServerFn({ method: "POST" })
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) {
      return { translations: data.texts, error: "AI gateway not configured" };
    }

    const out: string[] = new Array(data.texts.length);
    const toTranslate: { idx: number; text: string }[] = [];
    data.texts.forEach((t, i) => {
      const key = `${data.targetLang}::${t}`;
      const hit = cache.get(key);
      if (hit !== undefined) out[i] = hit;
      else toTranslate.push({ idx: i, text: t });
    });

    if (toTranslate.length === 0) return { translations: out, error: null };

    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-5-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPTS[data.targetLang] },
            {
              role: "user",
              content: `Translate these ${toTranslate.length} string(s). Return them via the tool call in the same order.\n\n${toTranslate.map((t, i) => `[${i}] ${t.text}`).join("\n")}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_translations",
                description: "Return the array of translated strings in the same order as input.",
                parameters: {
                  type: "object",
                  properties: {
                    translations: {
                      type: "array",
                      items: { type: "string" },
                      description: "Translated strings, same order and length as input",
                    },
                  },
                  required: ["translations"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "return_translations" } },
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) return { translations: data.texts, error: "Rate limited, please try again shortly." };
        if (resp.status === 402) return { translations: data.texts, error: "AI credits exhausted." };
        const txt = await resp.text();
        console.error("AI gateway error:", resp.status, txt);
        return { translations: data.texts, error: `Gateway error ${resp.status}` };
      }

      const json = await resp.json();
      const toolCall = json?.choices?.[0]?.message?.tool_calls?.[0];
      const args = toolCall?.function?.arguments ? JSON.parse(toolCall.function.arguments) : null;
      const translated: string[] = Array.isArray(args?.translations) ? args.translations : [];

      toTranslate.forEach((t, i) => {
        const tr = translated[i] ?? t.text;
        out[t.idx] = tr;
        cache.set(`${data.targetLang}::${t.text}`, tr);
      });

      return { translations: out, error: null };
    } catch (e) {
      console.error("translate error:", e);
      return { translations: data.texts, error: e instanceof Error ? e.message : "Unknown error" };
    }
  });
