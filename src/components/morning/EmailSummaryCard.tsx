import { Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Phase 1 placeholder. Phase 2 swaps the internals for a real Gmail OAuth
 * connect flow + Claude-generated summary (see plan / README).
 */
export function EmailSummaryCard() {
  return (
    <section className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-sm">
      <h2 className="font-display text-xl text-ink flex items-center gap-2 mb-3">
        <Mail className="w-5 h-5 text-brand" /> Email summary
      </h2>
      <div className="rounded-2xl bg-cream-deep/60 border border-dashed border-border/70 p-5 text-center">
        <Sparkles className="w-8 h-8 mx-auto mb-2 text-brand/60" />
        <p className="text-sm text-ink/70 mb-1 font-medium">Gmail isn't connected yet</p>
        <p className="text-xs text-ink/50 mb-4 max-w-sm mx-auto">
          Once connected, each morning this will read your recent email and show an AI summary of
          what's important and new.
        </p>
        <Button variant="outline" disabled>
          Connect Gmail (coming soon)
        </Button>
      </div>
    </section>
  );
}
