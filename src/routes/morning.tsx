import { createFileRoute } from "@tanstack/react-router";
import { GreetingHeader } from "@/components/morning/GreetingHeader";
import { TodoList } from "@/components/morning/TodoList";
import { ScratchpadCard } from "@/components/morning/ScratchpadCard";
import { EmailSummaryCard } from "@/components/morning/EmailSummaryCard";

export const Route = createFileRoute("/morning")({
  component: MorningPage,
  head: () => ({
    meta: [{ title: "Morning Dashboard" }, { name: "robots", content: "noindex, nofollow" }],
    links: [{ rel: "canonical", href: "/morning" }],
  }),
});

function MorningPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8 md:py-12">
        <GreetingHeader />
        <div className="grid gap-6 md:grid-cols-2">
          <TodoList />
          <ScratchpadCard />
          <div className="md:col-span-2">
            <EmailSummaryCard />
          </div>
        </div>
      </main>
    </div>
  );
}
