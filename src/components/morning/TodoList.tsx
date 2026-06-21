import { useMemo, useState } from "react";
import { CheckCircle2, ListTodo, Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { type TodoItem, todayStr, visibleTodos } from "@/lib/morning.types";

export function TodoList() {
  const [items, setItems, hydrated] = useLocalStorage<TodoItem[]>("morning.todos.v1", []);
  const [text, setText] = useState("");

  const today = todayStr();
  const visible = useMemo(() => visibleTodos(items, today), [items, today]);
  const doneCount = visible.filter((t) => t.done).length;
  const pct = visible.length ? Math.round((doneCount / visible.length) * 100) : 0;

  const add = () => {
    const value = text.trim();
    if (!value) return;
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: value, done: false, createdDate: today },
    ]);
    setText("");
  };

  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, done: !t.done, doneDate: !t.done ? today : undefined } : t,
      ),
    );

  const remove = (id: string) => setItems((prev) => prev.filter((t) => t.id !== id));

  return (
    <section className="bg-card border border-border/60 rounded-3xl p-5 md:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-display text-xl text-ink flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-brand" /> Today's to-do
        </h2>
        {visible.length > 0 && (
          <Badge variant="secondary" className="shrink-0">
            {doneCount} / {visible.length} done
          </Badge>
        )}
      </div>

      {visible.length > 0 && <Progress value={pct} className="mb-4" />}

      <div className="flex gap-2 mb-4">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a task and press Enter…"
          aria-label="New task"
        />
        <Button onClick={add} className="shrink-0" aria-label="Add task">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {!hydrated ? (
        <p className="text-sm text-ink/50 py-6 text-center">Loading your list…</p>
      ) : visible.length === 0 ? (
        <div className="text-center py-8 text-ink/60">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-ink/30" />
          <p className="text-sm">Nothing on the list. Add your first task above.</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {visible.map((t) => (
            <li
              key={t.id}
              className="group flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-cream-deep/60 transition"
            >
              <Checkbox
                checked={t.done}
                onCheckedChange={() => toggle(t.id)}
                aria-label={t.done ? "Mark not done" : "Mark done"}
              />
              <span
                className={"flex-1 text-sm " + (t.done ? "line-through text-ink/40" : "text-ink")}
              >
                {t.text}
              </span>
              <button
                onClick={() => remove(t.id)}
                aria-label="Delete task"
                className="opacity-0 group-hover:opacity-100 transition text-ink/40 hover:text-coral"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
