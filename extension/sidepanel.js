// Morning Dashboard side panel — plain JS, stores everything in chrome.storage.local.

const KEY_NOTES = "morning.notes.v1";
const KEY_TODOS = "morning.todos.v1";

// ---- helpers ---------------------------------------------------------------

function todayStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function greetingFor(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function prettyDate(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function get(key, fallback) {
  return new Promise((resolve) =>
    chrome.storage.local.get(key, (r) => resolve(r[key] === undefined ? fallback : r[key])),
  );
}

function set(key, value) {
  return new Promise((resolve) => chrome.storage.local.set({ [key]: value }, resolve));
}

// ---- greeting --------------------------------------------------------------

document.getElementById("greeting").textContent = `${greetingFor()} ☀️`;
document.getElementById("date").textContent = prettyDate();

// ---- tabs ------------------------------------------------------------------

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add("active");
  });
});

// ---- notes -----------------------------------------------------------------

(async () => {
  const notes = document.getElementById("notes");
  notes.value = await get(KEY_NOTES, "");
  let timer;
  notes.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => set(KEY_NOTES, notes.value), 250);
  });
})();

// ---- to-do -----------------------------------------------------------------

const listEl = document.getElementById("todo-list");
const emptyEl = document.getElementById("todo-empty");
const inputEl = document.getElementById("todo-input");
const fillEl = document.getElementById("progress-fill");
const progressLabel = document.getElementById("progress-label");

let todos = [];

function visibleTodos() {
  const today = todayStr();
  return todos.filter((t) => !t.done || t.doneDate === today);
}

async function saveTodos() {
  await set(KEY_TODOS, todos);
}

function render() {
  const visible = visibleTodos();
  listEl.innerHTML = "";
  emptyEl.style.display = visible.length ? "none" : "block";

  const doneCount = visible.filter((t) => t.done).length;
  const pct = visible.length ? Math.round((doneCount / visible.length) * 100) : 0;
  fillEl.style.width = `${pct}%`;
  progressLabel.textContent = visible.length ? `${doneCount} / ${visible.length} done` : "";

  for (const t of visible) {
    const li = document.createElement("li");

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = t.done;
    cb.addEventListener("change", () => {
      t.done = cb.checked;
      t.doneDate = cb.checked ? todayStr() : undefined;
      saveTodos();
      render();
    });

    const span = document.createElement("span");
    span.className = "text" + (t.done ? " done" : "");
    span.textContent = t.text;

    const del = document.createElement("button");
    del.className = "del";
    del.textContent = "🗑";
    del.title = "Delete";
    del.addEventListener("click", () => {
      todos = todos.filter((x) => x.id !== t.id);
      saveTodos();
      render();
    });

    li.append(cb, span, del);
    listEl.appendChild(li);
  }
}

function addTodo() {
  const text = inputEl.value.trim();
  if (!text) return;
  todos.push({
    id: crypto.randomUUID(),
    text,
    done: false,
    createdDate: todayStr(),
  });
  inputEl.value = "";
  saveTodos();
  render();
}

document.getElementById("todo-add").addEventListener("click", addTodo);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo();
});

(async () => {
  todos = await get(KEY_TODOS, []);
  render();
})();
