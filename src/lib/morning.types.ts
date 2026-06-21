/** Shared types and helpers for the Morning Dashboard (web page + Chrome extension). */

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  /** Local day the item was created, "YYYY-MM-DD". */
  createdDate: string;
  /** Local day the item was checked off, "YYYY-MM-DD". Undefined while not done. */
  doneDate?: string;
}

/** Local calendar day as "YYYY-MM-DD" (NOT UTC — avoids day-rollover bugs). */
export function todayStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function greetingFor(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** Long, friendly date like "Sunday, June 21, 2026". */
export function prettyDate(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/**
 * The list shown "today": every unfinished item (carries over across days)
 * plus anything finished today (so checking off doesn't make it vanish).
 */
export function visibleTodos(items: TodoItem[], today: string = todayStr()): TodoItem[] {
  return items.filter((t) => !t.done || t.doneDate === today);
}
