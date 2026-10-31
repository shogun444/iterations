"use client";

import React, { Fragment, useState, useEffect, useMemo, useRef } from "react";
import type { ComponentRenderProps } from "@openuidev/lang-core";
import { useTriggerAction } from "@openuidev/react-lang";
import { DrawablyCircle, DrawablyHighlight, DrawablyUnderline } from "../drawably/react.js";
import { roughCircle, roughEllipse } from "../drawably/index.js";
import { buildTodoLibrary } from "./todo-schema";
import {
  TodoProvider,
  useTodoContext,
  toIsoDate,
  parseDateFromText,
  type TodoTask,
  type TodoPriority,
} from "./todo-context";
import "../drawably/style.css";
import "../app/todo.css";

const list = (nodes: unknown) => (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);

export function Marked({
  text,
  stroke = "#52525b",
  fill = "rgba(254, 240, 138, 0.45)",
}: {
  text?: string;
  stroke?: string;
  fill?: string;
}) {
  if (!text) return null;
  return (
    <>
      {text.split(/(_[^_]+_|==[^=]+==|\(\([^)]+\)\))/).map((part, i) => {
        if (/^_[^_]+_$/.test(part)) {
          return (
            <DrawablyUnderline key={i} stroke={stroke} width={3}>
              {part.slice(1, -1)}
            </DrawablyUnderline>
          );
        }
        if (/^==.+==$/.test(part)) {
          return (
            <DrawablyHighlight key={i} fill={fill}>
              {part.slice(2, -2)}
            </DrawablyHighlight>
          );
        }
        if (/^\(\(.+\)\)$/.test(part)) {
          return (
            <DrawablyCircle key={i} stroke={stroke} width={3}>
              {part.slice(2, -2)}
            </DrawablyCircle>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

function HeadlineHairpinUnderline({
  primaryText,
  trailingText,
  color,
}: {
  primaryText: string;
  trailingText?: string;
  color?: string;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const primaryRef = useRef<HTMLSpanElement>(null);
  const [metrics, setMetrics] = useState({
    containerW: 0,
    containerH: 0,
    primaryW: 0,
    primaryH: 0,
  });

  useEffect(() => {
    const update = () => {
      if (containerRef.current && primaryRef.current) {
        const cRect = containerRef.current.getBoundingClientRect();
        const pRect = primaryRef.current.getBoundingClientRect();
        if (cRect.width > 0 && pRect.width > 0) {
          setMetrics({
            containerW: Math.round(cRect.width),
            containerH: Math.round(cRect.height),
            primaryW: Math.round(pRect.width),
            primaryH: Math.round(pRect.height),
          });
        }
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    if (primaryRef.current) ro.observe(primaryRef.current);
    return () => ro.disconnect();
  }, [primaryText, trailingText]);

  const primaryW = metrics.primaryW || (metrics.containerW ? metrics.containerW * 0.8 : 0);
  const textH = metrics.primaryH || metrics.containerH;

  // Hand-drawn folded hairpin underline matching user's reference:
  // 1. Left edge aligns with the first letter (xApex = 0).
  // 2. Length terminates right past the primary text (e.g. right past 'PPL', leaving 'Split' un-underlined).
  // 3. Fluid hand-drawn calligraphic inflection with natural sag on bottom line and gentle wave on top line.
  const pathD = useMemo(() => {
    if (primaryW <= 0 || textH <= 0) return "";
    const xRightTop = primaryW + 4;
    const xRightBottom = Math.max(primaryW - 28, primaryW * 0.86);

    const yTop = textH + 3.2;
    const gap = 5.6;
    const yBottom = yTop + gap;
    const yMid = (yTop + yBottom) / 2;

    const sag = Math.min(3.4, Math.max(2.2, primaryW * 0.009));
    const lift = Math.min(2.0, Math.max(1.2, primaryW * 0.005));

    return [
      `M ${xRightBottom.toFixed(1)},${(yBottom - 0.6).toFixed(1)}`,
      `C ${(primaryW * 0.74).toFixed(1)},${(yBottom + sag * 0.6).toFixed(1)} ${(primaryW * 0.52).toFixed(1)},${(yBottom + sag).toFixed(1)} ${(primaryW * 0.36).toFixed(1)},${(yBottom + sag * 0.9).toFixed(1)}`,
      `C ${(primaryW * 0.18).toFixed(1)},${(yBottom + sag * 0.5).toFixed(1)} 14.0,${(yBottom + 0.8).toFixed(1)} 5.0,${(yBottom - 0.4).toFixed(1)}`,
      `C -1.2,${(yMid + 2.0).toFixed(1)} -1.2,${(yMid - 2.0).toFixed(1)} 5.5,${(yTop + 0.4).toFixed(1)}`,
      `C 16.0,${(yTop - lift * 0.4).toFixed(1)} ${(primaryW * 0.25).toFixed(1)},${(yTop - lift).toFixed(1)} ${(primaryW * 0.48).toFixed(1)},${(yTop - lift).toFixed(1)}`,
      `C ${(primaryW * 0.72).toFixed(1)},${(yTop - lift * 0.5).toFixed(1)} ${(primaryW * 0.92).toFixed(1)},${(yTop + 0.2).toFixed(1)} ${xRightTop.toFixed(1)},${(yTop + 0.3).toFixed(1)}`,
    ].join(" ");
  }, [primaryW, textH]);

  const wrapStyle = color
    ? ({ color, "--todo-headline-color": color } as React.CSSProperties)
    : undefined;

  return (
    <span
      ref={containerRef}
      className="todo-headline-underline-wrap"
      style={wrapStyle}
      data-colored={color ? "true" : undefined}
    >
      <span className="todo-headline-text">
        <span ref={primaryRef} className="todo-headline-primary">
          {primaryText}
        </span>
        {trailingText ? (
          <>
            {" "}
            <span className="todo-headline-trailing">{trailingText}</span>
          </>
        ) : null}
      </span>
      {metrics.containerW > 0 && (
        <svg
          className="todo-headline-underline-svg"
          aria-hidden="true"
          data-colored={color ? "true" : undefined}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: metrics.containerW,
            height: textH + 20,
            overflow: "visible",
            pointerEvents: "none",
            zIndex: 0,
            color: "inherit",
          }}
        >
          <path
            d={pathD}
            stroke="currentColor"
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

function DailyHeadlineView({
  props,
}: ComponentRenderProps<{ text?: string; color?: string }>) {
  if (!props?.text) return null;
  const rawText = props.text;
  const isMarkedYellow = /^==.+==$/.test(rawText.trim()) || /==/.test(rawText);

  // Remove leading date/day name e.g. "Thursday, Oct 24 — " or "Tuesday, Oct 29 — "
  let cleanedText = rawText.replace(
    /^(?:[A-Za-z]+,\s+)?[A-Za-z]+\s+\d+(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?\s*[-—–:]\s*/i,
    ""
  );

  // Automatically condense overly long/verbose headlines down to crisp, punchy titles
  cleanedText = cleanedText
    .replace(/4-Day\s+Hypertrophy\s*(&|and)\s*Recovery\s+Split/i, "4-Day PPL Split")
    .replace(/Hypertrophy\s*(&|and)\s*Recovery\s+Split/i, "PPL Workout Split")
    .replace(/Hypertrophy\s*(&|and)\s*Recovery/i, "PPL Split");

  let primaryText = cleanedText;
  let trailingText = "";

  const explicitMatch = cleanedText.match(/^_([^_]+)_(.*)$/);
  if (explicitMatch) {
    primaryText = explicitMatch[1].trim();
    trailingText = explicitMatch[2].trim();
  } else {
    const stripped = cleanedText.replace(/==([^=]+)==/g, "$1").replace(/_([^_]+)_/g, "$1").trim();
    // Match common suffix category words (Split, Day, Board, Plan, Routine, Session, Deadlines, Checklist, Overview, Blueprint, Schedule, Diet)
    const suffixMatch = stripped.match(
      /^(.*?)\s+(Split|Day|Board|Plan|Routine|Session|Deadlines|Checklist|Overview|Blueprint|Schedule|Diet)$/i
    );
    if (suffixMatch) {
      primaryText = suffixMatch[1].trim();
      trailingText = suffixMatch[2].trim();
    } else {
      primaryText = stripped;
      trailingText = "";
    }
  }

  // Resolve color: if props.color is provided, or if marked with ==...==
  let resolvedColor: string | undefined = undefined;
  if (props.color) {
    resolvedColor =
      props.color === "yellow" || props.color === "gold"
        ? "rgb(254, 240, 138)"
        : props.color;
  } else if (isMarkedYellow) {
    resolvedColor = "rgb(254, 240, 138)";
  }

  const headlineStyle = resolvedColor
    ? ({ color: resolvedColor, "--todo-headline-color": resolvedColor } as React.CSSProperties)
    : undefined;

  return (
    <h1
      className="todo-headline"
      style={headlineStyle}
      data-colored={resolvedColor ? "true" : undefined}
    >
      <HeadlineHairpinUnderline
        primaryText={primaryText}
        trailingText={trailingText}
        color={resolvedColor}
      />
    </h1>
  );
}

function FocusPullView({ props }: ComponentRenderProps<{ text?: string; note?: string }>) {
  if (!props?.text) return null;
  return (
    <div className="todo-focus-pull">
      <p className="todo-focus-text">
        <Marked text={props.text} stroke="#52525b" fill="rgba(254, 240, 138, 0.45)" />
      </p>
    </div>
  );
}

function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority) return null;
  const isPrio = priority === "urgent" || priority === "high" || priority === "priority";
  return (
    <span className={`todo-badge ${isPrio ? "todo-badge--priority" : "todo-badge--not-priority"}`}>
      {isPrio ? "priority" : "not priority"}
    </span>
  );
}

function HeadingView({ props }: ComponentRenderProps<{ text?: string }>) {
  if (!props?.text) return null;
  return <h2 className="todo-heading">{props.text}</h2>;
}

function TaskCardView() {
  return null;
}

function TaskCardsView() {
  return null;
}

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function renderDueLabel(due?: string, taskDate?: string): React.ReactNode {
  const today = new Date();
  const todayIso = toIsoDate(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowIso = toIsoDate(tomorrow);

  const raw = (due || "").trim();
  const lower = raw.toLowerCase();

  // Next day -> "Tomorrow"
  if (lower === "tomorrow" || lower === "tommorow" || taskDate === tomorrowIso) {
    return "Tomorrow";
  }

  // Today -> "Today"
  if (lower === "today" || (taskDate === todayIso && !raw)) {
    return "Today";
  }

  // Extract day number from taskDate or due text
  let dayNum: number | null = null;
  if (taskDate && taskDate !== todayIso) {
    const parts = taskDate.split("-");
    if (parts.length === 3) {
      dayNum = parseInt(parts[2], 10);
    }
  }

  if (dayNum === null && raw) {
    const match = raw.match(/(?:on\s+)?(?:[A-Za-z]+\s+)?(\d{1,2})(?:st|nd|rd|th)?/i);
    if (match) {
      dayNum = parseInt(match[1], 10);
    }
  }

  // Check weekday name e.g. "Friday"
  if (
    dayNum === null &&
    ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].some((d) =>
      lower.includes(d)
    )
  ) {
    const parsed = parseDateFromText(raw, today);
    if (parsed === tomorrowIso) {
      return "Tomorrow";
    }
    const parts = parsed.split("-");
    if (parts.length === 3) {
      dayNum = parseInt(parts[2], 10);
    }
  }

  if (dayNum !== null && !isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
    const suffix = getOrdinalSuffix(dayNum);
    return (
      <span className="todo-due-formatted">
        On {dayNum}
        <sup className="todo-ordinal-sup">{suffix}</sup>
      </span>
    );
  }

  return raw || null;
}

function getBlockTypeName(block: unknown): string | undefined {
  if (!block || typeof block !== "object") return undefined;
  const b = block as Record<string, any>;
  return b.typeName || b.name || b.component?.name || b._name || (b.type === "element" ? b.typeName : b.type);
}

function getBlockProps(block: unknown): Record<string, any> {
  if (!block || typeof block !== "object") return {};
  const b = block as Record<string, any>;
  return b.props || b;
}

function TodoRow({
  task,
  isDone,
  onToggle,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isDragOver,
}: {
  task: {
    id: string;
    title: string;
    done?: boolean;
    priority?: TodoPriority;
    due?: string;
    note?: string;
    date?: string;
  };
  isDone: boolean;
  onToggle: () => void;
  onEdit: (newTitle: string) => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSave = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== task.title) {
      onEdit(trimmed);
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`todo-tasklist-item ${isDone ? "is-done" : ""} ${isDragging ? "is-dragging" : ""} ${
        isDragOver ? "is-drag-over" : ""
      }`}
      draggable={!isEditing}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => {
        if (!isEditing && !menuOpen) onToggle();
      }}
      role="button"
      tabIndex={0}
    >
      <div className="todo-tasklist-left">
        <span
          className="todo-drag-handle"
          title="Drag to reorder (drop at top to feature on calendar)"
          onClick={(e) => e.stopPropagation()}
        >
          ⋮⋮
        </span>
        <div className={`todo-checkbox ${isDone ? "checked" : ""}`} />
        {isEditing ? (
          <input
            type="text"
            className="todo-inline-edit-input"
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              } else if (e.key === "Escape") {
                setEditTitle(task.title);
                setIsEditing(false);
              }
            }}
            onBlur={handleSave}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="todo-tasklist-title-text">{task.title}</span>
        )}
      </div>

      <div className="todo-tasklist-right" onClick={(e) => e.stopPropagation()}>
        {(task.due || task.date) && (
          <span className="todo-card-due">{renderDueLabel(task.due, task.date)}</span>
        )}
        <PriorityBadge priority={task.priority} />
        {task.note && <span className="todo-tasklist-note">{task.note}</span>}

        <div className="todo-menu-wrap">
          <button
            type="button"
            className="todo-menu-btn"
            title="Options"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
          >
            ···
          </button>
          {menuOpen && (
            <div className="todo-menu-dropdown">
              <button
                type="button"
                className="todo-menu-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  setIsEditing(true);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="todo-menu-item todo-menu-item--delete"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete();
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskItemView({
  props,
}: ComponentRenderProps<{
  id?: string;
  title?: string;
  done?: boolean;
  priority?: TodoPriority;
  due?: string;
  note?: string;
}>) {
  const todoCtx = useTodoContext();
  const task =
    todoCtx && props?.id
      ? todoCtx.tasks.find((t) => t.id === props.id) || {
          id: props.id,
          title: props.title || "",
          done: !!props.done,
          priority: props.priority,
          due: props.due,
          note: props.note,
        }
      : {
          id: props?.id || "temp",
          title: props?.title || "",
          done: !!props?.done,
          priority: props?.priority,
          due: props?.due,
          note: props?.note,
        };

  return (
    <TodoRow
      task={task}
      isDone={task.done}
      onToggle={() => {
        if (todoCtx && props?.id) todoCtx.toggleTask(props.id);
      }}
      onEdit={(newTitle) => {
        if (todoCtx && props?.id) todoCtx.editTask(props.id, newTitle);
      }}
      onDelete={() => {
        if (todoCtx && props?.id) todoCtx.deleteTask(props.id);
      }}
      onDragStart={() => {}}
      onDragOver={() => {}}
      onDrop={() => {}}
    />
  );
}

function TaskListView({ props }: ComponentRenderProps<{ title?: string; items?: unknown[] }>) {
  const todoCtx = useTodoContext();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleAdd = () => {
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;

    if (todoCtx) {
      todoCtx.addTask(trimmed, todoCtx.selectedDate, "not priority");
    }
    setNewTaskTitle("");
  };

  const directItems = list(props?.items);

  const tasksToDisplay = useMemo(() => {
    const listMap = new Map<string, TodoTask>();
    // Context tasks first (they reflect user interactions, toggles, edits, reordering)
    if (todoCtx) {
      for (const t of todoCtx.tasks) {
        listMap.set(t.id, t);
      }
    }
    // Also include any direct items that might be streaming in
    for (let idx = 0; idx < directItems.length; idx++) {
      const item = directItems[idx];
      const ip = getBlockProps(item);
      if (ip?.title) {
        const id = ip.id || `item-${idx}`;
        if (!listMap.has(id)) {
          listMap.set(id, {
            id,
            title: ip.title,
            done: !!ip.done,
            priority: ip.priority as TodoPriority,
            due: ip.due,
            note: ip.note,
            date: ip.due ? parseDateFromText(ip.due) : toIsoDate(new Date()),
            source: "list",
          });
        }
      }
    }
    return Array.from(listMap.values());
  }, [todoCtx, todoCtx?.tasks, directItems]);

  return (
    <div className="todo-tasklist">
      <div className="todo-tasklist-header">
        <h3 className="todo-tasklist-title">{props?.title ?? "Quick Wins"}</h3>
      </div>
      <div className="todo-tasklist-items">
        {tasksToDisplay.map((task) => (
          <TodoRow
            key={task.id}
            task={task}
            isDone={task.done}
            onToggle={() => todoCtx?.toggleTask(task.id)}
            onEdit={(newTitle) => todoCtx?.editTask(task.id, newTitle)}
            onDelete={() => todoCtx?.deleteTask(task.id)}
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", task.id);
              e.dataTransfer.effectAllowed = "move";
              setDraggedId(task.id);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (dragOverId !== task.id) setDragOverId(task.id);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const sourceId = e.dataTransfer.getData("text/plain") || draggedId;
              if (sourceId && sourceId !== task.id) {
                todoCtx?.reorderTasks(sourceId, task.id);
              }
              setDraggedId(null);
              setDragOverId(null);
            }}
            isDragging={draggedId === task.id}
            isDragOver={dragOverId === task.id}
          />
        ))}
      </div>

      <div className="todo-tasklist-add">
        <input
          type="text"
          className="todo-tasklist-input"
          placeholder={props?.title ? `Add a task to ${props.title}...` : "Add a new task..."}
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        {newTaskTitle.trim() && (
          <button
            type="button"
            className="todo-tasklist-add-btn"
            onClick={handleAdd}
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CalendarSketchCircle({
  children,
  seed,
  stroke = "#ff2442",
  strokeWidth = 2.4,
}: {
  children: React.ReactNode;
  seed: number;
  stroke?: string;
  strokeWidth?: number;
}) {
  const pathD = useMemo(() => {
    // True circle with uniform radius 14 centered at (18, 18) inside 36x36 viewbox
    // Guarantees rx === ry === 14, ensuring it is always a genuine circular ring and NEVER an oval or pill
    return roughCircle(18, 18, 14, { seed, roughness: 1.15, boil: 0 });
  }, [seed]);

  return (
    <div className="todo-calendar-circle-wrap is-circled">
      <svg
        className="todo-calendar-sketch-svg"
        viewBox="0 0 36 36"
        aria-hidden="true"
      >
        <path
          d={pathD}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </div>
  );
}

function TodoCalendarView({
  props,
}: ComponentRenderProps<{
  title?: string;
  selectedDate?: string;
  markedDates?: string[];
  note?: string;
}>) {
  const todoCtx = useTodoContext();
  const now = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => toIsoDate(now), [now]);

  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [newTaskInput, setNewTaskInput] = useState("");
  const [drawerDraggedId, setDrawerDraggedId] = useState<string | null>(null);
  const [drawerDragOverId, setDrawerDragOverId] = useState<string | null>(null);

  const selectedDate = todoCtx?.selectedDate || props?.selectedDate || todayIso;
  const isSelectedPast = selectedDate < todayIso;

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const jumpToToday = () => {
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    todoCtx?.setSelectedDate(todayIso);
  };

  // Build 42 days grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lead = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0
  const days: { date: Date; iso: string; inMonth: boolean }[] = [];

  for (let i = 0; i < 42; i++) {
    const d = new Date(currentYear, currentMonth, i - lead + 1);
    days.push({
      date: d,
      iso: toIsoDate(d),
      inMonth: d.getMonth() === currentMonth,
    });
  }

  // Tasks scheduled on selected date
  const selectedTasks = todoCtx?.tasksByDate[selectedDate] || [];

  const handleAddTaskForDate = () => {
    const trimmed = newTaskInput.trim();
    if (!trimmed || isSelectedPast) return;
    todoCtx?.addTask(trimmed, selectedDate);
    setNewTaskInput("");
  };

  const selectedDateObj = new Date(`${selectedDate}T12:00:00`);
  const selectedDateLabel = isNaN(selectedDateObj.getTime())
    ? selectedDate
    : selectedDateObj.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });

  return (
    <div className="todo-calendar-container">
      <div className="todo-calendar-header">
        <div className="todo-calendar-title-wrap">
          <h3 className="todo-calendar-month-title">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h3>
          {props?.note && <span className="todo-calendar-note">{props.note}</span>}
        </div>

        <div className="todo-calendar-nav">
          <button type="button" className="todo-calendar-today-btn" onClick={jumpToToday}>
            Today
          </button>
          <button type="button" className="todo-calendar-nav-btn" onClick={prevMonth} aria-label="Previous month">
            ‹
          </button>
          <button type="button" className="todo-calendar-nav-btn" onClick={nextMonth} aria-label="Next month">
            ›
          </button>
        </div>
      </div>

      <div className="todo-calendar-grid">
        <div className="todo-calendar-weekdays">
          {WEEKDAYS.map((w) => (
            <span key={w} className="todo-calendar-weekday">
              {w}
            </span>
          ))}
        </div>

        <div className="todo-calendar-days">
          {days.map(({ date, iso, inMonth }) => {
            const isToday = iso === todayIso;
            const isSelected = iso === selectedDate;
            const isPast = iso < todayIso;
            const dayTasks = todoCtx?.tasksByDate[iso] || [];
            const hasTasks =
              dayTasks.length > 0 ||
              (todoCtx && todoCtx.markedDates.has(iso)) ||
              (props?.markedDates && props.markedDates.includes(iso));

            // Top active (undone) task for this date
            // If the top task is completed, fall back to the next undone task!
            // If the user drags and switches positions, the new top task immediately replaces the other on the calendar!
            const activeTasks = dayTasks.filter((t) => !t.done);
            const topActiveTask = activeTasks[0];
            const singleWord = topActiveTask ? topActiveTask.title.trim().split(/\s+/)[0] : null;

            // Highlight with true circle (never oval) in bright red
            const showCircle = hasTasks || isSelected;

            return (
              <button
                key={iso}
                type="button"
                className={`todo-calendar-day ${inMonth ? "is-in-month" : "is-out"} ${
                  isSelected ? "is-selected" : ""
                } ${isToday ? "is-today" : ""} ${hasTasks ? "has-tasks" : ""} ${isPast ? "is-past" : ""}`}
                disabled={isPast && !hasTasks}
                onClick={() => {
                  todoCtx?.setSelectedDate(iso);
                  if (!inMonth) {
                    setCurrentMonth(date.getMonth());
                    setCurrentYear(date.getFullYear());
                  }
                }}
              >
                {/* 1. Single word on TOP of date number */}
                {singleWord ? (
                  <span className="todo-calendar-single-word" title={singleWord}>
                    {singleWord}
                  </span>
                ) : (
                  <span className="todo-calendar-single-word-spacer" />
                )}

                {/* 2. Circled date number below */}
                {showCircle ? (
                  <CalendarSketchCircle
                    seed={date.getDate() * 19 + 7}
                    stroke="#ff2442"
                    strokeWidth={isSelected ? 2.5 : 2.1}
                  >
                    <span className="todo-calendar-day-number">{date.getDate()}</span>
                  </CalendarSketchCircle>
                ) : (
                  <div className="todo-calendar-circle-wrap">
                    <span className="todo-calendar-day-number">{date.getDate()}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Focus & Quick Add Drawer */}
      <div className="todo-calendar-drawer">
        <div className="todo-calendar-drawer-header">
          <div className="todo-calendar-drawer-date">
            <span className="todo-calendar-drawer-label">{selectedDateLabel}</span>
            {selectedDate === todayIso && <span className="todo-calendar-today-badge">Today</span>}
            {isSelectedPast && <span className="todo-calendar-past-badge">Past Date</span>}
          </div>
          <span className="todo-calendar-drawer-count">
            {selectedTasks.length === 0 ? "No tasks on this day" : `${selectedTasks.length} scheduled`}
          </span>
        </div>

        {selectedTasks.length > 0 && (
          <div className="todo-calendar-task-list">
            {selectedTasks.map((task) => (
              <TodoRow
                key={task.id}
                task={task}
                isDone={task.done}
                onToggle={() => todoCtx?.toggleTask(task.id)}
                onEdit={(newTitle) => todoCtx?.editTask(task.id, newTitle)}
                onDelete={() => todoCtx?.deleteTask(task.id)}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", task.id);
                  e.dataTransfer.effectAllowed = "move";
                  setDrawerDraggedId(task.id);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (drawerDragOverId !== task.id) setDrawerDragOverId(task.id);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const sourceId = e.dataTransfer.getData("text/plain") || drawerDraggedId;
                  if (sourceId && sourceId !== task.id) {
                    todoCtx?.reorderTasks(sourceId, task.id);
                  }
                  setDrawerDraggedId(null);
                  setDrawerDragOverId(null);
                }}
                isDragging={drawerDraggedId === task.id}
                isDragOver={drawerDragOverId === task.id}
              />
            ))}
          </div>
        )}

        {/* Can only add todos on today or upcoming future dates */}
        {!isSelectedPast ? (
          <div className="todo-calendar-add-row">
            <input
              type="text"
              className="todo-calendar-add-input"
              placeholder={`Add task for ${selectedDateLabel}...`}
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTaskForDate();
                }
              }}
            />
            {newTaskInput.trim() && (
              <button
                type="button"
                className="todo-calendar-add-btn"
                onClick={handleAddTaskForDate}
              >
                Add
              </button>
            )}
          </div>
        ) : (
          <div className="todo-calendar-past-notice">
            Cannot add tasks to past dates — select today or upcoming days
          </div>
        )}
      </div>
    </div>
  );
}

function StatCardView({ props }: ComponentRenderProps<{ label?: string; value?: string; note?: string }>) {
  return (
    <div className="todo-stat-card">
      <span className="todo-stat-label">{props?.label}</span>
      <span className="todo-stat-value">{props?.value}</span>
      {props?.note && <span className="todo-stat-note">{props.note}</span>}
    </div>
  );
}

function StatsRowView({ props, renderNode }: ComponentRenderProps<{ stats?: unknown[] }>) {
  const stats = list(props?.stats);
  return (
    <div className="todo-stats-row">
      {stats.map((node, i) => (
        <Fragment key={i}>{renderNode(node) as React.ReactNode}</Fragment>
      ))}
    </div>
  );
}

function OptionView({ props }: ComponentRenderProps<{ label?: string; kind?: string }>) {
  const triggerAction = useTriggerAction();
  return (
    <button
      type="button"
      className="todo-option-pill"
      onClick={() => {
        if (props?.label) {
          triggerAction(props.label);
        }
      }}
    >
      {props?.label}
    </button>
  );
}

function QuestionView({ props, renderNode }: ComponentRenderProps<{ text?: string; options?: unknown[] }>) {
  const options = list(props?.options);
  return (
    <div className="todo-question-box">
      <h3 className="todo-question-text">{props?.text}</h3>
      <div className="todo-options-row">
        {options.map((node, i) => (
          <Fragment key={i}>{renderNode(node) as React.ReactNode}</Fragment>
        ))}
      </div>
    </div>
  );
}

function FollowUpsView({ props, renderNode }: ComponentRenderProps<{ options?: unknown[] }>) {
  const options = list(props?.options);
  if (options.length === 0) return null;
  return (
    <div className="todo-options-row">
      {options.map((node, i) => (
        <Fragment key={i}>{renderNode(node) as React.ReactNode}</Fragment>
      ))}
    </div>
  );
}

const MEAL_IMAGE_PRESETS: { keywords: RegExp; url: string }[] = [
  { keywords: /egg|toast|omelet|scramble|frittata|breakfast/i, url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80" },
  { keywords: /chicken|rice|quinoa|bowl|turkey|breast|lunch/i, url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80" },
  { keywords: /yogurt|berry|berries|parfait|casein|cottage|snack|midday/i, url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop&q=80" },
  { keywords: /salmon|fish|trout|tuna|poke|seafood|dinner/i, url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop&q=80" },
  { keywords: /steak|beef|meat|sirloin|ribeye/i, url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80" },
  { keywords: /oats|oatmeal|smoothie|shake|protein shake/i, url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop&q=80" },
];

const DEFAULT_MEAL_IMAGES = [
  "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop&q=80",
];

function resolveMealImage(name?: string, tag?: string, customUrl?: string, index: number = 0): string {
  if (customUrl && customUrl.startsWith("http") && customUrl.length > 15) return customUrl;
  const text = `${name || ""} ${tag || ""}`;
  for (const preset of MEAL_IMAGE_PRESETS) {
    if (preset.keywords.test(text)) return preset.url;
  }
  return DEFAULT_MEAL_IMAGES[index % DEFAULT_MEAL_IMAGES.length];
}

function MealCardView({
  props,
  index = 0,
}: ComponentRenderProps<{
  name?: string;
  protein?: string;
  calories?: string;
  tag?: string;
  imageUrl?: string;
  description?: string;
  note?: string;
}> & { index?: number }) {
  const resolved = useMemo(
    () => resolveMealImage(props?.name, props?.tag, props?.imageUrl, index),
    [props?.name, props?.tag, props?.imageUrl, index]
  );
  const [imgSrc, setImgSrc] = useState(resolved);
  const [imgFailed, setImgFailed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setImgSrc(resolved);
    setImgFailed(false);
  }, [resolved]);

  if (!props?.name) return null;

  return (
    <>
      <div
        className="todo-kyoto-deck-card"
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
      >
        <div className="todo-deck-card-image-wrap">
          <img
            src={imgFailed ? DEFAULT_MEAL_IMAGES[index % DEFAULT_MEAL_IMAGES.length] : imgSrc}
            alt={props.name}
            className="todo-deck-card-image"
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
          {props.note && <span className="todo-card-hand-note">{props.note}</span>}
        </div>

        <div className="todo-deck-card-content">
          <h4 className="todo-deck-card-title">
            <Marked text={props.name} />
          </h4>

          <div className="todo-deck-meta-row">
            {props.protein && (
              <span className="todo-deck-protein-tag">
                {props.protein}
              </span>
            )}
            {props.calories && (
              <span className="todo-deck-cal-tag">
                {props.calories}
              </span>
            )}
          </div>

          {props.description && (
            <p className="todo-deck-card-desc">{props.description}</p>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="todo-modal-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="todo-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="todo-modal-image-wrap">
              <img
                src={imgFailed ? DEFAULT_MEAL_IMAGES[index % DEFAULT_MEAL_IMAGES.length] : imgSrc}
                alt={props.name}
                className="todo-modal-image"
              />
              <button
                type="button"
                className="todo-modal-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="todo-modal-body">
              <h3 className="todo-modal-title">{props.name.replace(/==/g, "")}</h3>

              <div className="todo-card-pills">
                {props.protein && (
                  <span className="todo-pill todo-pill--protein">
                    <span className="todo-pill-dot" />
                    {props.protein}
                  </span>
                )}
                {props.calories && (
                  <span className="todo-pill todo-pill--calories">
                    {props.calories}
                  </span>
                )}
                {props.note && (
                  <span className="todo-modal-hand-aside">
                    {props.note}
                  </span>
                )}
              </div>

              {props.description && (
                <div className="todo-modal-section">
                  <span className="todo-card-cue-label">Nutritional breakdown & benefits</span>
                  <p className="todo-modal-desc">{props.description}</p>
                </div>
              )}

              <div className="todo-modal-section">
                <span className="todo-card-cue-label">Timing & absorption</span>
                <p className="todo-modal-desc">
                  Pair with 400–500ml water for digestive hydration. High leucine content activates the mTOR pathway to initiate cellular muscle protein synthesis within 45 minutes of consumption.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const EXERCISE_IMAGE_PRESETS: { keywords: RegExp; url: string }[] = [
  { keywords: /incline/i, url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80" },
  { keywords: /bench|chest|pec|flat/i, url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80" },
  { keywords: /overhead|military|shoulder/i, url: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=800&auto=format&fit=crop&q=80" },
  { keywords: /lateral|raise|delt/i, url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80" },
  { keywords: /tricep|pushdown|dip|skull|extension/i, url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80" },
  { keywords: /row|back|bent-over|lat/i, url: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=800&auto=format&fit=crop&q=80" },
  { keywords: /pull-up|pulldown|chin/i, url: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&auto=format&fit=crop&q=80" },
  { keywords: /bicep|curl|hammer/i, url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80" },
  { keywords: /squat|quad|leg|lunge/i, url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80" },
  { keywords: /deadlift|rdl|hamstring|hip/i, url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80" },
];

const DEFAULT_EXERCISE_IMAGES = [
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
];

function resolveExerciseImage(name?: string, muscle?: string, customUrl?: string, index: number = 0): string {
  if (customUrl && customUrl.startsWith("http") && customUrl.length > 15) return customUrl;
  const text = `${name || ""} ${muscle || ""}`;
  for (const preset of EXERCISE_IMAGE_PRESETS) {
    if (preset.keywords.test(text)) return preset.url;
  }
  return DEFAULT_EXERCISE_IMAGES[index % DEFAULT_EXERCISE_IMAGES.length];
}

function ExerciseCardView({
  props,
  index = 0,
}: ComponentRenderProps<{
  name?: string;
  setsReps?: string;
  muscle?: string;
  imageUrl?: string;
  cue?: string;
  note?: string;
}> & { index?: number }) {
  const resolved = useMemo(
    () => resolveExerciseImage(props?.name, props?.muscle, props?.imageUrl, index),
    [props?.name, props?.muscle, props?.imageUrl, index]
  );
  const [imgSrc, setImgSrc] = useState(resolved);
  const [imgFailed, setImgFailed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setImgSrc(resolved);
    setImgFailed(false);
  }, [resolved]);

  if (!props?.name) return null;

  return (
    <>
      <div
        className="todo-kyoto-deck-card"
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
      >
        <div className="todo-deck-card-image-wrap">
          <img
            src={imgFailed ? DEFAULT_EXERCISE_IMAGES[index % DEFAULT_EXERCISE_IMAGES.length] : imgSrc}
            alt={props.name}
            className="todo-deck-card-image"
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
          {props.note && <span className="todo-card-hand-note">{props.note}</span>}
        </div>

        <div className="todo-deck-card-content">
          <h4 className="todo-deck-card-title">{props.name}</h4>
          {props.setsReps && (
            <span className="todo-deck-sets-tag">
              {props.setsReps.replace(/^[⚡⏱\s]+/, "")}
            </span>
          )}
          {props.cue && (
            <p className="todo-deck-card-desc">{props.cue}</p>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="todo-modal-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="todo-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="todo-modal-image-wrap">
              <img
                src={imgFailed ? DEFAULT_EXERCISE_IMAGES[index % DEFAULT_EXERCISE_IMAGES.length] : imgSrc}
                alt={props.name}
                className="todo-modal-image"
              />
              <button
                type="button"
                className="todo-modal-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="todo-modal-body">
              <h3 className="todo-modal-title">{props.name}</h3>

              <div className="todo-card-pills">
                {props.setsReps && (
                  <span className="todo-pill todo-pill--sets">
                    {props.setsReps.replace(/^[⚡⏱\s]+/, "")}
                  </span>
                )}
                <span className="todo-pill todo-pill--calories">
                  2–3 min rest
                </span>
                {props.note && (
                  <span className="todo-modal-hand-aside">
                    {props.note}
                  </span>
                )}
              </div>

              {props.cue && (
                <div className="todo-modal-section">
                  <span className="todo-card-cue-label">Form & execution technique</span>
                  <p className="todo-modal-desc">{props.cue}</p>
                </div>
              )}

              <div className="todo-modal-section">
                <span className="todo-card-cue-label">Rest & recovery strategy</span>
                <p className="todo-modal-desc">
                  Take compound sets to RPE 8–9 (1 to 2 reps in reserve). Rest 2–3 minutes to replenish ATP-CP energy stores before the next heavy working set.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MacroSummaryView({
  props,
}: ComponentRenderProps<{
  bodyWeight?: string;
  proteinTarget?: string;
  formula?: string;
  calories?: string;
  carbs?: string;
  fats?: string;
  explanation?: string;
  note?: string;
}>) {
  if (!props) return null;

  // Compute realistic target range: 1.6g/kg (fitness/maintenance) to 2.2g/kg (pro/hypertrophy)
  const weightStr = props.bodyWeight || "60 kg";
  const num = parseFloat(weightStr.replace(/[^0-9.]/g, "")) || 60;
  const isLbs = /lbs?|pounds?/i.test(weightStr);
  const kg = isLbs ? num * 0.453592 : num;

  const minProtein = Math.round(kg * 1.6);
  const maxProtein = Math.round(kg * 2.2);

  // If proteinTarget already includes a range or number, use it; otherwise provide the standard range
  let targetDisplay = props.proteinTarget || `${minProtein}g – ${maxProtein}g / day`;
  if (!targetDisplay.includes("–") && !targetDisplay.includes("-") && !targetDisplay.includes("to")) {
    targetDisplay = `${minProtein}g – ${maxProtein}g / day`;
  }

  const formulaDisplay = props.formula || "1.6g – 2.2g per kg bodyweight";
  const cleanWeight = weightStr.replace(/bodyweight/i, "").trim();
  const explanationText =
    props.explanation ||
    `Aim for 1.6g/kg (~${minProtein}g) for steady daily fitness & recovery. 2.2g/kg (~${maxProtein}g) is for competitive athletes and pros during heavy progressive overload.`;

  return (
    <div className="todo-macro-summary-panel">
      <div className="todo-macro-header">
        <span className="todo-macro-bw-hand-note">BW - {cleanWeight}</span>
        <span className="todo-macro-hand-note">{props.note || "hypertrophy sweet spot"}</span>
      </div>

      <div className="todo-macro-hero">
        <div className="todo-macro-hero-value">
          <div className="todo-macro-circle-target">
            <span className="todo-macro-num">{targetDisplay}</span>
            <svg
              className="todo-macro-sketch-circle"
              viewBox="0 0 340 90"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M 14,45 C 14,18 70,8 170,8 C 270,8 326,20 326,45 C 326,70 260,82 170,82 C 60,82 10,70 12,47 C 14,24 80,12 180,11"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="todo-macro-sub">Target daily protein</span>
        </div>
        <span className="todo-macro-formula-hand-note">📐 {formulaDisplay}</span>
      </div>

      <div className="todo-macro-hand-explanation-box">
        <p className="todo-macro-hand-explanation-text">
          {explanationText}
        </p>
      </div>
    </div>
  );
}

function MealPlanView({
  props,
  renderNode,
}: ComponentRenderProps<{
  title?: string;
  meals?: unknown[];
  note?: string;
}>) {
  const meals = list(props?.meals);
  return (
    <div className="todo-editorial-deck-section">
      <div className="todo-deck-header">
        <h3 className="todo-deck-title">
          <Marked text={props?.title || "Hitting the ==daily mark=="} />
        </h3>
        <p className="todo-deck-hand-subtitle todo-deck-hand-subtitle--green">
          {props?.note || "spread across 3 to 4 balanced meals for sustained muscle protein synthesis"}
        </p>
      </div>

      <div className="todo-editorial-card-grid">
        {meals.map((node, i) => {
          const mealProps = getBlockProps(node);
          return (
            <MealCardView
              key={i}
              props={mealProps}
              renderNode={renderNode}
              index={i}
            />
          );
        })}
      </div>
    </div>
  );
}

function TrainingPlanView({
  props,
  renderNode,
}: ComponentRenderProps<{
  title?: string;
  focus?: string;
  exercises?: unknown[];
  note?: string;
}>) {
  const exercises = list(props?.exercises);
  return (
    <div className="todo-editorial-deck-section">
      <div className="todo-deck-header">
        <h3 className="todo-deck-title">{props?.title || "Push Day Hypertrophy Routine"}</h3>
        <p className="todo-deck-hand-subtitle">
          {props?.note || props?.focus || "arranged with optimal rest periods"}
        </p>
      </div>

      <div className="todo-editorial-card-grid">
        {exercises.map((node, i) => {
          const exProps = getBlockProps(node);
          return (
            <ExerciseCardView
              key={i}
              props={exProps}
              renderNode={renderNode}
              index={i}
            />
          );
        })}
      </div>
    </div>
  );
}

/** Extract initial tasks from statements in blocks */
function extractInitialTasks(blocks: unknown[]): {
  tasks: TodoTask[];
  headlineDate?: string;
  hasCalendar: boolean;
} {
  const tasks: TodoTask[] = [];
  let headlineDate: string | undefined;
  let headlineText = "";
  let listTitle = "";
  let hasCalendar = false;

  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    const typeName = getBlockTypeName(block);
    const props = getBlockProps(block);

    if (typeName === "TodoCalendar") {
      hasCalendar = true;
    }

    if (typeName === "DailyHeadline" && props?.text) {
      headlineText = props.text;
      headlineDate = parseDateFromText(props.text);
    }

    if (typeName === "TaskList" && props?.title) {
      listTitle = props.title;
    }
  }

  const baseDate = headlineDate ? new Date(`${headlineDate}T12:00:00`) : new Date();

  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    const typeName = getBlockTypeName(block);
    const props = getBlockProps(block);

    if (typeName === "TaskList" && props?.items) {
      const itemList = list(props.items);
      const isMultiDayOrSplit =
        /split|ppl|workout|\b\d+-day\b|routine|sprint|multi-day|gym|chest|back|legs|rest/i.test(`${headlineText} ${listTitle}`) ||
        itemList.some((item) => {
          const ip = getBlockProps(item);
          return /day\s*\d+|push|pull|legs|upper|lower|chest|back|bicep|tricep|squat|rest/i.test(ip?.title || "");
        });

      for (let i = 0; i < itemList.length; i++) {
        const item = itemList[i];
        if (!item || typeof item !== "object") continue;
        const ip = getBlockProps(item);
        if (ip?.title) {
          let date: string;
          let due = ip.due;

          if (ip.due) {
            date = parseDateFromText(ip.due, baseDate);
          } else if (isMultiDayOrSplit) {
            const d = new Date(baseDate);
            d.setDate(baseDate.getDate() + i);
            date = toIsoDate(d);
            due =
              i === 0
                ? "Today"
                : i === 1
                ? "Tomorrow"
                : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          } else {
            date = headlineDate || toIsoDate(baseDate);
          }

          // Deterministic task ID without Math.random to ensure stable React reconciliation
          const stableId =
            ip.id || `item-${i}-${(ip.title || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16)}`;

          tasks.push({
            id: stableId,
            title: ip.title,
            done: !!ip.done,
            priority: ip.priority,
            due,
            note: ip.note,
            date,
            source: "list",
          });
        }
      }
    }
  }

  return { tasks, headlineDate, hasCalendar };
}

function AgentActivityView() {
  return null;
}

function TodoBoardInner({
  blocks,
  renderNode,
  hasExplicitCalendar,
}: {
  blocks: unknown[];
  renderNode: (node: unknown) => unknown;
  hasExplicitCalendar: boolean;
}) {
  const explicitCalendarInBlocks = blocks.some((b: any) => getBlockTypeName(b) === "TodoCalendar");
  const hasTaskList = blocks.some((b: any) => getBlockTypeName(b) === "TaskList");
  const hasCalendar = hasExplicitCalendar || explicitCalendarInBlocks;

  return (
    <div className="todo-board-container">
      {blocks.map((node, i) => (
        <Fragment key={i}>{renderNode(node) as React.ReactNode}</Fragment>
      ))}

      {hasTaskList && !hasCalendar && (
        <TodoCalendarView
          props={{ title: "Schedule & Deadlines" }}
          renderNode={renderNode}
          statementId="todo-cal-auto"
        />
      )}
    </div>
  );
}

function TodoBoardView({ props, renderNode, statementId }: ComponentRenderProps<{ blocks?: unknown[] }>) {
  const blocks = list(props?.blocks);
  const { tasks, headlineDate, hasCalendar } = useMemo(() => extractInitialTasks(blocks), [blocks]);

  return (
    <TodoProvider key={statementId || "todo-board"} initialTasks={tasks} defaultDate={headlineDate}>
      <TodoBoardInner blocks={blocks} renderNode={renderNode} hasExplicitCalendar={hasCalendar} />
    </TodoProvider>
  );
}

export const todoLibrary = buildTodoLibrary({
  AgentActivity: AgentActivityView as never,
  DailyHeadline: DailyHeadlineView as never,
  FocusPull: FocusPullView as never,
  Heading: HeadingView as never,
  TaskCard: TaskCardView as never,
  TaskCards: TaskCardsView as never,
  TaskItem: TaskItemView as never,
  TaskList: TaskListView as never,
  TodoCalendar: TodoCalendarView as never,
  StatCard: StatCardView as never,
  StatsRow: StatsRowView as never,
  Question: QuestionView as never,
  Option: OptionView as never,
  FollowUps: FollowUpsView as never,
  MacroSummary: MacroSummaryView as never,
  MealPlan: MealPlanView as never,
  TrainingPlan: TrainingPlanView as never,
  MealCard: MealCardView as never,
  ExerciseCard: ExerciseCardView as never,
  TodoBoard: TodoBoardView as never,
});
