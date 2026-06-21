import { useEffect, useState } from "react";
import { greetingFor, prettyDate } from "@/lib/morning.types";

/** Greeting + today's date. Updates on mount so the greeting matches local time. */
export function GreetingHeader() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const greeting = now ? greetingFor(now) : "Hello";
  const date = now ? prettyDate(now) : "";

  return (
    <header className="mb-8 md:mb-10">
      <h1 className="font-display text-3xl md:text-5xl text-ink leading-tight">
        {greeting} <span className="text-brand">☀️</span>
      </h1>
      <p className="text-sm md:text-base text-ink/70 mt-3">
        {date || "Welcome to your morning dashboard"}
      </p>
    </header>
  );
}
