import { NotebookPen } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/useLocalStorage";

/** A single running scratchpad — type anything, it saves automatically. */
export function ScratchpadCard() {
  const [notes, setNotes, hydrated] = useLocalStorage<string>("morning.notes.v1", "");

  return (
    <section className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col">
      <h2 className="font-display text-xl text-ink flex items-center gap-2 mb-4">
        <NotebookPen className="w-5 h-5 text-brand" /> Scratchpad
      </h2>
      <Textarea
        value={hydrated ? notes : ""}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Jot anything here — it saves as you type."
        className="min-h-[180px] flex-1 resize-y"
        aria-label="Scratchpad notes"
      />
      <p className="text-xs text-ink/40 mt-2">Saved automatically in this browser.</p>
    </section>
  );
}
