"use client";

import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

export type TodoPriority = "urgent" | "high" | "normal" | "low" | "priority" | "not priority";

export type TodoTask = {
  id: string;
  title: string;
  done: boolean;
  priority?: TodoPriority;
  due?: string;
  tag?: string;
  note?: string;
  date: string; // ISO date "YYYY-MM-DD"
  source?: "card" | "list" | "calendar" | "user";
};

export type ActivityEvent = {
  id: string;
  timestamp: number;
  type: "create" | "edit" | "delete" | "toggle" | "reorder";
  label: string;
  chips?: Array<{
    label: string;
    icon?: "code" | "file" | "calendar" | "check" | "tag" | "react";
  }>;
};

export type TodoContextValue = {
  tasks: TodoTask[];
  selectedDate: string; // "YYYY-MM-DD"
  todayStr: string;
  setSelectedDate: (date: string) => void;
  toggleTask: (id: string) => void;
  addTask: (title: string, date?: string, priority?: TodoPriority, due?: string, note?: string) => void;
  editTask: (id: string, newTitle: string) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (sourceId: string, targetId: string) => void;
  markedDates: Set<string>;
  tasksByDate: Record<string, TodoTask[]>;
  isPastDate: (dateStr: string) => boolean;
  activityEvents: ActivityEvent[];
  addActivityEvent: (event: Omit<ActivityEvent, "id" | "timestamp">) => void;
};

const TodoContext = createContext<TodoContextValue | null>(null);

export function useTodoContext() {
  return useContext(TodoContext);
}

/** Formats date to YYYY-MM-DD */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isPastDate(dateStr: string, todayIso: string = toIsoDate(new Date())): boolean {
  return dateStr < todayIso;
}

/** Extracts date string from task text, due string, or headline */
export function parseDateFromText(text?: string, referenceDate: Date = new Date()): string {
  if (!text) return toIsoDate(referenceDate);
  const lower = text.toLowerCase();
  const y = referenceDate.getFullYear();
  const m = referenceDate.getMonth();
  const d = referenceDate.getDate();

  // Explicit ISO date
  const isoMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch) return isoMatch[1];

  if (lower.includes("tomorrow")) {
    const next = new Date(y, m, d + 1);
    return toIsoDate(next);
  }
  if (lower.includes("yesterday")) {
    const prev = new Date(y, m, d - 1);
    return toIsoDate(prev);
  }

  // Month + day name e.g. "Oct 24", "October 30", "Nov 2"
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  for (let mi = 0; mi < 12; mi++) {
    const reg = new RegExp(`\\b${months[mi]}[a-z]*\\s+(\\d{1,2})\\b`, "i");
    const match = text.match(reg);
    if (match) {
      const dayNum = parseInt(match[1], 10);
      const target = new Date(y, mi, dayNum);
      return toIsoDate(target);
    }
  }

  // Days of week
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  for (let i = 0; i < 7; i++) {
    if (lower.includes(days[i])) {
      const currentDay = referenceDate.getDay();
      let diff = i - currentDay;
      if (diff <= 0) diff += 7;
      const target = new Date(y, m, d + diff);
      return toIsoDate(target);
    }
  }

  // Fallback to today
  return toIsoDate(referenceDate);
}

export function TodoProvider({
  children,
  initialTasks = [],
  defaultDate,
}: {
  children: React.ReactNode;
  initialTasks?: TodoTask[];
  defaultDate?: string;
}) {
  const [tasks, setTasks] = useState<TodoTask[]>(initialTasks);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const todayStr = useMemo(() => toIsoDate(new Date()), []);
  const initialDate = defaultDate && defaultDate >= todayStr ? defaultDate : todayStr;
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);

  const addActivityEvent = useCallback((event: Omit<ActivityEvent, "id" | "timestamp">) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    setActivityEvents((prev) => [newEvent, ...prev.slice(0, 19)]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      if (target) {
        addActivityEvent({
          type: "toggle",
          label: !target.done ? "Completed task" : "Reopened task",
          chips: [
            { label: target.title, icon: "check" },
            { label: !target.done ? "Done" : "Active", icon: "tag" },
          ],
        });
      }
      return prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    });
  }, [addActivityEvent]);

  const addTask = useCallback(
    (title: string, date?: string, priority: TodoPriority = "not priority", due?: string, note?: string) => {
      let taskDate = date || selectedDate || todayStr;
      // Do not allow adding tasks to dates that have gone by: clamp to today or future
      if (taskDate < todayStr) {
        taskDate = todayStr;
      }
      const newTask: TodoTask = {
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        done: false,
        priority,
        date: taskDate,
        due: due || (taskDate === todayStr ? "Today" : undefined),
        note,
        source: "user",
      };
      setTasks((prev) => [...prev, newTask]);
      addActivityEvent({
        type: "create",
        label: "Created task",
        chips: [
          { label: title, icon: "file" },
          { label: taskDate === todayStr ? "Today" : taskDate, icon: "calendar" },
        ],
      });
    },
    [selectedDate, todayStr, addActivityEvent]
  );

  const editTask = useCallback((id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      if (target && target.title !== trimmed) {
        addActivityEvent({
          type: "edit",
          label: "Updated task",
          chips: [{ label: trimmed, icon: "file" }],
        });
      }
      return prev.map((t) => (t.id === id ? { ...t, title: trimmed } : t));
    });
  }, [addActivityEvent]);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      if (target) {
        addActivityEvent({
          type: "delete",
          label: "Removed task",
          chips: [{ label: target.title, icon: "file" }],
        });
      }
      return prev.filter((t) => t.id !== id);
    });
  }, [addActivityEvent]);

  const reorderTasks = useCallback((sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setTasks((prev) => {
      const sourceIdx = prev.findIndex((t) => t.id === sourceId);
      const targetIdx = prev.findIndex((t) => t.id === targetId);
      if (sourceIdx === -1 || targetIdx === -1) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(sourceIdx, 1);
      updated.splice(targetIdx, 0, moved);

      // If dragged to the top position, it becomes featured on calendar
      if (targetIdx === 0) {
        addActivityEvent({
          type: "reorder",
          label: "Prioritized to top",
          chips: [
            { label: moved.title, icon: "tag" },
            { label: "Featured on calendar", icon: "calendar" },
          ],
        });
      } else {
        addActivityEvent({
          type: "reorder",
          label: "Reordered priority",
          chips: [{ label: moved.title, icon: "tag" }],
        });
      }

      return updated;
    });
  }, [addActivityEvent]);

  const markedDates = useMemo(() => {
    const set = new Set<string>();
    for (const t of tasks) {
      if (t.date) set.add(t.date);
    }
    return set;
  }, [tasks]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, TodoTask[]> = {};
    for (const t of tasks) {
      const d = t.date || todayStr;
      if (!map[d]) map[d] = [];
      map[d].push(t);
    }
    return map;
  }, [tasks, todayStr]);

  const isPast = useCallback((dateStr: string) => dateStr < todayStr, [todayStr]);

  const value = useMemo(
    () => ({
      tasks,
      selectedDate,
      todayStr,
      setSelectedDate,
      toggleTask,
      addTask,
      editTask,
      deleteTask,
      reorderTasks,
      markedDates,
      tasksByDate,
      isPastDate: isPast,
      activityEvents,
      addActivityEvent,
    }),
    [
      tasks,
      selectedDate,
      todayStr,
      setSelectedDate,
      toggleTask,
      addTask,
      editTask,
      deleteTask,
      reorderTasks,
      markedDates,
      tasksByDate,
      isPast,
      activityEvents,
      addActivityEvent,
    ]
  );

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}
